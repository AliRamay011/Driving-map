import express from "express";
import passport from "passport";
import { getAllPlaces, addPlace , DeletePlace, UpdatePlace, Users, UserGet, UpdateUsers, DeleteUsers, VerifyEmail} from "../controller/LocationController.js";
import { AdminLogin,  AdminProfile,  DeleteProfile,  getAdmin,  UpdateAdmin } from "../controller/adminController.js";
import upload from "../middleware/multerConfig.js"; // ✅ multer config import
import { ReportGet, ReportPost } from "../controller/reportUser.js";
import { GoggleUser , googleCallBack, loginUser,  logoutUser,  registerUser } from "../controller/userController.js";
const router = express.Router();

router.post("/admin/profile",upload.single("profile"), AdminProfile); // ✅ Multer here
router.delete("/admin/DeleteProfile/:id" , DeleteProfile); // ✅ Multer here
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
router.post("/report" , ReportPost)
router.get("/report" , ReportGet)
router.put("/updateAdmin",  UpdateAdmin);
router.get("/verify/:token",  VerifyEmail);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", GoggleUser);
router.post("/logout", logoutUser);
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback",passport.authenticate("google", { failureRedirect: "/" }) ,googleCallBack) ;



export default router;
