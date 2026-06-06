// src/controller/AdminController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import 'dotenv/config'
import models from "../config/db.js";  // ✅ sahi
const { admins , users } = models;




// ✅ Login API
export const AdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Pehle admin check karo
    let user = await admins.findOne({ where: { email } });

    let role = "admin";

    // Agar admin nahi mila to user check karo
    if (!user) {
      user = await users.findOne({ where: { email } });
      role = "user";
    }

    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    // Password check
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: "Invalid email or password" });

    // JWT token
    const token = jwt.sign(
      { id: user.id, role },
      process.env.JWT_KEY || "secretKey",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Middleware to verify token
export const verifyToken = (req, res, next) => {
  const token = req.cookies.token; // ✅ cookie se read
  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
};



// Delete Admin Profile Picture
export const DeleteProfile = async (req, res) => {
  try {
    const adminId = 1; // ya req.user.id agar auth use ho raha hai
    await admins.update({ profilePic: null }, { where: { id: adminId } });
    res.json({ success: true, message: "Profile picture removed" });
  } catch (err) {
    console.error("Delete profile error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};


export const AdminProfile = async (req , res) => {
  try {
     const adminId = 1;
      // console.log(adminId,"AdminId");
       // frontend se bhejo
    const filePath = `/uploads/${req.file.filename}`; // multer save karega

    // update admin profilePic
    await admins.update(
      { profilePic: filePath },
      { where: { id: adminId } }
    );

    res.json({ success: true, message: "Profile updated", filePath });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}

// ✅ Get Admin (only first admin for now)
export const getAdmin = async (req, res) => {
  try {
    const admin = await admins.findOne({
      attributes: ["id", "email", "profilePic" ,"role"], // ✅ add profilePic here
      order: [["id", "ASC"]],
    });

    if (!admin) return res.status(404).json({ message: "No admin found" });

    // agar profilePic relative path me hai, frontend ke liye full URL banado
    const adminData = {
      ...admin.dataValues,
      profilePic: admin.profilePic ? `${admin.profilePic}` : null,
      role: admin.role
    };

    res.json({ admin: adminData });
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




