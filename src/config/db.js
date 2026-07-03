import mongoose from "mongoose";
import { env } from "./env.js";

const globalCache = globalThis;

if (!globalCache._mongooseCache) {
  globalCache._mongooseCache = { conn: null, promise: null };
}

const cache = globalCache._mongooseCache;

export async function connectDB() {
  if (!env.mongodbUri) {
    throw new Error("MONGODB_URI is required");
  }

  if (cache.conn) {
    return cache.conn;
  }

  mongoose.set("strictQuery", true);

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(env.mongodbUri, { bufferCommands: false })
      .then((mongooseInstance) => {
        console.log("MongoDB connected");
        return mongooseInstance;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
