import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ✅ Login API
export const AdminLogin = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and Password required" });

  db.query("SELECT * FROM admins WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (results.length === 0)
      return res.status(401).json({ msg: "Invalid Credentials" });

    const admin = results[0];

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword)
      return res.status(401).json({ msg: "Invalid Credentials" });

    // ✅ Token me id aur email bhej rahe hain
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_Key,
      { expiresIn: "1h" }
    );
    // console.log(token, "ll token");
    
     res.status(200).json({ message: "Login successful", token });
  });
};

// ✅ Middleware to verify token
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(403).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1]; // Bearer TOKEN
  jwt.verify(token, process.env.JWT_Key, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.user = decoded; // yahan se id/email milegi
    next();
  });
};

// ✅ Update Admin API
export const getAdmin = async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT id, email FROM admins LIMIT 1");
    if (rows.length > 0) {
      res.json({ admin: rows[0] });
    } else {
      res.status(404).json({ message: "No admin found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update admin
export const UpdateAdmin = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    const [rows] = await db.promise().query("SELECT * FROM admins WHERE id = 1");
    if (rows.length === 0) return res.status(404).json({ message: "Admin not found" });

    const admin = rows[0];
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Current password incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.promise().query("UPDATE admins SET email = ?, password = ? WHERE id = 1", [email, hashedPassword]);

    res.json({ message: "Admin updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
