import express from "express";
import {
  changeAvatar,
  deleteAvatar,
  deleteUser,
  fetchUser,
  fetchUsers,
  updateUser,
} from "../controllers/userController.js";
import { Register, Login } from "../controllers/authController.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

//auth routes
router.post("/sign-up", Register);
router.post("/sign-in", Login);

//user routes
router.get("/fetch-users", fetchUsers);
router.put("/update-user", protectRoute, updateUser);
router.get("/fetch-user", protectRoute, fetchUser);
router.delete("/delete-user", protectRoute, deleteUser);
router.put("/update-avatar", protectRoute, changeAvatar);
router.delete("/delete-avatar", protectRoute, deleteAvatar);

export { router as Router };
