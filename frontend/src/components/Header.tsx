import { FiWifi, FiWifiOff } from "react-icons/fi";
import type { SessionStatus } from "../types";
import Slice from "./Slice";

function Header({ sessionStatus }: { sessionStatus: SessionStatus }) {
  return (
    <header className="sticky top-0 z-10 bg-linear-to-b from-[rgba(252,252,253,0.9)] to-[rgba(252,252,253,0.6)] backdrop-blur">
      <div className="mx-auto max-w-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-black/5 grid place-items-center">
            <Slice />
          </div>
          <span className="text-sm font-semibold text-user">La Pizzeria</span>
        </div>
        <span
          className={`text-xs inline-flex items-center gap-1 ${
            sessionStatus === "CONNECTED"
              ? "text-emerald-600"
              : sessionStatus === "CONNECTING"
              ? "text-amber-600"
              : "text-slate-500"
          }`}
          title={sessionStatus}
        >
          {sessionStatus === "CONNECTED" ? (
            <FiWifi className="h-3 w-3" />
          ) : (
            <FiWifiOff className="h-3 w-3" />
          )}
          {sessionStatus.toLowerCase()}
        </span>
      </div>
    </header>
  );
}

export default Header;
