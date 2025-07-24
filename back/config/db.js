import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const Connection = async () => {
  try {
    await mongoose.connect(process.env.URI);
    console.log("Database Connected!");
  } catch (error) {
    console.log("Error connecting to DB", error);
    process.exit(1);
  }
};

Connection();
