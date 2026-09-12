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

if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

// Schemas
const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

const SubcategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  },
  { timestamps: true }
);

const ItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory", default: null },
    price: { type: Number, required: true },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
const Subcategory = mongoose.models.Subcategory || mongoose.model("Subcategory", SubcategorySchema);
const Item = mongoose.models.Item || mongoose.model("Item", ItemSchema);

const TAXONOMY_DATA = [
  {
    category: "Food",
    subcategories: [
      {
        name: "Fast Food",
        items: [
          { name: "Zinger Burger", price: 650, description: "Crispy fried fillet with spicy mayo", image: "🍔" },
          { name: "Crispy Chicken Burger", price: 550, description: "Golden fried patty with lettuce", image: "🍔" },
          { name: "Loaded Cheese Fries", price: 420, description: "Topped with melted cheddar & jalapeños", image: "🍟" },
          { name: "Supreme Pizza Large", price: 1450, description: "Loaded with chicken tikka & extra cheese", image: "🍕" },
        ],
      },
      {
        name: "Chinese Food",
        items: [
          { name: "Kung Pao Chicken", price: 850, description: "Spicy stir-fry with peanuts & veggies", image: "🥡" },
          { name: "Chicken Chow Mein", price: 680, description: "Wok tossed noodles with shredded chicken", image: "🍜" },
          { name: "Egg Fried Rice", price: 520, description: "Classic Chinese jasmine rice with scallions", image: "🍚" },
        ],
      },
      {
        name: "Desi Food",
        items: [
          { name: "Chicken Biryani Special", price: 480, description: "Aromatic basmati rice with spiced chicken", image: "🍛" },
          { name: "Mutton Karahi Half", price: 1950, description: "Cooked in fresh tomatoes & green chilies", image: "🍲" },
          { name: "Seekh Kabab Plate", price: 750, description: "Charcoal grilled beef skewers (4 pcs)", image: "🍢" },
        ],
      },
    ],
  },
  {
    category: "Medicine",
    subcategories: [
      {
        name: "Tablets",
        items: [
          { name: "Panadol 500mg (Strip of 10)", price: 60, description: "Paracetamol for pain relief & fever", image: "💊" },
          { name: "Augmentin 625mg (Box of 14)", price: 460, description: "Antibiotic for bacterial infections", image: "💊" },
          { name: "Disprin Extra (Pack of 10)", price: 45, description: "Soluble pain relief aspirin", image: "💊" },
        ],
      },
      {
        name: "Syrups",
        items: [
          { name: "Hydryllin Cough Syrup 120ml", price: 175, description: "Effective soothing formula for dry cough", image: "🧴" },
          { name: "Sancos Cough Formula 120ml", price: 210, description: "Relief for chesty cough & throat irritation", image: "🧴" },
          { name: "CAC 1000 Plus Calcium 10s", price: 340, description: "Effervescent orange vitamin C & D tablets", image: "🍊" },
        ],
      },
      {
        name: "First Aid & Essentials",
        items: [
          { name: "Dettol Antiseptic Liquid 100ml", price: 220, description: "First aid disinfectant & wound cleaner", image: "🩹" },
          { name: "Digital Body Thermometer", price: 650, description: "Fast & accurate LCD temperature reading", image: "🌡️" },
          { name: "Waterproof Bandage Strips (Pack of 20)", price: 130, description: "Sterile adhesive wound plasters", image: "🩹" },
        ],
      },
    ],
  },
  {
    category: "Grocery",
    subcategories: [
      {
        name: "Cooking Oil & Ghee",
        items: [
          { name: "Dalda Cooking Oil 1 Litre Pouch", price: 580, description: "Rich in Vitamin A, D & E", image: "🍾" },
          { name: "Sufi Banaspati Ghee 1kg", price: 560, description: "Premium purified cooking ghee", image: "🧈" },
          { name: "Extra Virgin Olive Oil 500ml", price: 1350, description: "Cold pressed premium imported olive oil", image: "🫒" },
        ],
      },
      {
        name: "Kitchen Staples",
        items: [
          { name: "Super Kernel Basmati Rice 5kg", price: 1750, description: "Long grain aromatic aged basmati rice", image: "🌾" },
          { name: "Refined White Sugar 1kg", price: 165, description: "Pure crystallised cane sugar", image: "🧂" },
          { name: "Chakki Fresh Atta 10kg", price: 1380, description: "100% whole wheat stone-ground flour", image: "🌾" },
        ],
      },
      {
        name: "Snacks & Beverages",
        items: [
          { name: "Lays French Cheese Chips 60g", price: 100, description: "Crunchy potato crisps", image: "🥔" },
          { name: "Coca-Cola 1.5 Litre Bottle", price: 220, description: "Chilled refreshing soft drink", image: "🥤" },
          { name: "Olper's Full Cream Milk 1 Litre", price: 295, description: "UHT treated pure whole milk", image: "🥛" },
        ],
      },
    ],
  },
];

async function seed() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB Atlas.");

    for (const group of TAXONOMY_DATA) {
      // 1. Find or create Category
      let cat = await Category.findOne({ name: group.category });
      if (!cat) {
        cat = await Category.create({ name: group.category });
        console.log(`Created Main Category: ${cat.name} (${cat._id})`);
      } else {
        console.log(`Main Category exists: ${cat.name} (${cat._id})`);
      }

      // 2. Subcategories
      for (const sub of group.subcategories) {
        let subcat = await Subcategory.findOne({ name: sub.name, category: cat._id });
        if (!subcat) {
          subcat = await Subcategory.create({ name: sub.name, category: cat._id });
          console.log(`  Created Subcategory: ${subcat.name} under ${cat.name}`);
        } else {
          console.log(`  Subcategory exists: ${subcat.name} under ${cat.name}`);
        }

        // 3. Items
        for (const it of sub.items) {
          const itemExists = await Item.findOne({ name: it.name, category: cat._id });
          if (!itemExists) {
            await Item.create({
              name: it.name,
              category: cat._id,
              subcategory: subcat._id,
              price: it.price,
              description: it.description,
              image: it.image,
              inStock: true,
            });
            console.log(`    + Added item: ${it.name} (PKR ${it.price})`);
          } else {
            // Update subcategory link if missing
            if (!itemExists.subcategory) {
              itemExists.subcategory = subcat._id;
              await itemExists.save();
              console.log(`    ~ Linked existing item to subcategory: ${it.name}`);
            }
          }
        }
      }
    }

    console.log("\n Taxonomy and Catalog seeding completed successfully!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
