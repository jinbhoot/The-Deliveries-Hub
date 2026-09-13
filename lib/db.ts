import mongoose from "mongoose";
import dns from "dns";

try {
  if (typeof dns.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
  }
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch {
  // Ignore DNS config errors in edge environments
}

// Pre-load all Mongoose models so population never fails with MissingSchemaError
import "@/models/User";
import "@/models/Rider";
import "@/models/Category";
import "@/models/Subcategory";
import "@/models/Item";
import "@/models/Order";
import "@/models/Payment";
import "@/models/Report";
import "@/models/Notification";
import "@/models/PushSubscription";



/**
 * Next.js hot-reloads modules in dev, which would otherwise create a new
 * Mongoose connection on every request. We cache the connection on the
 * global object so it survives reloads.
 */
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongooseCache ?? {
  conn: null,
  promise: null,
};

global._mongooseCache = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI environment variable is missing. Set it in your .env.local or Vercel Environment Variables."
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
