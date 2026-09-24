"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NotificationBell from "@/components/NotificationBell";
import Logo from "@/components/Logo";


type SubcategoryRecord = {
  _id: string;
  name: string;
  category: {
    _id: string;
    name: string;
  };
};

type Item = {
  _id?: string;
  name: string;
  provider: string;
  price: number;
  icon?: string;
  image?: string;
  description?: string;
  inStock?: boolean;
  category?: { _id: string; name: string } | string;
  subcategory?: { _id: string; name: string } | string | null;
};

type CartItem = Item & {
  uid: string;
  quantity?: number;
};


const STATIC_CATALOG: Record<
  string,
  { label: string; icon: string; subcategories: Record<string, Item[]> }
> = {
  food: {
    label: "Food",
    icon: "🍔",
    subcategories: {
      "Chinese Food": [
        { name: "Chicken Chow Mein", provider: "China Town Restaurant", price: 650, icon: "🍜" },
        { name: "Kung Pao Chicken", provider: "China Town Restaurant", price: 720, icon: "🥡" },
        { name: "Egg Fried Rice", provider: "Wok This Way", price: 450, icon: "🍚" },
        { name: "Chicken Dumplings", provider: "Wok This Way", price: 480, icon: "🥟" },
        { name: "Hot & Sour Soup", provider: "China Town Restaurant", price: 380, icon: "🍲" },
      ],
      "Fast Food": [
        { name: "Zinger Burger", provider: "KFC", price: 520, icon: "🍔" },
        { name: "Loaded Cheese Pizza", provider: "Pizza Point", price: 1250, icon: "🍕" },
        { name: "Crispy Fries", provider: "KFC", price: 300, icon: "🍟" },
        { name: "Club Sandwich", provider: "Cafe Aylanto", price: 590, icon: "🥪" },
        { name: "Grilled Chicken Wrap", provider: "Subway", price: 480, icon: "🌯" },
      ],
      "Desi Food": [
        { name: "Chicken Biryani", provider: "Student Biryani", price: 350, icon: "🍛" },
        { name: "Mutton Karahi", provider: "Bundu Khan", price: 1800, icon: "🍖" },
        { name: "Chicken Seekh Kabab", provider: "Bundu Khan", price: 650, icon: "🍢" },
        { name: "Garlic Naan", provider: "Bundu Khan", price: 80, icon: "🫓" },
        { name: "Halwa Puri Thali", provider: "Anda Bhurji Corner", price: 320, icon: "🍽️" },
      ],
    },
  },
  medicine: {
    label: "Medicine",
    icon: "💊",
    subcategories: {
      Syrups: [
        { name: "Cough Syrup", provider: "D.Watson Pharmacy", price: 180 },
        { name: "Benadryl Syrup", provider: "Servaid Pharmacy", price: 210 },
        { name: "Tixylix Syrup", provider: "D.Watson Pharmacy", price: 195 },
        { name: "Calpol Syrup", provider: "Servaid Pharmacy", price: 175 },
        { name: "Rigix Syrup", provider: "D.Watson Pharmacy", price: 165 },
      ],
      Injections: [
        { name: "Dicloran Injection", provider: "D.Watson Pharmacy", price: 85 },
        { name: "Rocephin Injection", provider: "Servaid Pharmacy", price: 390 },
        { name: "Neurobion Injection", provider: "D.Watson Pharmacy", price: 165 },
        { name: "Clexane Injection", provider: "Servaid Pharmacy", price: 650 },
        { name: "Insulin Injection", provider: "D.Watson Pharmacy", price: 980 },
      ],
      Tablets: [
        { name: "Panadol Extra", provider: "Servaid Pharmacy", price: 120, icon: "💊" },
        { name: "Brufen 400mg", provider: "D.Watson Pharmacy", price: 95, icon: "💊" },
        { name: "Disprin Tablets", provider: "Servaid Pharmacy", price: 60, icon: "💊" },
        { name: "Augmentin 625mg", provider: "D.Watson Pharmacy", price: 520 },
        { name: "Flagyl 400mg", provider: "Servaid Pharmacy", price: 85 },
      ],
    },
  },
  grocery: {
    label: "Grocery",
    icon: "🛒",
    subcategories: {
      "Cooking Oil": [
        { name: "Dalda Cooking Oil", provider: "Metro Cash & Carry", price: 890, icon: "🛢️" },
        { name: "CanOlive Sunflower Oil", provider: "Metro Cash & Carry", price: 950, icon: "🛢️" },
      ],
      "General Grocery": [
        { name: "Sugar", provider: "Al-Fatah Supermarket", price: 180, icon: "🍬" },
        { name: "Milkpak Milk", provider: "Al-Fatah Supermarket", price: 220, icon: "🥛" },
      ],
      "Kitchen Staples": [
        { name: "Super Basmati Rice", provider: "Metro Cash & Carry", price: 480, icon: "🍚" },
        { name: "Wheat Flour (Atta)", provider: "Al-Fatah Supermarket", price: 350, icon: "🌾" },
      ],
    },
  },
};

