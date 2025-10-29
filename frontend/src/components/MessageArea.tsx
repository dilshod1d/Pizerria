import { useEffect } from "react";
import Glass from "./Glass";
import { FiSend, FiX } from "react-icons/fi";

interface MessageAreaProps {
  inputOpen: boolean;
  userText: string;
  setUserText: (text: string) => void;
  onSend: () => void;
  onClose: () => void;
}

function MessageArea({
  inputOpen,
  userText,
  setUserText,
  onSend,
  onClose,
}: MessageAreaProps) {
  // Close on Esc
  useEffect(() => {
    if (!inputOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inputOpen, onClose]);

  return (
    <>
      <div
        className={[
          "fixed inset-0 z-20 bg-transparent",
          "transition-opacity duration-300",
          inputOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={onClose}
        aria-hidden="true"
        role="presentation"
      />

      <div
        className={[
          "fixed inset-x-0 bottom-0 z-30",
          "transition-transform duration-300 ease-out",
          inputOpen ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
      >
        <div className="mx-auto max-w-sm px-6 pb-4">
          <Glass className="p-2">
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-lg p-2 hover:bg-white/10 active:scale-95 transition"
              >
                <FiX className="h-5 w-5" />
              </button>
              <input
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                placeholder="Type your request…"
                className="flex-1 bg-transparent outline-none px-3 py-2 text-[14px] placeholder:text-slate-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSend();
                }}
              />
              <button
                onClick={onSend}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium text-white bg-slate-900 active:scale-[.98] transition"
              >
                <FiSend className="h-4 w-4" />
                Send
              </button>
            </div>
          </Glass>
        </div>
      </div>
    </>
  );
}

export default MessageArea;
