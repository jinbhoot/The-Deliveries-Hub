import { orders, type Order } from "./data"

const storageKey = "deliveries-hub-rider-orders"
const changeEvent = "deliveries-hub-rider-orders-changed"
let cachedValue: string | null = null
let cachedOrders: Order[] | null = null

export function getRiderOrders(): Order[] {
  if (typeof window === "undefined") return orders

  const savedOrders = window.localStorage.getItem(storageKey)
  if (!savedOrders) return orders
  if (savedOrders === cachedValue && cachedOrders) return cachedOrders

  try {
    cachedValue = savedOrders
    cachedOrders = JSON.parse(savedOrders) as Order[]
    return cachedOrders
  } catch {
    return orders
  }
}

export function saveRiderOrders(updatedOrders: Order[]) {
  cachedValue = JSON.stringify(updatedOrders)
  cachedOrders = updatedOrders
  window.localStorage.setItem(storageKey, cachedValue)
  window.dispatchEvent(new Event(changeEvent))
}

export function subscribeToRiderOrders(callback: () => void) {
  window.addEventListener(changeEvent, callback)
  return () => window.removeEventListener(changeEvent, callback)
}
