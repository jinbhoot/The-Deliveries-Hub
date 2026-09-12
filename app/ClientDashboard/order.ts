export type OrderItem = {
  name: string;
  provider: string;
  price: number;
};

export type DeliveryOrder = {
  total: number;
  items: OrderItem[];
  customer: {
    fullName?: string;
    phone?: string;
    pickup?: string;
    address?: string;
  };
};

export const ORDER_REVIEW_KEY = "deliveryHubOrderReview";
export const PENDING_ORDER_KEY = "deliveryHubPendingOrder";

export function readStoredOrder(key: string): DeliveryOrder | null {
  if (typeof window === "undefined") return null;

  try {
    const value = sessionStorage.getItem(key);
    return value ? (JSON.parse(value) as DeliveryOrder) : null;
  } catch {
    return null;
  }
}
