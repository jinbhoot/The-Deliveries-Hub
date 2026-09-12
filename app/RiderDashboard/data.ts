export type Order = { id: number; customer: string; phone: string; type: "Food" | "Grocery" | "Medicine"; item: string; address: string; amount: number; status: "Requested" | "Accepted" | "Picked up" | "Delivered"; billStatus?: "Requested" | "Received" }

export const orders: Order[] = [
  { id: 101, customer: "Ali Khan", phone: "0301 1234567", type: "Food", item: "Small Pizza", address: "123 Main Street, Sheikhupura", amount: 2200, status: "Requested" },
  { id: 102, customer: "Hina Ali", phone: "0302 7654321", type: "Medicine", item: "Prescription medicine", address: "College Road, Sheikhupura", amount: 1450, status: "Requested" },
  { id: 103, customer: "Hamza Ahmed", phone: "0303 4567890", type: "Food", item: "4 Burgers, 2 Fries, 2 Coke", address: "Civil Lines, Sheikhupura", amount: 2600, status: "Accepted" },
  { id: 104, customer: "Sana Malik", phone: "0304 9876543", type: "Grocery", item: "Weekly grocery basket", address: "Railway Colony, Sheikhupura", amount: 3100, status: "Delivered" },
]
