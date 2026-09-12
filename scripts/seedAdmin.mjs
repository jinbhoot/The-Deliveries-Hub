// One-time script to create the first Admin account.
// Run with: node scripts/seedAdmin.mjs
//
// Reads MONGODB_URI from .env.local automatically.

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dns from "dns";
import fs from "fs";

// Read .env.local manually if dotenv is not installed
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


const ADMIN_EMAIL = "admin@deliveryhub.com";
const ADMIN_PASSWORD = "Admin@123";
const ADMIN_NAME = "Admin";

const UserSchema = new mongoose.Schema(
  {
    fullName: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
  },
  { timestamps: true }
);

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI not found. Make sure .env.local exists and has it set.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.models.User || mongoose.model("User", UserSchema);

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`Admin already exists: ${ADMIN_EMAIL}`);
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await User.create({
    fullName: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: hashedPassword,
    role: "admin",
  });

  console.log("Admin account created:");
  console.log(`  email: ${ADMIN_EMAIL}`);
  console.log(`  password: ${ADMIN_PASSWORD}`);
  console.log("Change this password after your first login.");

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
