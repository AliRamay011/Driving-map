import express from "express";
import { getAllPlaces, addPlace , DeletePlace, UpdatePlace} from "../contoller/LocationController.js";
import AdminLogin from "../contoller/adminController.js";
import upload from "../middleWare/multerConfig.js"; // ✅ multer config import

const router = express.Router();

router.get("/locations", getAllPlaces);
router.post("/admin/login", AdminLogin);
router.delete("/places/:id", DeletePlace);
router.put("/update/:id", UpdatePlace);
router.post("/places", upload.array("images", 10), addPlace); // ✅ Multer here

export default router;
