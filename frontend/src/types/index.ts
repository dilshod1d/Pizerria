export type SessionStatus = "DISCONNECTED" | "CONNECTING" | "CONNECTED";

export interface ToolParameterProperty {
  type: string;
  description?: string;
  enum?: string[];
  pattern?: string;
  properties?: Record<string, ToolParameterProperty>;
  required?: string[];
  additionalProperties?: boolean;
  items?: ToolParameterProperty;
}

export interface ToolParameters {
  type: string;
  properties: Record<string, ToolParameterProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface Tool {
  type: "function";
  name: string;
  description: string;
  parameters: ToolParameters;
}

export interface AgentConfig {
  name: string;
  publicDescription: string; // gives context to agent transfer tool
  instructions: string;
  tools: Tool[];
  toolLogic?: Record<
    string,
    (args: any, transcriptLogsFiltered: TranscriptItem[]) => Promise<any> | any
  >;

  downstreamAgents?:
    | AgentConfig[]
    | { name: string; publicDescription: string }[];
}

export type AllAgentConfigsType = Record<string, AgentConfig[]>;

export type TranscriptItemType = "MESSAGE" | "BREADCRUMB" | "MENU" | "ORDER";

export interface TranscriptItem {
  itemId: string;
  type: TranscriptItemType;
  role?: "user" | "assistant";
  title?: string;
  data?: Record<string, any>;
  expanded: boolean;
  timestamp: string;
  createdAtMs: number;
  status: "IN_PROGRESS" | "DONE";
  isHidden: boolean;
}

export type Mode = "idle" | "listening" | "speaking";

export type MessageType =
  | "fromUser"
  | "fromAssistant"
  | "products"
  | "order"
  | "status";

export type MenuItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
};

export type Menu = Record<string, MenuItem>;

export type OrderStatus = "created" | "preparing" | "done" | "delivered";

export interface OrderCreateRequest {
  id: number;
  pizza_type: string;
  size?: string | null;
  quantity?: number;
  address: string;
}

export interface OrderCreateResponse {
  order_id: number;
}

export interface Order {
  order_id: number;
  pizza_type: string;
  size: string | null;
  quantity: number;
  address: string;
  status: OrderStatus;
}
