import Glass from "./Glass";
import Slice from "./Slice";

function AgentMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <div className="h-7 w-7 rounded-lg grid place-items-center text-white bg-user">
        <Slice />
      </div>
      <Glass>
        <div className="max-w-[88%] px-3 py-2 text-[13px] leading-relaxed">
          {children}
        </div>
      </Glass>
    </div>
  );
}

export default AgentMessage;
