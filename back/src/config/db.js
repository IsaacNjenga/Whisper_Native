import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.URI;

if (!MONGODB_URI) throw new Error("MongoDB URI is missing");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = await mongoose
      .connect(MONGODB_URI, {
        //bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
      })
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  console.log("Database Connected");
  return cached.conn;
}