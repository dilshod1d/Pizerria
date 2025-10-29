import { useRef } from "react";
import { useTranscript } from "../context/TranscriptContext";
import type { Menu, Order } from "../types/types";
import { v4 as uuidv4 } from "uuid";

export function useHandleSessionHistory() {
  const {
    addTranscriptMessage,
    updateTranscriptMessage,
    updateTranscriptItem,
  } = useTranscript();

  const extractMessageText = (content: any[] = []): string => {
    if (!Array.isArray(content)) return "";

    return content
      .map((c) => {
        if (!c || typeof c !== "object") return "";
        if (c.type === "input_text") return c.text ?? "";
        if (c.type === "audio") return c.transcript ?? "";
        return "";
      })
      .filter(Boolean)
      .join("\n");
  };

  const maybeParseJson = (val: any) => {
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        console.warn("Failed to parse JSON:", val);
        return val;
      }
    }
    return val;
  };

  /* ----------------------- event handlers ------------------------- */

  function handleAgentToolEnd(
    details: any,
    _agent: any,
    _functionCall: any,
    result: any
  ) {
    const parsed = maybeParseJson(result);
    if (_functionCall?.name === "readMenu" && parsed?.menu) {
      const id = uuidv4().slice(0, 32);
      addTranscriptMessage(
        id,
        "assistant",
        "",
        "MENU",
        false,
        parsed.menu as Menu
      );
    }

    if (_functionCall?.name === "getOrder" && parsed?.order) {
      const id = uuidv4().slice(0, 32);
      addTranscriptMessage(
        id,
        "assistant",
        "",
        "ORDER",
        false,
        parsed.order as Order
      );
    }
  }

  function handleHistoryAdded(item: any) {
    if (!item || item.type !== "message") return;

    const { itemId, role, content = [] } = item;
    if (itemId && role) {
      const isUser = role === "user";
      let text = extractMessageText(content);

      if (isUser && !text) {
        text = "[Transcribing...]";
      }

      addTranscriptMessage(itemId, role, text, "MESSAGE");
    }
  }

  function handleHistoryUpdated(items: any[]) {
    items.forEach((item: any) => {
      if (!item || item.type !== "message") return;

      const { itemId, content = [] } = item;

      const text = extractMessageText(content);

      if (text) {
        updateTranscriptMessage(itemId, text, false);
      }
    });
  }

  function handleTranscriptionDelta(item: any) {
    const itemId = item.item_id;
    const deltaText = item.delta || "";
    if (itemId) {
      updateTranscriptMessage(itemId, deltaText, true);
    }
  }

  function handleTranscriptionCompleted(item: any) {
    // History updates don't reliably end in a completed item,
    // so we need to handle finishing up when the transcription is completed.
    const itemId = item.item_id;
    const finalTranscript =
      !item.transcript || item.transcript === "\n"
        ? "[inaudible]"
        : item.transcript;
    if (itemId) {
      updateTranscriptMessage(itemId, finalTranscript, false);
      updateTranscriptItem(itemId, { status: "DONE" });
    }
  }

  const handlersRef = useRef({
    handleAgentToolEnd,
    handleHistoryUpdated,
    handleHistoryAdded,
    handleTranscriptionDelta,
    handleTranscriptionCompleted,
  });

  return handlersRef;
}
