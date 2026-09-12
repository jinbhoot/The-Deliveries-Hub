export type Order = {
  id: string;
  category: string;
  pickupAddress: string;
  deliveryAddress: string;
  rider: string;
  placedAt: string;
  status: "Delivered" | "Pending" | "In progress";
  total: string;
};

export type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  joinedAt: string;
  status: "Active" | "Inactive";
  orders: Order[];
};

export const clients: Client[] = [
  {
    id: "ali",
    name: "Ali",
    phone: "0300-1234567",
    email: "ali@mail.com",
    address: "12 Model Town, Lahore",
    joinedAt: "12 June 2026",
    status: "Active",
    orders: [
      {
        id: "#2011",
        category: "Grocery",
        pickupAddress: "Green Valley Mart, Model Town",
        deliveryAddress: "12 Model Town, Lahore",
        rider: "Haroon",
        placedAt: "28 August 2026, 10:30 AM",
        status: "Delivered",
        total: "Rs. 1,850",
      },
      {
        id: "#1988",
        category: "Food",
        pickupAddress: "The Spice Kitchen, Gulberg",
        deliveryAddress: "12 Model Town, Lahore",
        rider: "Hassan",
        placedAt: "17 August 2026, 7:15 PM",
        status: "Delivered",
        total: "Rs. 980",
      },
    ],
  },
  {
    id: "ahmed",
    name: "Ahmed",
    phone: "0312-7654321",
    email: "ahmed@mail.com",
    address: "44 Canal Road, Lahore",
    joinedAt: "3 July 2026",
    status: "Inactive",
    orders: [
      {
        id: "#2014",
        category: "Medicine",
        pickupAddress: "HealthPlus Pharmacy, DHA",
        deliveryAddress: "44 Canal Road, Lahore",
        rider: "Ali",
        placedAt: "29 August 2026, 2:00 PM",
        status: "Pending",
        total: "Rs. 2,200",
      },
    ],
  },
];

export function getClientById(id: string) {
  return clients.find((client) => client.id === id);
}
