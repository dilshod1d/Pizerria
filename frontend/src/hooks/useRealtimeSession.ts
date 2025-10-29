import { useCallback, useRef, useState } from "react";
import {
  RealtimeSession,
  RealtimeAgent,
  OpenAIRealtimeWebRTC,
} from "@openai/agents/realtime";
import type { Mode, SessionStatus } from "../types/types";
import { useHandleSessionHistory } from "./useHandleSessionHistory";
import { pizzaAgent } from "../agent/pizzaAgent";

const SPEAK_DECAY_MS = 500;
const METER_HZ = 12;
const ENERGY_THRESHOLD = 0.022;
function rmsEnergy(buf: Float32Array) {
  let sum = 0;
  for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
  return Math.sqrt(sum / buf.length);
}

type MeterState = {
  ac?: AudioContext;
  src?: MediaStreamAudioSourceNode;
  analyser?: AnalyserNode;
  buf?: Float32Array;
  timer?: number;
  lastEnergeticAt?: number;
};

export interface RealtimeSessionCallbacks {
  onConnectionChange?: (status: SessionStatus) => void;
  onAgentHandoff?: (agentName: string) => void;
}

export interface ConnectOptions {
  getEphemeralKey: () => Promise<string>;
  initialAgents: RealtimeAgent[];
  audioElement?: HTMLAudioElement;
  extraContext?: Record<string, any>;
}

