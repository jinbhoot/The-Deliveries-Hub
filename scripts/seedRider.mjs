import mongoose from "mongoose";
import bcrypt from "bcryptjs";
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

const RIDER_EMAIL = "rider@deliveryhub.com";
const RIDER_PASSWORD = "Rider@123";
const RIDER_NAME = "Haroon Ali";
const RIDER_CNIC = "35202-1234567-1";
const RIDER_ADDRESS = "Model Town, Lahore";

const UserSchema = new mongoose.Schema(
  {
    fullName: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
    phone: String,
  },
  { timestamps: true }
);

const RiderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    cnic: String,
    address: String,
    status: { type: String, enum: ["Pending", "Approved", "Blocked"], default: "Approved" },
    online: { type: Boolean, default: true },
  },
  { timestamps: true }
);

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI not found.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.models.User || mongoose.model("User", UserSchema);
  const Rider = mongoose.models.Rider || mongoose.model("Rider", RiderSchema);

  let user = await User.findOne({ email: RIDER_EMAIL });
  if (!user) {
    const hashedPassword = await bcrypt.hash(RIDER_PASSWORD, 10);
    user = await User.create({
      fullName: RIDER_NAME,
      email: RIDER_EMAIL,
      password: hashedPassword,
      phone: "0300-1234567",
      role: "rider",
    });
  }

  let rider = await Rider.findOne({ user: user._id });
  if (!rider) {
    await Rider.create({
      user: user._id,
      cnic: RIDER_CNIC,
      address: RIDER_ADDRESS,
      status: "Approved",
      online: true,
    });
  } else {
    rider.status = "Approved";
    rider.online = true;
    await rider.save();
  }

  console.log("Rider account ready:");
  console.log(`  email: ${RIDER_EMAIL}`);
  console.log(`  password: ${RIDER_PASSWORD}`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
