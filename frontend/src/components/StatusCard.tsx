import { FiClock } from "react-icons/fi";
import Glass from "./Glass";
import StatusRow from "./StatusRow";

function StatusCard({ step = 2 }: { step?: 1 | 2 | 3 | 4 | 5 }) {
  const is = (n: number) => step === n;
  const done = (n: number) => step > n;
  return (
    <Glass className="p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-900">Order status</div>
        <div className="text-[11px] text-slate-500">
          <FiClock className="inline h-3 w-3 -mt-0.5" /> 25–35m
        </div>
      </div>
      <div className="mt-2 space-y-3">
        <StatusRow
          label="Received"
          time="17:02"
          done={done(1)}
          active={is(1)}
        />
        <StatusRow
          label="Preparing"
          time={done(2) ? "17:05" : "—"}
          done={done(2)}
          active={is(2)}
        />
        <StatusRow
          label="Baking"
          time={done(3) ? "17:15" : "—"}
          done={done(3)}
          active={is(3)}
        />
        <StatusRow
          label="Out for delivery"
          time={done(4) ? "17:28" : "—"}
          done={done(4)}
          active={is(4)}
        />
        <StatusRow
          label="Delivered"
          time={done(5) ? "17:52" : "—"}
          done={done(5)}
          active={is(5)}
        />
      </div>
    </Glass>
  );
}

export default StatusCard;
