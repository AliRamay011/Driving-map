import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import models from "../config/db.js";
const { LocalUser } = models;

export const registerUser = async (req, res) => {
  try {
    const { email, mobile, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await LocalUser.create({
      email,
      mobile,
      password: hashedPassword,
    });
    res.json({ message: "User created", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await LocalUser.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // ✅ Check for Google users (password NULL)
    if (!user.password) {
      return res.status(401).json({
        error: "This email is registered with Google. Please use Google login.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid password" });

    // ✅ JWT_SECRET check
    if (!process.env.JWT_KEY) {
      console.error("JWT_SECRET missing!");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_KEY, {
      expiresIn: "1d",
    });
    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const GoggleUser = (req, res) => {
  const token = req.cookies.auth_token; // 1️⃣  cookie nikaali
  if (!token) return res.status(401).json({ error: "Not logged in" });

  try {
    const user = jwt.verify(token, process.env.JWT_KEY); // 2️⃣ JWT verify
    res.json(user); // 3️⃣ user data frontend ko bhej do
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

export const googleCallBack = (req, res) => {
  if (!req.user) {
    return res.redirect(`${process.env.FRONTEND_URL}/?signup=error`);
  }

  const user = {
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    photoURL: req.user.photoURL,
  };

  const token = jwt.sign(user, process.env.JWT_KEY, { expiresIn: "1d" });

  res.cookie("auth_token", token, {
    httpOnly: true, // ✅ JavaScript access nahi kar sakta (safe)
    secure: true, // ✅ sirf HTTPS par chalega
    sameSite: "none", // ✅ front aur back alag domain hon to cookie jaayegi
    maxAge: 24 * 60 * 60 * 1000, // ✅ 1 din valid
  });

  res.redirect(`${process.env.FRONTEND_URL}/?signup=success`);
};

export const logoutUser = (req, res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });
  res.status(200).json({ message: "Logged out successfully" });
};
