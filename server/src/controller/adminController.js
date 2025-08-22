// src/controller/AdminController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import models from "../models/index.js";  // ✅ sahi
const { admins } = models;


// ✅ Login API
export const AdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and Password required" });

    const admin = await admins.findOne({ where: { email } });
    if (!admin) return res.status(401).json({ message: "Invalid Credentials" });

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword)
      return res.status(401).json({ message: "Invalid Credentials" });

    // ✅ JWT token generate
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_KEY,
      { expiresIn: "1d" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Middleware to verify token
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(403).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1]; // Bearer TOKEN
  jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.user = decoded; // yahan se id/email milegi
    next();
  });
};

// ✅ Get Admin (only first admin for now)
export const getAdmin = async (req, res) => {
  try {
    const admin = await admins.findOne({
      attributes: ["id", "email"],
      order: [["id", "ASC"]],
      
    });
    if (!admin) return res.status(404).json({ message: "No admin found" });
    res.json({ admin });
  } catch (err) {
    console.error("Get Admin Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update Admin (update email/password of admin with id=1)
export const UpdateAdmin = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    const admin = await admins.findByPk(1);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await admin.update({ email, password: hashedPassword });

    res.json({ message: "Admin updated successfully" });
  } catch (err) {
    console.error("Update Admin Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
