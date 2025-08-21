import models from "../models/index.js";
import bcrypt from "bcrypt";

// ✅ Get all places with images
export const getAllPlaces = async (req, res) => {
  try {
    const places = await models.places.findAll({
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
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Add a new place
export const addPlace = async (req, res) => {
  try {
    const { name, address, description, latitude, longitude } = req.body;
    const files = req.files;

    const newPlace = await models.places.create({
      name,
      address,
      description,
      latitude,
      longitude,
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
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Delete a place
export const DeletePlace = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "ID missing" });

    const deleted = await models.places.destroy({ where: { id } });
    if (deleted) {
      res.status(200).json({ success: true, message: "Location deleted successfully" });
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

// ✅ Add a new user
export const Users = async (req, res) => {
  try {
    const { name, username, email, phone, password, confirmPassword, address, dob, gender } = req.body;

    if (!name || !username || !email || !password || !confirmPassword)
      return res.status(400).json({ message: "Required fields missing" });

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

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
    });

    res.json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
};

// ✅ Get all users
export const UserGet = async (req, res) => {
  try {
    const users = await models.users.findAll();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
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
    res.status(500).json({ message: "Server error" });
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
