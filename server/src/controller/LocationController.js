  import models from "../config/db.js";
  import bcrypt from "bcrypt";
  import  'dotenv/config' ;
  import fs from "fs";
  import path from "path";
  import jwt from "jsonwebtoken";
  import { transporter } from "../middleware/nodeMailer.js";

  // ✅ Get all places with images
  export const getAllPlaces = async (req, res) => {
    try {
      const places = await models.places.findAll({
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: models.place_images,
            as: "place_images",
            attributes: ["image_url"],
          },
        ],
      });
      res.json({ success: true, data: places });
    } catch (err) {
      console.error("❌ Error fetching places:", err);
      res.status(500).json({ message : err });
    }
  };
  // ✅ Add a new place
  export const addPlace = async (req, res) => {
    try {
      const { name, address, description, latitude, longitude , category , keywords } = req.body;
      const files = req.files;

      const newPlace = await models.places.create({
        name,
        address,
        description,
        latitude,
        longitude,
        category ,
        keywords ,
      });

      if (files && files.length > 0) {
        const imagesData = files.map((file) => ({
          place_id: newPlace.id,
          image_url: `/uploads/${file.filename}`,
        }));
        await models.place_images.bulkCreate(imagesData);
      }

      res.json({ success: true, message: "Place added successfully", place: newPlace });
    } catch (err) {
      console.error("❌ Error adding place:", err);
      res.status(500).json({ message : err });
    }
  };
  // ✅ Delete a place
  export const DeletePlace = async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (!id) return res.status(400).json({ success: false, message: "ID missing" });

      // 1️⃣ Get all images for this place
      const images = await models.place_images.findAll({ where: { place_id: id } });

      // 2️⃣ Delete physical files
    images.forEach(img => {
    const filePath = path.join(process.cwd(), "uploads", path.basename(img.image_url));
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting file:", filePath, err);
      else console.log("Deleted file:", filePath);
    });
  });



      // 3️⃣ Delete image entries from DB
      await models.place_images.destroy({ where: { place_id: id } });

      // 4️⃣ Delete the place itself
      const deleted = await models.places.destroy({ where: { id } });

      if (deleted) {
        res.status(200).json({ success: true, message: "Location and images deleted successfully" });
      } else {
        res.status(404).json({ success: false, message: "Location not found" });
      }
    } catch (err) {
      console.error("DeletePlace error:", err);
      res.status(500).json({ success: false, message: "Server error while deleting location" });
    }
  };

  // ✅ Update a place
  export const UpdatePlace = async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (!id) return res.status(400).json({ success: false, message: "ID missing" });

      const { name, address, description, latitude, longitude } = req.body;

      const updated = await models.places.update(
        { name, address, description, latitude, longitude },
        { where: { id } }
      );

      if (updated[0] > 0) {
        res.status(200).json({ success: true, message: "Location updated" });
      } else {
        res.status(404).json({ success: false, message: "Location not found" });
      }
    } catch (err) {
      console.error("UpdatePlace error:", err);
      res.status(500).json({ success: false, message: "Server error while updating location" });
    }
  };

  // ✅ Add User
export const Users = async (req, res) => {
  try {
    const  { name, username, email, phone, password, confirmPassword, address, dob, gender } = req.body;
           console.log(name, username, email, phone, password, confirmPassword, address, dob, gender);
          
    if (!name || !username || !email || !password || !confirmPassword)
      return res.status(400).json({ message: "Required fields missing" });

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const existingUser = await models.users.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const profile = req.file ? req.file.filename : null;

    const newUser = await models.users.create({
      name,
      username,
      email,
      phone,
      password: hashedPassword,
      address,
      dob,
      gender,
      profile,
      verified: false,
      role: "user"
    });

    // JWT token (24h valid)
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_KEY || "secretKey", { expiresIn: "1d" });
    const verifyLink = `http://localhost:5000/api/verify/${token}`; // change in prod

    // Send verification email
    await transporter.sendMail({
      from: `"App Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify your email address",
      html: `
        <h3>Hello ${name},</h3>
        <p>Thank you for registering. Please verify your email by clicking below:</p>
        <a href="${verifyLink}">Verify Email</a>
        <br><br>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    // Remove password before sending response
    const { password: _, ...userWithoutPassword } = newUser.dataValues;

    res.json({
      message: "User registered successfully. Verification email sent!",
      user: userWithoutPassword,
      role : newUser.role , 
    });

  } catch (err) {
    console.error("Users Controller Error:", err);
    res.status(500).json({ message: "Database or server error", error: err.message });
  }
};

export const VerifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    await models.users.update(
      { verified: true },
      { where: { id: decoded.id } }
    );

    res.status(200).send("✅ Email verified successfully! You can now login.");
  } catch (err) {
    console.error("VerifyEmail Error:", err);
    res.status(400).send("❌ Invalid or expired verification link.");
  }
};


  // ✅ Get all users
  export const UserGet = async (req, res) => {
    try {
      const users = await models.users.findAll({
          attributes: { exclude: ['password'] }
      });
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message : err });
    }
  };

  // ✅ Update a user
  export const UpdateUsers = async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (!id) return res.status(400).json({ message: "ID missing" });

      const { name, username, email, phone, password, address, dob, gender, profile } = req.body;
      const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

      const updated = await models.users.update(
        { name, username, email, phone, password: hashedPassword, address, dob, gender, profile },
        { where: { id } }
      );

      if (updated[0] > 0) {
        const user = await models.users.findByPk(id);
        res.status(200).json({ success: true, message: "User updated", user });
      } else {
        res.status(404).json({ success: false, message: "User not found" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message : err });
    }
  };

  // ✅ Delete a user
  export const DeleteUsers = async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (!id) return res.status(400).json({ message: "ID missing" });

      const deleted = await models.users.destroy({ where: { id } });
      if (deleted) {
        res.status(200).json({ success: true, message: "User deleted successfully" });
      } else {
        res.status(404).json({ success: false, message: "User not found" });
      }
    } catch (err) {
      console.error("DeleteUser error:", err);
      res.status(500).json({ success: false, message: "Server error while deleting user" });
    }
  };
