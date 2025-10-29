import { FiCheckCircle, FiCircle } from "react-icons/fi";

function StatusRow({
  label,
  time,
  active,
  done,
}: {
  label: string;
  time: string;
  active?: boolean;
  done?: boolean;
}) {
  return (
    <div className="relative pl-6">
      <div className="absolute left-0 top-1.5">
        {done ? (
          <FiCheckCircle className="h-4 w-4 text-emerald-600" />
        ) : active ? (
          <FiCircle className="h-4 w-4 text-agent" />
        ) : (
          <FiCircle className="h-4 w-4 text-slate-300" />
        )}
      </div>
      <div className="text-[13px] font-medium text-slate-900">{label}</div>
      <div className="text-[11px] text-slate-500">{time}</div>
    </div>
  );
}

export default StatusRow;
