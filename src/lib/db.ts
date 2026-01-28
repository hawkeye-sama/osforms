import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/freeforms";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Cache connection across hot reloads in dev
const cached: MongooseCache = (globalThis as Record<string, unknown>).__mongoose as MongooseCache || { conn: null, promise: null };
(globalThis as Record<string, unknown>).__mongoose = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
