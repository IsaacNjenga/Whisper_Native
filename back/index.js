import express from "express";
import dotenv from "dotenv";
import "./config/db.js";
import cors from "cors";
import { Router } from "./routes/routes.js";

dotenv.config();

const { PORT } = process.env;

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/api", Router);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} `);
});
