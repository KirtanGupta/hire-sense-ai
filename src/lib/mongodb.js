import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectMongo() {
  if (!MONGODB_URI) {
    throw new Error("Please define MONGODB_URI in .env.local");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of hanging infinitely
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("MongoDB Connected");
    return cached.conn;
  } catch (error) {
    cached.promise = null; // Clear cached promise on failure to allow retries
    throw new Error(
      `MongoDB connection failed: ${error.message}. Please check that: 1) Your MONGODB_URI in .env.local is correct, 2) Your Atlas database cluster is resumed (not paused), and 3) Your current IP address is whitelisted in MongoDB Atlas Network Access.`
    );
  }
}

