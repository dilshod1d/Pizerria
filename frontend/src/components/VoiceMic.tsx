import { FiMic } from "react-icons/fi";
import type { Mode } from "../types";

function VoiceMic({ mode = "idle" as Mode }) {
  const isL = mode === "listening";
  const isS = mode === "speaking";

  return (
    <div className="relative grid place-items-center">
      <div className="absolute -bottom-2 h-6 w-24 rounded-full bg-black/5 blur-xl" />
      <button
        aria-label="Voice"
        className="relative grid h-16 w-16 place-items-center rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.12)] overflow-hidden"
      >
        {!isL && !isS && (
          <span className="pointer-events-none absolute w-14 h-14 rounded-full bg-black/5 blur-xl animate-[idleBreath_2.8s_ease-in-out_infinite]" />
        )}
        {isL && (
          <>
            <span className="absolute rounded-full -inset-1 ring-2 ring-[rgba(198,40,40,0.55)] animate-[outRipple_1.6s_ease-out_infinite]" />
            <span className="absolute inset-0 rounded-full ring-1 ring-[rgba(198,40,40,0.35)]" />
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5 opacity-70">
              <i className="block w-0.5 h-2 bg-slate-900 animate-[eqFast_900ms_ease-in-out_infinite]" />
              <i className="block w-0.5 h-3 bg-slate-900 animate-[eqFast_900ms_ease-in-out_infinite] [animation-delay:100ms]" />
              <i className="block w-0.5 h-2 bg-slate-900 animate-[eqFast_900ms_ease-in-out_infinite] [animation-delay:200ms]" />
              <i className="block w-0.5 h-3 bg-slate-900 animate-[eqFast_900ms_ease-in-out_infinite] [animation-delay:300ms]" />
            </span>
          </>
        )}
        {isS && (
          <>
            <span className="absolute inset-0 rounded-full overflow-hidden">
              <span className="absolute inset-0 rounded-full bg-[rgba(184,134,11,0.18)] animate-[inRipple_1.8s_ease-in-out_infinite]" />
            </span>
            <svg className="absolute inset-0" viewBox="0 0 100 100" aria-hidden>
              <defs>
                <linearGradient id="g" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="rgba(184,134,11,0.0)" />
                  <stop offset="50%" stopColor="rgba(184,134,11,0.6)" />
                  <stop offset="100%" stopColor="rgba(184,134,11,0.0)" />
                </linearGradient>
              </defs>
              <g
                style={{ transformOrigin: "50px 50px" }}
                className="animate-[sweep_2.2s_linear_infinite]"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  stroke="url(#g)"
                  strokeWidth="2"
                  fill="none"
                />
              </g>
            </svg>
          </>
        )}
        <FiMic className="relative z-10 h-6 w-6 text-slate-900" />
      </button>

      <div className="mt-2 text-[12px] text-gray-500 h-4">
        {mode === "idle" && "Tap to speak"}
        {isL && "Listening"}
        {isS && "Assistant speaking"}
      </div>

      <style>{`
        @keyframes idleBreath { 0%,100% { transform: scale(0.95); opacity:.6 } 50% { transform: scale(1.05); opacity:.9 } }
        @keyframes outRipple { 0% { transform: scale(0.85); opacity:.9 } 100% { transform: scale(1.25); opacity:0 } }
        @keyframes inRipple { 0% { transform: scale(1.15); opacity:.55 } 100% { transform: scale(0.90); opacity:0 } }
        @keyframes sweep { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes eqFast { 0%,100% { transform: scaleY(.6) } 50% { transform: scaleY(1.4) } }
      `}</style>
    </div>
  );
}

export default VoiceMic;
