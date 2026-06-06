import 'dotenv/config'
import express from "express";
import passport from "./src/config/passport.js"
import "./src/config/config.js"; // DB connection initialize
import UserAuth from "./src/routes/locationRoutes.js"; // apne routes
import bodyParser from "body-parser";
import "dotenv/config";
import session from "express-session";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cookieParser from "cookie-parser";

const PORT = process.env.PORT || 3000;
const app = express();
app.set("trust proxy", 1); // agar reverse proxy (NGINX, cPanel, etc.) ke peeche hai

app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // ✅ HTTPS only in prod
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // ✅ cross-site support
    },
  })
);

app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // ✅ .env se lo
    credentials: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());
// ✅ __dirname setup for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Uploads folder
const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Middlewares
app.use(express.json());
app.use(bodyParser.json());

// ✅ Public uploads folder
app.use("/uploads", express.static(uploadPath));

// Routes
app.use("/api", UserAuth);


// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log("🚀 Server is running on port", PORT);
});
