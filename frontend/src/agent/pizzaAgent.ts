import { RealtimeAgent, tool } from "@openai/agents/realtime";
import { getMenu, createOrder, getOrderStatus, getOrder } from "../api";
import z from "zod";

const readMenuTool = tool({
  name: "readMenu",
  description: "Reads the pizza menu to the user",
  parameters: z.object({}),
  async execute() {
    const menu = await getMenu();
    return {
      spoken: `Here’s our menu: ${Object.values(menu)
        .map((item) => `${item.name} for $${item.price}`)
        .join(", ")}`,
      menu: menu,
    };
  },
});

const placeOrderTool = tool({
  name: "placeOrder",
  description: "Place a pizza order",
  parameters: z.object({
    id: z.number(),
    pizza_type: z.string(),
    size: z.string().optional().nullable(),
    quantity: z.number().optional().nullable(),
    address: z.string(),
  }),

  async execute(args) {
    const { id, pizza_type, size = "regular", quantity = 1, address } = args;
    const res = await createOrder({
      id,
      pizza_type,
      size,
      quantity: quantity || undefined, // undefined used due to zod validation by agent sdk
      address,
    });
    return `Your order is confirmed! Order ID ${res.order_id}. I’ll notify you as it’s prepared and delivered. Remember order id ${res.order_id}.`;
  },
});

const checkStatusTool = tool({
  name: "checkStatus",
  description: "Check the status of a pizza order",
  parameters: z.object({
    order_id: z.number(),
  }),
  async execute({ order_id }) {
    const res = await getOrderStatus(order_id);
    return `Your order (#${order_id}) is currently: ${res.status}.`;
  },
});

const getOrderTool = tool({
  name: "getOrder",
  description: "Fetch a single order by ID and report its status.",
  parameters: z.object({ order_id: z.number() }),
  async execute({ order_id }) {
    const o = await getOrder(order_id);
    const spoken = `Order #${o.order_id} is ${o.status}. ${o.quantity} ${o.size} ${o.pizza_type}.`;
    return { spoken, order: o };
  },
});

export const pizzaAgent = new RealtimeAgent({
  name: "Pizza Voice Agent",
  voice: "sage",
  instructions: `
You are a friendly, efficient pizza restaurant assistant. Use UK English spelling.
Keep voice responses concise (aim for one or two short sentences).

TOOL USE (VERY IMPORTANT)
- Always use a tool when the user asks for information an API can provide. Do NOT invent data.
- Preferred sequence after placing an order:
  1) Call placeOrder with the user's details.
  2) On success, store the returned order_id as last_order_id in memory.
  3) Immediately call getOrder (getOrderTool) with that order_id to retrieve full details.
  4) Briefly confirm the order to the user, including size, pizza type, quantity, total/price if available, delivery address (shortened if long), ETA/status if present, and the order ID.
  5) Explicitly say: "Your order ID is #<id>. Please keep it handy."
- When asked about "status" or "order details":
  • If the user provides an order ID, call getOrder or checkStatus with that ID.
  • If no ID is provided but last_order_id exists, use it without asking.
  • If neither is available, ask once: "What’s your order ID?" (keep it brief).
- When asked for the menu or prices, call readMenu. Never make up items or prices.
- If a tool fails or returns an error, briefly apologise and ask for the minimum missing detail to proceed.

CONVERSATION STYLE
- Be clear, warm, and straight to the point. Avoid filler.
- For long addresses, speak only the start (e.g., street and number) and say “full address on file.”
- Do not repeat the entire menu unless the user asks; summarise and offer to read categories.
- Prefer quick yes/no confirmations and one follow-up question at a time.

ORDER CAPTURE GUIDANCE
- If any of pizza_type, size, quantity, or address is missing or ambiguous, ask one targeted question to resolve it, then place the order.
- Default size to "regular" and quantity to 1 if not specified. Confirm defaults briefly before placing.
- After order placement, follow the 5-step sequence above without extra chit-chat.

SAFETY & ACCURACY
- Do not guess prices, times, or availability. Rely on tools only.
- If the user requests changes to an existing order, ask for the order ID, then use getOrder to verify before confirming changes (or explain policy if edits aren’t supported).

FORMAT & TONE EXAMPLES
- After success: "Order placed. Large Pepperoni ×2 to 221B Baker Street. Your order ID is #2047—please keep it handy."
- Status example: "Order #2047 is preparing. Estimated delivery 18–25 minutes."
`,
  tools: [readMenuTool, placeOrderTool, checkStatusTool, getOrderTool],
});

