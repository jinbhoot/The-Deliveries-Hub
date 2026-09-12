import mongoose from "mongoose";
import dns from "dns";
import fs from "fs";

if (fs.existsSync(".env.local")) {
  const envContent = fs.readFileSync(".env.local", "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...values] = trimmed.split("=");
      const val = values.join("=").replace(/^["']|["']$/g, "");
      process.env[key.trim()] = val.trim();
    }
  }
}

dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);

const MONGODB_URI = process.env.MONGODB_URI;

const ITEM_IMAGE_MAP = {
  // Food - Fast Food
  "Zinger Burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
  "Crispy Chicken Burger": "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=600&auto=format&fit=crop&q=80",
  "Loaded Cheese Fries": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80",
  "Supreme Pizza Large": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80",
  "Loaded Cheese Pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80",
  "Crispy Fries": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80",
  "Club Sandwich": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80",
  "Grilled Chicken Wrap": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&auto=format&fit=crop&q=80",

  // Food - Chinese
  "Kung Pao Chicken": "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&auto=format&fit=crop&q=80",
  "Chicken Chow Mein": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80",
  "Egg Fried Rice": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80",
  "Chicken Dumplings": "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&auto=format&fit=crop&q=80",
  "Hot & Sour Soup": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80",

  // Food - Desi
  "Chicken Biryani Special": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
  "Chicken Biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
  "Mutton Karahi Half": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80",
  "Mutton Karahi": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80",
  "Seekh Kabab Plate": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80",
  "Chicken Seekh Kabab": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80",
  "Garlic Naan": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
  "Halwa Puri Thali": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",

  // Medicine - Tablets
  "Panadol 500mg (Strip of 10)": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
  "Panadol Extra": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
  "Augmentin 625mg (Box of 14)": "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80",
  "Augmentin 625mg": "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80",
  "Disprin Extra (Pack of 10)": "https://images.unsplash.com/photo-1550572017-ed2428583616?w=600&auto=format&fit=crop&q=80",
  "Disprin Tablets": "https://images.unsplash.com/photo-1550572017-ed2428583616?w=600&auto=format&fit=crop&q=80",
  "Brufen 400mg": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
  "Flagyl 400mg": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",

  // Medicine - Syrups
  "Hydryllin Cough Syrup 120ml": "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&auto=format&fit=crop&q=80",
  "Cough Syrup": "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&auto=format&fit=crop&q=80",
  "Sancos Cough Formula 120ml": "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&auto=format&fit=crop&q=80",
  "Benadryl Syrup": "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&auto=format&fit=crop&q=80",
  "Calpol Syrup": "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&auto=format&fit=crop&q=80",
  "CAC 1000 Plus Calcium 10s": "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600&auto=format&fit=crop&q=80",

  // Medicine - First Aid & Essentials
  "Dettol Antiseptic Liquid 100ml": "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=600&auto=format&fit=crop&q=80",
  "Digital Body Thermometer": "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80",
  "Waterproof Bandage Strips (Pack of 20)": "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600&auto=format&fit=crop&q=80",

  // Grocery
  "Dalda Cooking Oil 1 Litre Pouch": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80",
  "Dalda Cooking Oil": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80",
  "Sufi Banaspati Ghee 1kg": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80",
  "CanOlive Sunflower Oil": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80",
  "Extra Virgin Olive Oil 500ml": "https://images.unsplash.com/photo-1541256942802-7b29631f4967?w=600&auto=format&fit=crop&q=80",
  "Super Kernel Basmati Rice 5kg": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80",
  "Super Basmati Rice": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80",
  "Refined White Sugar 1kg": "https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=600&auto=format&fit=crop&q=80",
  "Sugar": "https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=600&auto=format&fit=crop&q=80",
  "Chakki Fresh Atta 10kg": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
  "Wheat Flour (Atta)": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
  "Lays French Cheese Chips 60g": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80",
  "Coca-Cola 1.5 Litre Bottle": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80",
  "Olper's Full Cream Milk 1 Litre": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80",
  "Milkpak Milk": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80",
};

const ItemSchema = new mongoose.Schema(
  {
    name: String,
    category: mongoose.Schema.Types.ObjectId,
    subcategory: mongoose.Schema.Types.ObjectId,
    price: Number,
    image: String,
    description: String,
    inStock: Boolean,
  },
  { timestamps: true }
);

const Item = mongoose.models.Item || mongoose.model("Item", ItemSchema);

async function run() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI);

    const items = await Item.find({});
    console.log(`Found ${items.length} items to update with high-res photos...`);

    let updatedCount = 0;
    for (const item of items) {
      const matchedImg = ITEM_IMAGE_MAP[item.name];
      if (matchedImg && (!item.image || !item.image.startsWith("http"))) {
        item.image = matchedImg;
        await item.save();
        console.log(`✓ Updated image for: ${item.name}`);
        updatedCount++;
      }
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} items with high-resolution photos!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error updating item photos:", err);
    process.exit(1);
  }
}

run();
