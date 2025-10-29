import type { MenuItem } from "../types/types";
import Glass from "./Glass";

function ProductCard({ menuItem }: { menuItem: MenuItem }) {
  const { image, name, description, price } = menuItem;
  return (
    <Glass className="overflow-hidden animate-[sheetIn_.36s_cubic-bezier(.2,.7,.2,1)]">
      <img src={image} alt={name} className="h-28 w-full object-cover" />
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="text-[13px] font-semibold text-slate-900">{name}</div>
          <div className="text-[13px] font-semibold text-slate-900">
            {price}$
          </div>
        </div>
        <div className="mt-1 text-[12px] text-slate-600">{description}</div>
        {/* <div className="mt-3 flex items-center justify-end">
          <button className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white bg-slate-900">
            Add
          </button>
        </div> */}
      </div>
    </Glass>
    // <Glass className="overflow-hidden">
    //   <div className="flex gap-3 p-3">
    //     <img
    //       src={menuItem.image}
    //       alt={menuItem.name}
    //       className="h-16 w-16 rounded-xl object-cover border border-black/5"
    //     />
    //     <div className="min-w-0">
    //       <div className="text-[14px] font-semibold text-slate-900">
    //         {menuItem.name}
    //       </div>
    //       <div className="text-[12px] text-slate-500 truncate">
    //         {menuItem.description}
    //       </div>
    //       <div className="mt-1 text-[13px] font-medium">{menuItem.price}</div>
    //     </div>
    //   </div>
    // </Glass>
  );
}

export default ProductCard;
