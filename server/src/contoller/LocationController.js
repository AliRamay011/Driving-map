// controllers/placesController.js
import db from "../config/db.js";
import bcrypt from 'bcrypt'
// Get all places with images
export const getAllPlaces = (req, res) => {
  const query = `
    SELECT p.*, GROUP_CONCAT(pi.image_url) AS images
    FROM places p
    LEFT JOIN place_images pi ON p.id = pi.place_id
    GROUP BY p.id
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching places:", err);
      return res.status(500).json({ error: "Server error" });
    }
    res.json({ success: true, data: results });
  });
};

// Add a new place
export const addPlace = (req, res) => {
  const { name, address, description, latitude, longitude, images } = req.body;
  const files = req.files; // ✅ multer stores uploaded files here
  const placeQuery = `
    INSERT INTO places (name, address, description, latitude, longitude)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    placeQuery,
    [name, address, description, latitude, longitude],
    (err, result) => {
      if (err) {
        console.error("❌ Error adding place:", err);
        return res.status(500).json({ error: "Server error" });
      }
      const placeId = result.insertId;

      if (files && files.length > 0) {
        const imgValues = files.map((file) => [
          placeId,
          `/uploads/${file.filename}`,
        ]);

        db.query(
          "INSERT INTO place_images (place_id, image_url) VALUES ?",
          [imgValues],
          (err2) => {
            if (err2) return res.status(500).json({ error: "Server error" });
            res.json({ success: true, message: "Place and images added" });
          }
        );
      } else {
        res.json({ success: true, message: "Place added without images" });
      }
    }
  );
};

export const DeletePlace = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "ID missing" });

    const [result] = await db.promise().query("DELETE FROM places WHERE id = ?", [id]);

    if (result.affectedRows > 0) {
      return res.status(200).json({ success: true, message: "Location deleted successfully" });
    } else {
      return res.status(404).json({ success: false, message: "Location not found" });
    }
  } catch (err) {
    console.error("DeletePlace error:", err);
    return res.status(500).json({ success: false, message: "Server error while deleting location" });
  }
};
export const UpdatePlace = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "ID missing" });

    const { name, address, description, latitude, longitude } = req.body;

    const [result] = await db
      .promise()
      .query(
        "UPDATE places SET name = ?, address = ?, description = ?, latitude = ?, longitude = ? WHERE id = ?",
        [name, address, description, latitude, longitude, id]
      );

    if (result.affectedRows > 0) {
      return res.status(200).json({ success: true, message: "Location updated" });
    } else {
      return res.status(404).json({ success: false, message: "Location not found" });
    }
  } catch (err) {
    console.error("UpdatePlace error:", err);
    return res.status(500).json({ success: false, message: "Server error while updating location" });
  }
};



export const Users = async (req, res) => {
  const {
    name,
    username,
    email,
    phone,
    password,
    confirmPassword,
    address,
    dob,
    gender
  } = req.body;

  if (!name || !username || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const profile = req.file ? req.file.filename : null;

  const query = `
    INSERT INTO users 
    (name, username, email, phone, password, address, dob, gender, profile) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [name, username, email, phone, hashedPassword, address, dob, gender, profile],
    (err, result) => {
      if (err) {
        console.log(err);
        
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.json({ message: "User registered successfully", userId: result.insertId });
    }
  );
};


export const UserGet = (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

export const UpdateUsers = (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ message: "Id Missing" });

  const { name, username, email, phone, password, address, dob, gender, profile } = req.body;

  const sql = "UPDATE users SET name=?, username=?, email=?, phone=?, password=?, address=?, dob=?, gender=?, profile=? WHERE id=?";
  const values = [name, username, email, phone, password, address, dob, gender, profile, id];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (result.affectedRows > 0) {
      return res.status(200).json({
        success: true,
        message: "User updated",
        user: { id, name, username, email, phone, password, address, dob, gender, profile }
      });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  });
};


export const DeleteUsers = (req , res) =>{
      try{
  const id = req.params.id ; 
       if(!id) return res.json({message : "Id Missing"})
         
        const result = db.query("DELETE FROM users WHERE id = ?" , [id] ) ;
        if (result.affectedRows > 0) {
      return res.status(200).json({ success: true, message: "User deleted successfully" });
    } else {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    }
  catch (err) {
    console.error("DeletePlace error:", err);
    return res.status(500).json({ success: false, message: "Server error while deleting User" });
  }


          

}

