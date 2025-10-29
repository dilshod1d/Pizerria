import Glass from "./Glass";

function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 justify-end">
      <Glass>
        <div className="max-w-[88%] px-3 py-2 text-[13px] leading-relaxed text-white bg-slate-900 rounded-2xl">
          {children}
        </div>
      </Glass>
      <div className="h-7 w-7 rounded-lg grid place-items-center text-xs bg-slate-200 text-slate-700">
        U
      </div>
    </div>
  );
}

export default UserMessage;
