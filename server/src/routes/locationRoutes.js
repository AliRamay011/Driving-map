import express from "express";
import { getAllPlaces, addPlace , DeletePlace, UpdatePlace, Users, UserGet, UpdateUsers, DeleteUsers} from "../controller/LocationController.js";
import { AdminLogin,  getAdmin,  UpdateAdmin } from "../controller/adminController.js";
import upload from "../middleware/multerConfig.js"; // ✅ multer config import

const router = express.Router();

router.get("/locations", getAllPlaces);
router.get("/userGet", UserGet);
router.post("/admin/login", AdminLogin);
router.delete("/places/:id", DeletePlace);
router.delete("/users/:id", DeleteUsers);
router.put("/update/:id", UpdatePlace);
router.put("/updateUser/:id", upload.single("profile"), UpdateUsers);
router.post("/places", upload.array("images", 10), addPlace); // ✅ Multer here
router.post("/users",upload.single("profile"), Users ); // ✅ Multer here
router.get("/getAdmin", getAdmin);
router.put("/updateAdmin",  UpdateAdmin);


export default router;
