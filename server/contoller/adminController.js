import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import 'dotenv/config';
import db from "../Config/db.js";


const AdminLogin = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Username and Password required" });

  db.query("SELECT * FROM admins WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (results.length === 0)
      return res.status(401).json({ msg: "Invalid Credentials" });

    const admin = results[0];

    const validPassword = await bcrypt.compare(password, admin.password);

    if (!validPassword)
      return res.status(401).json({ msg: "Invalid Credentials" });

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_Key,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  });
};

export default AdminLogin;
