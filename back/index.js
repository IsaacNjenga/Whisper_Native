import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import { Router } from "./src/routes/routes.js";
import { connectDB } from "./src/config/db.js";

dotenv.config();

const PORT = process.env.PORT || 3001;
const app = express();

const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:8081"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

// // Middleware
// app.use(cors(corsOptions));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.use("/api", Router);

async function startServer() {
  try {
    await connectDB();
    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use("/api", Router);

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

// Preflight
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    return res.sendStatus(200);
  }
  next();
});

// // ✅ IMPORTANT: connect DB ONCE (serverless-safe)
// let isConnected = false;

// async function ensureDB() {
//   if (!isConnected) {
//     await connectDB();
//     isConnected = true;
//   }
// }

// // ✅ Wrap handler for Vercel
// export default async function handler(req, res) {
//   await ensureDB();
//   return app(req, res);
// }