const PROVIDERS: Record<string, string[]> = {
  food: ["China Town Restaurant", "Wok This Way", "Dragon Wok", "Asian Wok"],
  medicine: ["D.Watson Pharmacy", "Servaid Pharmacy", "Health Mart Pharmacy", "MediCare Pharmacy"],
  grocery: ["Metro Cash & Carry", "Al-Fatah Supermarket", "Carrefour", "Imtiaz Super Market"],
};

const DEFAULT_CATALOG_IMAGES: Record<string, string> = {
  // Food - Fast Food
  "Zinger Burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=180&auto=format&fit=crop&q=50",
  "Crispy Chicken Burger": "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=180&auto=format&fit=crop&q=50",
  "Loaded Cheese Pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=180&auto=format&fit=crop&q=50",
  "Supreme Pizza Large": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=180&auto=format&fit=crop&q=50",
  "Crispy Fries": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=180&auto=format&fit=crop&q=50",
  "Loaded Cheese Fries": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=180&auto=format&fit=crop&q=50",
  "Club Sandwich": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=180&auto=format&fit=crop&q=50",
  "Grilled Chicken Wrap": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=180&auto=format&fit=crop&q=50",

  // Food - Chinese
  "Chicken Chow Mein": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=180&auto=format&fit=crop&q=50",
  "Kung Pao Chicken": "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=180&auto=format&fit=crop&q=50",
  "Egg Fried Rice": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=180&auto=format&fit=crop&q=50",
  "Chicken Dumplings": "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=180&auto=format&fit=crop&q=50",
  "Hot & Sour Soup": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=180&auto=format&fit=crop&q=50",

  // Food - Desi
  "Chicken Biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=180&auto=format&fit=crop&q=50",
  "Chicken Biryani Special": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=180&auto=format&fit=crop&q=50",
  "Mutton Karahi": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=180&auto=format&fit=crop&q=50",
  "Mutton Karahi Half": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=180&auto=format&fit=crop&q=50",
  "Chicken Seekh Kabab": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=180&auto=format&fit=crop&q=50",
  "Seekh Kabab Plate": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=180&auto=format&fit=crop&q=50",
  "Garlic Naan": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=180&auto=format&fit=crop&q=50",
  "Halwa Puri Thali": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=180&auto=format&fit=crop&q=50",

  // Medicine - Tablets
  "Panadol Extra": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=180&auto=format&fit=crop&q=50",
  "Panadol 500mg (Strip of 10)": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=180&auto=format&fit=crop&q=50",
  "Brufen 400mg": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=180&auto=format&fit=crop&q=50",
  "Disprin Tablets": "https://images.unsplash.com/photo-1550572017-ed2428583616?w=180&auto=format&fit=crop&q=50",
  "Disprin Extra (Pack of 10)": "https://images.unsplash.com/photo-1550572017-ed2428583616?w=180&auto=format&fit=crop&q=50",
  "Augmentin 625mg": "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=180&auto=format&fit=crop&q=50",
  "Augmentin 625mg (Box of 14)": "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=180&auto=format&fit=crop&q=50",
  "Flagyl 400mg": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=180&auto=format&fit=crop&q=50",

  // Medicine - Syrups
  "Cough Syrup": "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=180&auto=format&fit=crop&q=50",
  "Hydryllin Cough Syrup 120ml": "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=180&auto=format&fit=crop&q=50",
  "Sancos Cough Formula 120ml": "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=180&auto=format&fit=crop&q=50",
  "Benadryl Syrup": "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=180&auto=format&fit=crop&q=50",
  "Calpol Syrup": "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=180&auto=format&fit=crop&q=50",
  "CAC 1000 Plus Calcium 10s": "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=180&auto=format&fit=crop&q=50",

  // Medicine - First Aid & Essentials
  "Dettol Antiseptic Liquid 100ml": "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=180&auto=format&fit=crop&q=50",
  "Digital Body Thermometer": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtJaf2KaOMEeMWu4uIk3CG7XylzO4z3KV4_nnm4E_tEdroNjtfxlL4sME&s=10",
  "Waterproof Bandage Strips (Pack of 20)": "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=180&auto=format&fit=crop&q=50",

  // Grocery
  "Dalda Cooking Oil": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=180&auto=format&fit=crop&q=50",
  "Dalda Cooking Oil 1 Litre Pouch": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=180&auto=format&fit=crop&q=50",
  "Sufi Banaspati Ghee 1kg": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=180&auto=format&fit=crop&q=50",
  "CanOlive Sunflower Oil": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=180&auto=format&fit=crop&q=50",
  "Extra Virgin Olive Oil 500ml": "https://images.unsplash.com/photo-1541256942802-7b29631f4967?w=180&auto=format&fit=crop&q=50",
  "Super Basmati Rice": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=180&auto=format&fit=crop&q=50",
  "Super Kernel Basmati Rice 5kg": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=180&auto=format&fit=crop&q=50",
  "Sugar": "https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=180&auto=format&fit=crop&q=50",
  "Refined White Sugar 1kg": "https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=180&auto=format&fit=crop&q=50",
  "Wheat Flour (Atta)": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=180&auto=format&fit=crop&q=50",
  "Chakki Fresh Atta 10kg": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=180&auto=format&fit=crop&q=50",
  "Milkpak Milk": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=180&auto=format&fit=crop&q=50",
  "Olper's Full Cream Milk 1 Litre": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=180&auto=format&fit=crop&q=50",
  "Lays French Cheese Chips 60g": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=180&auto=format&fit=crop&q=50",
  "Coca-Cola 1.5 Litre Bottle": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=180&auto=format&fit=crop&q=50",
};

