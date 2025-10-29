import axios from "axios";
import type { Order, OrderCreateRequest, OrderCreateResponse } from "../types";
import type { Menu } from "../types";

export const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

export async function getMenu(): Promise<Menu> {
  const res = await api.get<Menu>(`${API_URL}/menu`);
  return res.data;
}

export async function createOrder(payload: OrderCreateRequest) {
  const res = await api.post<OrderCreateResponse>(`${API_URL}/orders`, payload);
  return res.data;
}

export async function getOrder(orderId: number): Promise<Order> {
  const { data } = await api.get<Order>(`/orders/${orderId}`);
  return data;
}

export async function getOrderStatus(orderId: number) {
  const res = await api.get<Order>(`${API_URL}/orders/${orderId}`);
  return res.data;
}

export async function getEphemeralKey(): Promise<string> {
  const res = await api.post(`${API_URL}/realtime/ephemeral`);
  const data = res.data;

  const token: string | undefined = data?.client_secret?.value;

  if (!token) {
    throw new Error(
      "No ephemeral client token in /realtime/ephemeral response"
    );
  }

  return token;
}
