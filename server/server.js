import express from "express";
import Db from "./Config/db.js";
import UserAuth from "./routes/locationRoutes.js";
import bodyParser from "body-parser";
import "dotenv/config";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const PORT = process.env.PORT || 3000;
const app = express();

// ✅ __dirname setup for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Middlewares
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// ✅ Public uploads folder
app.use("/uploads", express.static(uploadPath));

// Database connection
Db.connect((err) => {
  if (err) {
    console.error("❌ Database connection error:", err.message);
  } else {
    console.log("✅ MySQL connected successfully!");
  }
});

// Routes
app.use("/api", UserAuth);

app.listen(PORT, () => {
  console.log("🚀 Server is running on port", PORT);
});