function getItemImage(item: Item, categoryName?: string): string {
  // 1. First check exact name mapping in DEFAULT_CATALOG_IMAGES
  if (DEFAULT_CATALOG_IMAGES[item.name]) {
    return DEFAULT_CATALOG_IMAGES[item.name];
  }

  // 2. If explicit URL or base64 provided in database item
  if (
    item.image &&
    (item.image.startsWith("http") ||
      item.image.startsWith("data:image") ||
      item.image.startsWith("/"))
  ) {
    return item.image;
  }

  // 3. Keyword heuristic match
  const n = item.name.toLowerCase();
  if (n.includes("burger"))
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=180&auto=format&fit=crop&q=50";
  if (n.includes("pizza"))
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=180&auto=format&fit=crop&q=50";
  if (n.includes("fries"))
    return "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=180&auto=format&fit=crop&q=50";
  if (n.includes("biryani") || n.includes("rice") || n.includes("pulao"))
    return "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=180&auto=format&fit=crop&q=50";
  if (
    n.includes("karahi") ||
    n.includes("handi") ||
    n.includes("curry") ||
    n.includes("gravy")
  )
    return "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=180&auto=format&fit=crop&q=50";
  if (
    n.includes("kabab") ||
    n.includes("kebab") ||
    n.includes("bbq") ||
    n.includes("tikka")
  )
    return "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=180&auto=format&fit=crop&q=50";
  if (n.includes("chow mein") || n.includes("noodles") || n.includes("pasta"))
    return "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=180&auto=format&fit=crop&q=50";
  if (
    n.includes("panadol") ||
    n.includes("tablet") ||
    n.includes("capsule") ||
    n.includes("disprin") ||
    n.includes("brufen")
  )
    return "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=180&auto=format&fit=crop&q=50";
  if (n.includes("syrup") || n.includes("liquid") || n.includes("tonic"))
    return "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=180&auto=format&fit=crop&q=50";
  if (
    n.includes("dettol") ||
    n.includes("sanitizer") ||
    n.includes("antiseptic")
  )
    return "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=180&auto=format&fit=crop&q=50";
  if (n.includes("oil") || n.includes("ghee"))
    return "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=180&auto=format&fit=crop&q=50";
  if (n.includes("sugar") || n.includes("salt") || n.includes("spice"))
    return "https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=180&auto=format&fit=crop&q=50";
  if (n.includes("atta") || n.includes("flour") || n.includes("wheat"))
    return "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=180&auto=format&fit=crop&q=50";
  if (n.includes("milk") || n.includes("dairy") || n.includes("cheese"))
    return "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=180&auto=format&fit=crop&q=50";
  if (
    n.includes("coke") ||
    n.includes("cola") ||
    n.includes("drink") ||
    n.includes("juice") ||
    n.includes("beverage")
  )
    return "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=180&auto=format&fit=crop&q=50";
  if (n.includes("chip") || n.includes("snack") || n.includes("lays"))
    return "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=180&auto=format&fit=crop&q=50";

  const cat = (categoryName || "").toLowerCase();
  if (cat.includes("food"))
    return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=180&auto=format&fit=crop&q=50";
  if (cat.includes("med"))
    return "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=180&auto=format&fit=crop&q=50";
  if (cat.includes("groc"))
    return "https://images.unsplash.com/photo-1542838132-92c53300491e?w=180&auto=format&fit=crop&q=50";

  return "";
}


