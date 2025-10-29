import { useEffect, useMemo, useRef, useState } from "react";
import { BsKeyboard } from "react-icons/bs";
import { FiX } from "react-icons/fi";
import type { MenuItem, Order, SessionStatus } from "../types";
import { useRealtimeSession } from "../hooks/useRealtimeSession";
import { useTranscript } from "../context/TranscriptContext";
import { pizzaAgent } from "../agent/pizzaAgent";
import { getEphemeralKey } from "../api";
import Header from "../components/Header";
import MessageArea from "../components/MessageArea";
import UserMessage from "../components/UserMessage";
import AgentMessage from "../components/AgentMessage";
import VoiceMic from "../components/VoiceMic";
import ProductCard from "../components/ProductCard";
import OrderDetails from "../components/OrderDetails";

function renderTranscriptItem(item: any) {
  if (item.isHidden) return null;

  if (item.type !== "MESSAGE" && item.type !== "MENU" && item.type !== "ORDER")
    return null;

  if (item.type === "MENU") {
    const menu = item.data;
    return menu.map((menuItem: MenuItem) => {
      return <ProductCard menuItem={menuItem} />;
    });
  }

  if (item.type === "ORDER") {
    const order = item.data;
    return <OrderDetails order={order} />;
  }

  if (item.type === "ORDERS") {
    const orders = item.data;
    return orders.map((order: Order) => {
      return <OrderDetails order={order} />;
    });
  }

  const text = item.title ?? "";
  if (!text) return null;

  if (item.role === "user")
    return <UserMessage key={item.itemId}>{text}</UserMessage>;
  return <AgentMessage key={item.itemId}>{text}</AgentMessage>;
}

export default function HomePage() {
  const { transcriptItems } = useTranscript();
  const [sessionStatus, setSessionStatus] =
    useState<SessionStatus>("DISCONNECTED");
  const [userText, setUserText] = useState("");
  const [inputOpen, setInputOpen] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Hidden audio element used by SDK playback
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const sdkAudioElement = useMemo(() => {
    const el = document.createElement("audio");
    el.autoplay = true;
    el.style.display = "none";
    document.body.appendChild(el);
    return el;
  }, []);

  useEffect(() => {
    if (sdkAudioElement && !audioElementRef.current)
      audioElementRef.current = sdkAudioElement;
  }, [sdkAudioElement]);

  // Hook that controls speaking/listening/idle mode
  const { connect, disconnect, sendUserText, interrupt, mode } =
    useRealtimeSession({
      onConnectionChange: (s) => setSessionStatus(s as SessionStatus),
    });

  // Autoscroll on new messages
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [transcriptItems.length]);

  // Connect helpers
  const connectToRealtime = async () => {
    if (sessionStatus !== "DISCONNECTED") return;
    setSessionStatus("CONNECTING");
    try {
      const token = await getEphemeralKey();
      if (!token) throw new Error("No ephemeral key from server");

      await connect({
        getEphemeralKey: async () => token,
        initialAgents: [pizzaAgent],
        audioElement: sdkAudioElement,
        extraContext: {},
      });
    } catch (e) {
      console.error("Connect failed:", e);
      setSessionStatus("DISCONNECTED");
    }
  };

  const disconnectFromRealtime = () => {
    disconnect();
    setSessionStatus("DISCONNECTED");
  };

  const onToggleConnection = () => {
    if (sessionStatus === "CONNECTED" || sessionStatus === "CONNECTING") {
      disconnectFromRealtime();
    } else {
      connectToRealtime();
    }
  };

  // Send typed text using your session
  const onSend = () => {
    const txt = userText.trim();
    if (!txt) return;
    interrupt(); // stop TTS if mid-speech
    sendUserText(txt); // hook will shift mode to listening/speaking via meter + transport
    setUserText("");
  };

  return (
    <div className="relative min-h-dvh bg-bg text-ink">
      {/* Header */}
      <Header sessionStatus={sessionStatus} />

      {/* Chat list (dynamic from transcriptItems) */}
      <main className="mx-auto max-w-sm px-6 pb-40 pt-4">
        <div
          ref={listRef}
          className="min-h-[60vh] max-h-[70vh] overflow-y-auto space-y-3"
        >
          {transcriptItems.filter((it) => it.type === "MESSAGE" && !it.isHidden)
            .length === 0 ? (
            <AgentMessage>
              Hi. Say a pizza and I’ll handle the rest—menu, order, and status.
            </AgentMessage>
          ) : (
            transcriptItems.map(renderTranscriptItem)
          )}
        </div>
      </main>

      {/* Bottom dock */}
      <div className="fixed inset-x-0 bottom-4 z-20">
        <div className="mx-auto max-w-sm relative px-6">
          <button
            aria-label="Keyboard"
            onClick={() => setInputOpen((v) => !v)}
            className="absolute right-6 bottom-0 grid h-12 w-12 place-items-center rounded-xl border border-black/10 bg-white text-slate-700 shadow-[0_2px_10px_rgba(0,0,0,0.06)] active:scale-[.98] transition"
          >
            {inputOpen ? (
              <FiX className="h-5 w-5" />
            ) : (
              <BsKeyboard className="h-5 w-5" />
            )}
          </button>

          <div
            onClick={onToggleConnection}
            className="grid place-items-center cursor-pointer"
          >
            <VoiceMic mode={mode} />
          </div>
        </div>
      </div>

      <MessageArea
        inputOpen={inputOpen}
        userText={userText}
        setUserText={setUserText}
        onSend={onSend}
        onClose={() => setInputOpen(false)}
      />
    </div>
  );
}
