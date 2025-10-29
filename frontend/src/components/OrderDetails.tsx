import type { Order, OrderStatus } from "../types";
import Glass from "./Glass";

function statusClasses(status: OrderStatus) {
  switch (status) {
    case "created":
      return "bg-slate-100 text-slate-700 ring-slate-200";
    case "preparing":
      return "bg-amber-100 text-amber-800 ring-amber-200";
    case "done":
      return "bg-emerald-100 text-emerald-800 ring-emerald-200";
    case "delivered":
      return "bg-blue-100 text-blue-800 ring-blue-200";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
}

function cap(s?: string | null) {
  if (!s) return "Regular";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

type Props = { order: Order };

export default function OrderDetails({ order }: Props) {
  return (
    <Glass>
      <div className="flex items-center justify-between gap-2">
        <div
          id={`order-${order.order_id}-title`}
          className="text-[15px] font-semibold text-slate-900"
        >
          Order summary
        </div>
        <div className="shrink-0 text-[11px] font-medium text-slate-500">
          #{order.order_id}
        </div>
      </div>

      {/* Main row (what, qty, address, status) */}
      <div className="mt-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[14px] font-medium text-slate-900">
              {cap(order.size)} {order.pizza_type}
            </div>

            <div className="mt-[2px] flex flex-wrap items-center gap-x-2 text-[12px] text-slate-500">
              <span>Qty: {order.quantity}</span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
              <span
                className="truncate max-w-[18ch] sm:max-w-[28ch]"
                title={order.address}
              >
                {order.address}
              </span>
            </div>
          </div>

          <span
            className={[
              "ml-1 inline-flex shrink-0 items-center rounded-full px-2 py-1 text-[11px] font-medium ring-1",
              "whitespace-nowrap select-none",
              statusClasses(order.status),
            ].join(" ")}
            aria-live="polite"
            title={order.status}
          >
            {order.status}
          </span>
        </div>
      </div>
    </Glass>
  );
}