export function useRealtimeSession(callbacks: RealtimeSessionCallbacks = {}) {
  const meter = useRef<MeterState>({});
  const sessionRef = useRef<RealtimeSession | null>(null);
  const [status, setStatus] = useState<SessionStatus>("DISCONNECTED");
  const [mode, setMode] = useState<Mode>("idle");

  const historyHandlers = useHandleSessionHistory().current;

  // small anti-flicker timers
  const timers = useRef<{ speak?: number; listenGrace?: number }>({});

  const setModeSafe = (m: Mode) => setMode((prev) => (prev === m ? prev : m));

  const updateStatus = useCallback(
    (s: SessionStatus) => {
      setStatus(s);
      callbacks.onConnectionChange?.(s);
    },
    [callbacks]
  );

  const attachPlaybackMeter = useCallback((audio?: HTMLAudioElement) => {
    if (!audio) return () => {};

    const tryAttach = () => {
      const ms = audio.srcObject as MediaStream | null;
      if (!ms) return;
      if (meter.current.ac) return;

      const ac = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const src = ac.createMediaStreamSource(ms);
      const analyser = ac.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.8;

      const buf = new Float32Array(analyser.fftSize);
      src.connect(analyser);

      meter.current = { ac, src, analyser, buf, lastEnergeticAt: 0 };
      const tick = () => {
        const m = meter.current;
        if (!m.analyser || !m.buf) return;

        // Read new audio energy
        m.analyser.getFloatTimeDomainData(m.buf);
        const energy = rmsEnergy(m.buf);
        const now = performance.now();

        // Assistant audio is producing sound (above noise threshold)
        if (!audio.paused && energy > ENERGY_THRESHOLD) {
          m.lastEnergeticAt = now;
          if (mode !== "speaking") setModeSafe("speaking");
          return;
        }

        // Assistant audio still playing but quiet
        const last = m.lastEnergeticAt || 0;
        if (!audio.paused && now - last < SPEAK_DECAY_MS) {
          // still speaking due to hold window
          return;
        }

        // If audio is still playing but low energy for too long → listening
        if (!audio.paused) {
          if (mode !== "listening") setModeSafe("listening");
          return;
        }

        // Audio paused/ended → idle mode
        if (mode !== "idle") {
          setModeSafe("idle");
        }
      };

      meter.current.timer = window.setInterval(tick, 1000 / METER_HZ);
    };

    // Attach now and on first playback
    tryAttach();

    const onPlay = () => {
      meter.current.ac?.resume?.();
      tryAttach();
      setModeSafe("speaking");
    };
    const onStopLike = () => {
      setModeSafe("idle");
      if (meter.current) meter.current.lastEnergeticAt = 0;
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("playing", onPlay);
    audio.addEventListener("ended", onStopLike);
    audio.addEventListener("pause", onStopLike);
    audio.addEventListener("emptied", onStopLike);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("playing", onPlay);
      audio.removeEventListener("ended", onStopLike);
      audio.removeEventListener("pause", onStopLike);
      audio.removeEventListener("emptied", onStopLike);

      if (meter.current.timer) window.clearInterval(meter.current.timer);
      try {
        meter.current.src?.disconnect();
        meter.current.analyser?.disconnect();
        meter.current.ac?.close();
      } catch {
        // We do not console log on production its demo only
        console.log("Failed to close audio context");
      }
      meter.current = {};
    };
  }, []);

  const bindSessionEvents = useCallback(
    (s: RealtimeSession) => {
      s.on("error", (err: any) => console.log(err));

      // history only
      s.on("agent_tool_start", historyHandlers.handleAgentToolStart);
      s.on("agent_tool_end", historyHandlers.handleAgentToolEnd);
      s.on("history_updated", historyHandlers.handleHistoryUpdated);
      s.on("history_added", historyHandlers.handleHistoryAdded);

      s.on("transport_event", (event: any) => {
        switch (event.type) {
          case "conversation.item.input_audio_transcription.delta":
          case "response.audio_transcript.delta": {
            historyHandlers.handleTranscriptionDelta?.(event);
            break;
          }
          case "conversation.item.input_audio_transcription.completed":
          case "response.audio_transcript.done": {
            historyHandlers.handleTranscriptionCompleted?.(event);
            break;
          }

          case "response.audio.delta":
          case "response.output_audio.delta": {
            setModeSafe("speaking");
            break;
          }

          case "response.completed":
          case "response.output_audio.done":
          case "response.audio.done": {
            break;
          }

          case "input_audio_buffer.speech_started": {
            setModeSafe("listening");
            break;
          }
          case "input_audio_buffer.speech_stopped": {
            break;
          }
        }
      });
    },
    [historyHandlers]
  );

  const bindAudioElement = useCallback((audio?: HTMLAudioElement) => {
    if (!audio) return () => {};
    const onPlay = () => setModeSafe("speaking");
    const onPlaying = () => setModeSafe("speaking");
    const settleToIdle = () => setModeSafe("idle");

    audio.addEventListener("play", onPlay);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("ended", settleToIdle);
    audio.addEventListener("pause", settleToIdle);
    audio.addEventListener("emptied", settleToIdle);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("ended", settleToIdle);
      audio.removeEventListener("pause", settleToIdle);
      audio.removeEventListener("emptied", settleToIdle);
    };
  }, []);

  const connect = useCallback(
    async ({
      getEphemeralKey,
      audioElement,
      extraContext,
      outputGuardrails,
    }: ConnectOptions) => {
      if (sessionRef.current) return; // already connected
      updateStatus("CONNECTING");

      const ek = await getEphemeralKey();

      const transport = new OpenAIRealtimeWebRTC({ audioElement });
      const session = new RealtimeSession(pizzaAgent, {
        transport,
        config: {
          inputAudioTranscription: { model: "gpt-4o-mini-transcribe" },
        },
        // outputGuardrails: outputGuardrails ?? [],
        // context: extraContext ?? {},
      });

      // bind listeners NOW (don’t wait for a React effect)
      bindSessionEvents(session);
      // const cleanupAudio = bindAudioElement(audioElement);
      // inside connect()
      const cleanupAudio = attachPlaybackMeter(audioElement);
      // @ts-expect-error internal
      session.__cleanupAudio = cleanupAudio;

      // store for cleanup
      // @ts-expect-error internal
      // session.__cleanupAudio = cleanupAudio;

      await session.connect({ apiKey: ek });

      sessionRef.current = session;
      updateStatus("CONNECTED");
      setModeSafe("idle");
    },
    [bindAudioElement, bindSessionEvents, updateStatus]
  );

  const disconnect = useCallback(() => {
    // cleanup timers
    if (timers.current.speak) window.clearTimeout(timers.current.speak);
    if (timers.current.listenGrace)
      window.clearTimeout(timers.current.listenGrace);
    timers.current = {};

    // cleanup audio listeners
    // @ts-expect-error internal
    sessionRef.current?.__cleanupAudio?.();

    sessionRef.current?.close();
    sessionRef.current = null;
    setModeSafe("idle");
    updateStatus("DISCONNECTED");
  }, [updateStatus]);

  const assertconnected = () => {
    if (!sessionRef.current) throw new Error("RealtimeSession not connected");
  };

  const interrupt = useCallback(() => {
    sessionRef.current?.interrupt();
    setModeSafe("idle");
  }, []);

  const sendUserText = useCallback((text: string) => {
    assertconnected();
    setModeSafe("listening"); // immediate UI feedback
    sessionRef.current!.sendMessage(text);
    // will move to speaking via audio/transport events
  }, []);

  const sendEvent = useCallback((ev: any) => {
    sessionRef.current?.transport.sendEvent(ev);
  }, []);

  const mute = useCallback((m: boolean) => {
    sessionRef.current?.mute(m);
  }, []);

  const pushToTalkStart = useCallback(() => {
    if (!sessionRef.current) return;
    setModeSafe("listening");
    sessionRef.current.transport.sendEvent({
      type: "input_audio_buffer.clear",
    } as any);
  }, []);

  const pushToTalkStop = useCallback(() => {
    if (!sessionRef.current) return;
    sessionRef.current.transport.sendEvent({
      type: "input_audio_buffer.commit",
    } as any);
    sessionRef.current.transport.sendEvent({ type: "response.create" } as any);
    // speaking transition handled by audio/transport
  }, []);

  return {
    status,
    mode, // <- bind this to <SiriPulseOrb mode={mode} />
    connect,
    disconnect,
    sendUserText,
    sendEvent,
    mute,
    pushToTalkStart,
    pushToTalkStop,
    interrupt,
  } as const;
}