export default function ClientDashboardPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>("food");
  const [activeSubcategory, setActiveSubcategory] = useState("Chinese Food");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    pickup: "",
    address: "",
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // Draggable Floating Cart State
  const [cartPos, setCartPos] = useState<{ x: number; y: number } | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
  });

  // Active Rider Bill Payment Request Alert
  const [activeRiderAlert, setActiveRiderAlert] = useState<{
    orderId: string;
    riderName: string;
    amount: number;
  } | null>(null);

  // API states
  const [dbItems, setDbItems] = useState<Item[]>([]);
  const [dbCategories, setDbCategories] = useState<{ _id: string; name: string }[]>([]);
  const [dbSubcategories, setDbSubcategories] = useState<SubcategoryRecord[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState("");

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag from handle or container (not buttons or inputs)
    const target = e.target as HTMLElement;
    if (target.closest("button") && !target.closest(".drag-handle")) {
      return;
    }

    const currentX = cartPos?.x ?? Math.max(10, (typeof window !== "undefined" ? window.innerWidth : 800) / 2 - 250);
    const currentY = cartPos?.y ?? Math.max(10, (typeof window !== "undefined" ? window.innerHeight : 600) - 100);

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: currentX,
      posY: currentY,
    };
    setIsDragging(true);

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - dragStartRef.current.startX;
      const dy = moveEvent.clientY - dragStartRef.current.startY;
      const newX = Math.max(10, Math.min((typeof window !== "undefined" ? window.innerWidth : 800) - 340, dragStartRef.current.posX + dx));
      const newY = Math.max(10, Math.min((typeof window !== "undefined" ? window.innerHeight : 600) - 80, dragStartRef.current.posY + dy));
      setCartPos({ x: newX, y: newY });
    };

    const onPointerUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  // Fetch items, categories, subcategories, active orders, and user profile on mount
  useEffect(() => {
    async function loadData() {
      setLoadingCatalog(true);
      setCatalogError("");
      try {
        const [itemsRes, catRes, subsRes, meRes, ordersRes] = await Promise.all([
          fetch("/api/items"),
          fetch("/api/categories"),
          fetch("/api/subcategories"),
          fetch("/api/auth/me"),
          fetch("/api/orders", { cache: "no-store" }).catch(() => null),
        ]);

        const [itemsText, catText, subsText, meText, ordersText] = await Promise.all([
          itemsRes.text().catch(() => ""),
          catRes.text().catch(() => ""),
          subsRes.text().catch(() => ""),
          meRes.text().catch(() => ""),
          ordersRes ? ordersRes.text().catch(() => "") : Promise.resolve(""),
        ]);

        const itemsData = itemsText ? JSON.parse(itemsText) : null;
        const catData = catText ? JSON.parse(catText) : null;
        const subsData = subsText ? JSON.parse(subsText) : null;
        const meData = meText ? JSON.parse(meText) : null;
        const ordersData = ordersText ? JSON.parse(ordersText) : null;

        if (itemsData?.success && Array.isArray(itemsData.data)) {
          setDbItems(itemsData.data);
        }

        if (catData?.success && Array.isArray(catData.data)) {
          setDbCategories(catData.data);
        }

        if (subsData?.success && Array.isArray(subsData.data)) {
          setDbSubcategories(subsData.data);
        }

        if (meData?.success && meData.data) {
          setForm((prev) => ({
            ...prev,
            fullName: meData.data.fullName || prev.fullName,
            phone: meData.data.phone || prev.phone,
          }));
        }

        if (ordersData?.success && Array.isArray(ordersData.data)) {
          const pendingBillOrder = ordersData.data.find(
            (o: { billStatus?: string; isPaid?: boolean; status?: string; rider?: { fullName?: string }; totalAmount?: number; _id: string }) =>
              o.billStatus === "Requested" && !o.isPaid && o.status !== "Cancelled"
          );
          if (pendingBillOrder) {
            setActiveRiderAlert({
              orderId: pendingBillOrder._id,
              riderName: pendingBillOrder.rider?.fullName || "Assigned Rider",
              amount: pendingBillOrder.totalAmount || 0,
            });
          }
        }
      } catch (err) {
        console.error("Error loading catalog data:", err);
        setCatalogError("Failed to load catalog from server. Using local catalog.");
      } finally {
        setLoadingCatalog(false);
      }
    }

    loadData();
  }, []);


  // Compute categories list
  const categoriesList = useMemo(() => {
    if (dbCategories.length > 0) {
      return dbCategories.map((c) => ({
        key: c.name.toLowerCase(),
        id: c._id,
        label: c.name,
        icon:
          c.name.toLowerCase().includes("food")
            ? "🍔"
            : c.name.toLowerCase().includes("med")
            ? "💊"
            : c.name.toLowerCase().includes("groc")
            ? "🛒"
            : "📦",
      }));
    }
    return [
      { key: "food", id: "food", label: "Food", icon: "🍔" },
      { key: "medicine", id: "medicine", label: "Medicine", icon: "💊" },
      { key: "grocery", id: "grocery", label: "Grocery", icon: "🛒" },
    ];
  }, [dbCategories]);

  // Current category subcategories (dynamic from DB + fallback)
  const subcategories = useMemo(() => {
    const activeCatObj = categoriesList.find((c) => c.key === activeCategory);
    const dbSubsForActive = dbSubcategories.filter(
      (s) =>
        s.category?._id === activeCatObj?.id ||
        s.category?.name?.toLowerCase() === activeCategory
    );

    if (dbSubsForActive.length > 0) {
      return ["All Items", ...dbSubsForActive.map((s) => s.name)];
    }

    if (STATIC_CATALOG[activeCategory]) {
      return ["All Items", ...Object.keys(STATIC_CATALOG[activeCategory].subcategories)];
    }
    return ["All Items"];
  }, [activeCategory, dbSubcategories, categoriesList]);

  // Current displayed items
  const displayedItems = useMemo(() => {
    const activeCatObj = categoriesList.find((c) => c.key === activeCategory);

    const matchingDb = dbItems.filter((item) => {
      const catId =
        typeof item.category === "object" && item.category !== null
          ? item.category._id
          : item.category;
      const catName =
        typeof item.category === "object" && item.category !== null
          ? item.category.name.toLowerCase()
          : String(item.category || "").toLowerCase();

      const matchesCategory =
        catId === activeCatObj?.id ||
        catName === activeCategory ||
        catName.includes(activeCategory);

      if (!matchesCategory) return false;

      if (activeSubcategory && activeSubcategory !== "All Items") {
        const subName =
          typeof item.subcategory === "object" && item.subcategory !== null
            ? item.subcategory.name
            : String(item.subcategory || "");
        return subName.toLowerCase() === activeSubcategory.toLowerCase();
      }

      return true;
    });

    if (matchingDb.length > 0) {
      return matchingDb.map((item) => ({
        ...item,
        provider:
          item.description ||
          (typeof item.category === "object" ? item.category?.name : "Partner"),
      }));
    }

    const staticGroup = STATIC_CATALOG[activeCategory];
    if (staticGroup) {
      if (activeSubcategory === "All Items") {
        return Object.values(staticGroup.subcategories).flat();
      }
      return staticGroup.subcategories[activeSubcategory] || [];
    }

    return dbItems;
  }, [dbItems, activeCategory, activeSubcategory, categoriesList]);


  // Dynamic Delivery Charges Calculation
  const calculation = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

    const categoriesSet = new Set<string>();
    cart.forEach((c) => {
      const catVal =
        typeof c.category === "object" && c.category !== null
          ? c.category.name
          : typeof c.category === "string"
          ? c.category
          : c.provider || "General";
      categoriesSet.add(catVal.toLowerCase());
    });
    const uniqueCategoriesCount = Math.max(1, categoriesSet.size);

    if (subtotal <= 0 || totalQuantity <= 0) {
      return {
        subtotal: 0,
        baseDeliveryFee: 0,
        extraItemCharge: 0,
        extraCategoryCharge: 0,
        totalDeliveryCharges: 0,
        finalBill: 0,
        totalQuantity: 0,
        uniqueCategoriesCount: 0,
      };
    }

    // 1. Base Delivery Fee
    let baseDeliveryFee = 250;
    if (subtotal > 10000) {
      baseDeliveryFee = 500;
    } else if (subtotal > 5000) {
      baseDeliveryFee = 400;
    } else if (subtotal > 3000) {
      baseDeliveryFee = 300;
    } else {
      baseDeliveryFee = 250;
    }

    // 2. Extra Item Charge: (Number of Items - 1) * Rs. 50
    const extraItemCharge = Math.max(0, totalQuantity - 1) * 50;

    // 3. Extra Category Charge: (Number of Different Categories - 1) * Rs. 100
    const extraCategoryCharge = Math.max(0, uniqueCategoriesCount - 1) * 100;

    const totalDeliveryCharges = baseDeliveryFee + extraItemCharge + extraCategoryCharge;
    const finalBill = subtotal + totalDeliveryCharges;

    return {
      subtotal,
      baseDeliveryFee,
      extraItemCharge,
      extraCategoryCharge,
      totalDeliveryCharges,
      finalBill,
      totalQuantity,
      uniqueCategoriesCount,
    };
  }, [cart]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  function changeCategory(category: string) {
    setActiveCategory(category);
    setActiveSubcategory("All Items");
  }


  function addToCart(item: Item) {
    setCart((current) => [
      ...current,
      { ...item, category: activeCategory, quantity: 1, uid: `${Date.now()}-${Math.random()}` },
    ]);
    setForm((current) => ({
      ...current,
      pickup: `${item.provider || "Store"} — ${item.name}`,
    }));
    showToast(`${item.name} added to ticket`);
  }

  function removeFromCart(uid: string) {
    setCart((current) => current.filter((item) => item.uid !== uid));
  }

  function openMyOrders() {
    router.push("/ClientDashboard/myorders");
  }


  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOrderError("");
    setOrderSuccess("");

    const phonePattern = /^[0-9+\-\s]{7,15}$/;
    const newErrors = {
      fullName: form.fullName.trim().length <= 1,
      phone: !phonePattern.test(form.phone.trim()),
      pickup: form.pickup.trim().length <= 1,
      address: form.address.trim().length <= 3,
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) return;

    if (cart.length === 0) {
      setOrderError("Add at least one item before submitting.");
      return;
    }

    setSubmittingOrder(true);
    try {
      const formattedItems = cart.map((cartItem) => {
        let itemId = cartItem._id;
        if (!itemId) {
          const match = dbItems.find((d) => d.name === cartItem.name);
          itemId = match?._id || dbItems[0]?._id;
        }

        return {
          item: itemId,
          name: cartItem.name,
          price: cartItem.price,
          quantity: cartItem.quantity || 1,
        };
      });

      const payload = {
        items: formattedItems,
        deliveryAddress: form.address.trim(),
        paymentMethod: "Card",
        categoryCount: calculation.uniqueCategoriesCount,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resText = await response.text().catch(() => "");
      let result: { success?: boolean; data?: { _id: string }; message?: string } | null = null;
      try {
        result = resText ? JSON.parse(resText) : null;
      } catch {
        result = null;
      }


      if (response.status === 401) {
        router.push("/login?redirectTo=/ClientDashboard");
        return;
      }

      if (!response.ok || !result?.success || !result?.data?._id) {
        setOrderError(result?.message || "Failed to place order. Please try again.");
        setSubmittingOrder(false);
        return;
      }

      const orderId = result.data._id;
      setOrderSuccess("Delivery request placed successfully! A rider will accept your request and notify you for payment.");
      setCart([]);

      setTimeout(() => {
        setIsCartOpen(false);
        router.push(`/ClientDashboard/myorders?id=${orderId}`);
      }, 900);

    } catch (err) {
      console.error("Submit order error:", err);
      setOrderError("Could not connect to the server. Please try again.");
      setSubmittingOrder(false);
    }
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Proceed to login
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Responsive Top Header */}
      <header className="sticky top-0 z-40 border-b border-white/20 bg-orange-500 text-white shadow-sm">
        <div className="mx-auto max-w-[1400px] flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3.5 gap-2">
          {/* Brand */}
          <Link href="/ClientDashboard" className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center justify-center rounded-xl bg-white p-1 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Deliveries Hub"
                className="h-7 sm:h-8 w-auto object-contain rounded-md"
              />
            </div>
            <div>
              <p className="text-base sm:text-lg font-black leading-tight">Deliveries Hub</p>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-orange-100">
                Client Dashboard
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-2 text-xs font-bold" aria-label="Desktop client navigation">
            <Link
              href="/"
              className="rounded-full border border-white/40 px-3.5 py-1.5 hover:bg-white/15 transition"
            >
              Home
            </Link>
            <button
              onClick={openMyOrders}
              className="rounded-full border border-white/40 px-3.5 py-1.5 hover:bg-white/15 transition cursor-pointer"
            >
              My Orders
            </button>
            <Link
              href="/ClientDashboard/Report"
              className="rounded-full border border-white/40 px-3.5 py-1.5 hover:bg-white/15 transition"
            >
              Report
            </Link>
          </nav>

          {/* Right Action Icons (Bell, Ticket, Logout) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Real-time Push Notification Bell */}
            <NotificationBell theme="orange" />

            {/* Cart Ticket Toggle */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 px-2.5 sm:px-3 py-1.5 text-xs font-black transition flex items-center gap-1 cursor-pointer"
              title="View Cart Ticket"
            >
              <span>🧾</span>
              <span className="hidden sm:inline">Ticket</span>
              {cart.length > 0 && (
                <span className="flex size-4 items-center justify-center rounded-full bg-white text-[10px] font-black text-orange-600">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={logout}
              className="rounded-xl bg-white px-2.5 sm:px-3 py-1.5 text-xs font-bold text-orange-600 hover:bg-orange-50 shadow-xs transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Sub-Navigation Bar */}
        <div className="flex md:hidden items-center justify-around border-t border-white/15 bg-orange-600/30 px-2 py-1.5 text-xs font-bold">
          <Link
            href="/"
            className="px-2.5 py-1 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition"
          >
            Home
          </Link>
          <button
            onClick={openMyOrders}
            className="px-2.5 py-1 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            My Orders
          </button>
          <Link
            href="/ClientDashboard/Report"
            className="px-2.5 py-1 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition"
          >
            Report
          </Link>
        </div>
      </header>

      {/* Active Rider Bill Payment Request Alert Banner */}
      {activeRiderAlert && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-3 shadow-md flex flex-wrap items-center justify-between gap-3 sticky top-[62px] sm:top-[68px] z-30 animate-pulse">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
            <span className="text-lg sm:text-xl">🔔</span>
            <span>
              Rider <strong>{activeRiderAlert.riderName}</strong> accepted your order #{activeRiderAlert.orderId.slice(-6).toUpperCase()} and requested bill payment of <strong>Rs. {activeRiderAlert.amount.toLocaleString()}</strong>!
            </span>
          </div>
          <Link
            href={`/ClientDashboard/payment?orderId=${activeRiderAlert.orderId}`}
            className="rounded-xl bg-white text-orange-600 px-3.5 py-1.5 text-xs font-black shadow hover:bg-orange-50 transition shrink-0"
          >
            💳 Pay Bill Now →
          </Link>
        </div>
      )}

      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:py-8 pb-36 md:px-8">
        <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
          Request a delivery
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">What do you need today?</h1>
        <p className="mt-1.5 mb-6 text-sm text-slate-500">
          Pick a service, browse the catalog, and we&apos;ll dispatch a rider to your door.
        </p>

        {catalogError && (
          <div role="alert" className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            {catalogError}
          </div>
        )}

        {/* Categories */}
        <section className="mb-7 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {categoriesList.map((cat) => {
            const active = activeCategory === cat.key;

            return (
              <button
                key={cat.key}
                onClick={() => changeCategory(cat.key)}
                className={`rounded-2xl border bg-white p-5 text-left transition hover:-translate-y-1 hover:shadow-lg ${
                  active
                    ? "border-orange-500 ring-2 ring-orange-200 shadow-sm"
                    : "border-slate-200"
                }`}
              >
                <span className="mb-3 block text-3xl">{cat.icon}</span>
                <h2 className="text-lg font-bold">{cat.label}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {cat.key === "food"
                    ? "Chinese, Fast Food & Desi cuisine"
                    : cat.key === "medicine"
                    ? "Pharmacy essentials, delivered fast"
                    : "Oil, staples & everyday items"}
                </p>
              </button>
            );
          })}
        </section>

        {/* Subcategories */}
        <section className="mb-6 flex gap-2 overflow-x-auto pb-2 flex-nowrap sm:flex-wrap">
          {subcategories.map((subcategory) => (
            <button
              key={subcategory}
              onClick={() => setActiveSubcategory(subcategory)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                activeSubcategory === subcategory
                  ? "border-orange-500 bg-orange-500 text-white shadow-xs"
                  : "border-slate-200 bg-white text-slate-600 hover:border-orange-400"
              }`}
            >
              {subcategory}
            </button>
          ))}
        </section>

        {/* Products */}
        {loadingCatalog ? (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 h-72 flex flex-col justify-between">
                <div className="bg-slate-200 h-40 rounded-xl w-full" />
                <div className="space-y-2 mt-4">
                  <div className="bg-slate-200 h-4 rounded w-3/4" />
                  <div className="bg-slate-200 h-3 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-lg font-bold text-slate-700">No items available</p>
            <p className="mt-1 text-sm text-slate-500">Items added via the Admin Dashboard will appear here.</p>
          </div>
        ) : (
          <section
            className={`grid gap-5 ${
              activeCategory === "grocery"
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {displayedItems.map((item, idx) => (
              <ProductCard
                key={`${activeCategory}-${item._id || item.name}-${idx}`}
                item={item}
                category={activeCategory}
                onAdd={addToCart}
              />
            ))}
          </section>
        )}
      </main>

      {/* Moveable Draggable Floating Cart Widget */}
      {cart.length > 0 && (
        <div
          onPointerDown={handlePointerDown}
          style={
            cartPos
              ? { left: `${cartPos.x}px`, top: `${cartPos.y}px`, position: "fixed" }
              : undefined
          }
          className={`fixed z-30 transition-shadow select-none ${
            !cartPos ? "bottom-6 left-1/2 -translate-x-1/2" : ""
          } ${isDragging ? "cursor-grabbing opacity-90 scale-105" : ""}`}
        >
          {isMinimized ? (
            /* Minimized Round Badge */
            <button
              onClick={() => setIsMinimized(false)}
              className="flex items-center gap-2 rounded-full bg-slate-900 border-2 border-orange-500 px-4 py-2.5 text-white shadow-2xl hover:bg-slate-800 transition cursor-pointer"
              title="Click to expand cart"
            >
              <span className="text-lg">🛍️</span>
              <span className="font-extrabold text-xs">
                {cart.length} item{cart.length > 1 ? "s" : ""} · Rs. {calculation.finalBill}
              </span>
              <span className="text-[10px] text-orange-400 font-bold">▲ Expand</span>
            </button>
          ) : (
            /* Full Floating Bar with Drag Handle & Minimize */
            <div className="flex items-center gap-3 rounded-2xl bg-slate-900/95 backdrop-blur-md p-3 text-white shadow-2xl border border-slate-700/60 w-[calc(100vw-2rem)] max-w-lg">
              {/* Drag Handle */}
              <div
                className="drag-handle flex items-center justify-center px-1.5 py-2 text-slate-400 hover:text-white cursor-grab active:cursor-grabbing text-base"
                title="Drag this widget anywhere on screen"
              >
                ⠿
              </div>

              {/* Cart Bill Details */}
              <div
                onClick={() => setIsCartOpen(true)}
                className="flex-1 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">
                    Your Cart ({cart.length} {cart.length === 1 ? "item" : "items"})
                  </span>
                  <span className="rounded-full bg-orange-500/20 text-orange-400 px-2 py-0.5 text-[10px] font-extrabold">
                    Final Bill: Rs. {calculation.finalBill}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  Items: Rs. {calculation.subtotal} + Delivery: Rs. {calculation.totalDeliveryCharges}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="rounded-xl bg-orange-500 px-3.5 py-2 text-xs font-extrabold text-white shadow hover:bg-orange-600 transition"
                >
                  View Ticket →
                </button>
                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  className="rounded-xl bg-slate-800 p-2 text-xs text-slate-400 hover:text-white hover:bg-slate-700 transition"
                  title="Minimize cart"
                >
                  ▼
                </button>
              </div>
            </div>
          )}
        </div>
      )}


      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl md:p-7">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold">Dispatch Ticket & Checkout</h2>
                <p className="text-sm text-slate-500">Review your order details and delivery calculations.</p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="rounded-lg p-2 text-xl text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {orderError && (
              <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {orderError}
              </div>
            )}

            {orderSuccess && (
              <div role="status" className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                {orderSuccess}
              </div>
            )}

            {/* Cart Items List */}
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
              {cart.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">Your cart is empty.</p>
              ) : (
                cart.map((item) => {
                  const itemImg = getItemImage(item);

                  return (
                    <div
                      key={item.uid}
                      className="flex items-center justify-between gap-4 border-b border-dashed border-slate-300 py-3 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        {itemImg ? (
                          <img
                            src={itemImg}
                            alt={item.name}
                            loading="lazy"
                            decoding="async"
                            className="h-12 w-12 rounded-xl object-cover border border-slate-200"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center text-xl">
                            {item.icon || "🛍️"}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-sm text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.provider}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-sm text-slate-900">
                          Rs. {item.price}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.uid)}
                          className="h-7 w-7 rounded-full bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition flex items-center justify-center"
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>


            {/* Bill & Delivery Charges Breakdown */}
            <div className="mt-5 rounded-2xl bg-orange-50/50 border border-orange-200 p-4 space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Items Cost)</span>
                <span className="font-semibold text-slate-900">Rs. {calculation.subtotal}</span>
              </div>

              <div className="border-t border-orange-100 pt-2 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>• Base Delivery Fee (Tier: Rs. {calculation.subtotal.toLocaleString()})</span>
                  <span>Rs. {calculation.baseDeliveryFee}</span>
                </div>
                {calculation.extraItemCharge > 0 && (
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>• Extra Item Charge ({calculation.totalQuantity - 1} extra × Rs. 50)</span>
                    <span>Rs. {calculation.extraItemCharge}</span>
                  </div>
                )}
                {calculation.extraCategoryCharge > 0 && (
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>• Multi-Category Charge ({calculation.uniqueCategoriesCount - 1} extra × Rs. 100)</span>
                    <span>Rs. {calculation.extraCategoryCharge}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-orange-800 pt-1">
                  <span>Total Delivery Charges</span>
                  <span>Rs. {calculation.totalDeliveryCharges}</span>
                </div>
              </div>

              <div className="flex justify-between border-t-2 border-orange-300 pt-2 text-base font-extrabold text-slate-900">
                <span>Final Bill (Total)</span>
                <span className="text-orange-600 text-lg">Rs. {calculation.finalBill}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <FormField
                label="Full Name"
                value={form.fullName}
                error={errors.fullName}
                onChange={(value) => setForm({ ...form, fullName: value })}
              />
              <FormField
                label="Phone Number"
                value={form.phone}
                error={errors.phone}
                onChange={(value) => setForm({ ...form, phone: value })}
              />
              <FormField
                label="Pickup / Order Place"
                value={form.pickup}
                error={errors.pickup}
                onChange={(value) => setForm({ ...form, pickup: value })}
              />
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-600">
                  Delivery Address
                </label>
                <textarea
                  value={form.address}
                  onChange={(event) =>
                    setForm({ ...form, address: event.target.value })
                  }
                  placeholder="House #, street, area, city"
                  className={`min-h-20 w-full rounded-xl border px-4 py-3 outline-none transition focus:border-orange-500 ${
                    errors.address
                      ? "border-red-500 bg-red-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-red-500">
                    Please enter a delivery address.
                  </p>
                )}
              </div>

              {/* Payment Method - Card Only */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💳</span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Online Card Payment</p>
                    <p className="text-xs text-slate-600">
                      Submit request and proceed to secure card payment on the next screen.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingOrder || cart.length === 0}
                className="w-full rounded-xl bg-orange-500 px-4 py-3.5 font-bold text-white transition hover:bg-orange-600 disabled:opacity-60 shadow"
              >
                {submittingOrder ? "Submitting Dispatch Ticket..." : `Proceed to Card Payment (Rs. ${calculation.finalBill})`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
          {toast}
        </div>
      )}
    </div>
  );
}

function ProductCard({
  item,
  category,
  onAdd,
}: {
  item: Item;
  category: string;
  onAdd: (item: Item) => void;
}) {
  const providerList = PROVIDERS[category] || ["Deliveries Hub Partner", "Official Store"];
  const [selectedProvider, setSelectedProvider] = useState(item.provider || providerList[0]);

  const options = useMemo(() => {
    const defaultProv = item.provider || providerList[0];
    const providers = [
      defaultProv,
      ...providerList.filter((provider) => provider !== defaultProv),
    ].slice(0, 4);

    const adjustments = [0, 20, -10, 35];

    return providers.map((provider, index) => ({
      provider,
      price: Math.max(1, item.price + (adjustments[index] || 0)),
    }));
  }, [providerList, item]);

  const selected = options.find(
    (option) => option.provider === selectedProvider
  ) || options[0];

  const image = getItemImage(item, category);

  return (
    <article
      className={`overflow-hidden rounded-3xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group ${
        category === "grocery" ? "md:flex" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden bg-slate-100 flex items-center justify-center ${
          category === "grocery" ? "min-h-56 md:w-[43%]" : "h-52"
        }`}
      >
        {image ? (
          <img
            src={image}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <span className="text-6xl">{item.icon || "📦"}</span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">

        <h3 className="text-lg font-bold">{item.name}</h3>

        <select
          value={selectedProvider}
          onChange={(event) => setSelectedProvider(event.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-orange-700 outline-none focus:border-orange-500"
        >
          {options.map((option) => (
            <option key={option.provider} value={option.provider}>
              {option.provider} — Rs. {option.price}
            </option>
          ))}
        </select>

        <div className="mt-5 flex items-center justify-between gap-4">
          <span className="font-mono text-lg font-extrabold">
            Rs. {selected.price}
          </span>
          <button
            onClick={() =>
              onAdd({
                ...item,
                provider: selected.provider,
                price: selected.price,
              })
            }
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-500"
          >
            + Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}

function FormField({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: string;
  error?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-600">
        {label}
      </label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:border-orange-500 ${
          error ? "border-red-500 bg-red-50" : "border-slate-200 bg-slate-50"
        }`}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500">Please enter a valid {label.toLowerCase()}.</p>
      )}
    </div>
  );
}
