import express from "express";
import { Login, Register } from "../controllers/authController.js";
import {
  changeAvatar,
  deleteAvatar,
  deleteUser,
  fetchUser,
  fetchUsers,
  updateUser,
} from "../controllers/userController.js";

const router = express.Router();

//auth routes
router.post("/sign-up", Register);
router.post("/sign-in", Login);

//user routes
router.get("/fetch-users", fetchUsers);
router.put("/update-user", updateUser);
router.get("/fetch-user", fetchUser);
router.delete("/delete-user", deleteUser);
router.put("/update-avatar", changeAvatar);
router.delete("/delete-avatar", deleteAvatar);

export { router as Router };
