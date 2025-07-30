import express from "express";
import { Register, Login } from "../controllers/authController.js";
import {
  updateUser,
  fetchUser,
  deleteUser,
  changeAvatar,
  deleteAvatar,
} from "../controllers/userController.js";

const router = express.Router();

//auth routes
router.post("/sign-up", Register);
router.post("/sign-in", Login);

//user routes
router.put("/update-user", updateUser);
router.get("/fetch-user", fetchUser);
router.delete("/delete-user", deleteUser);
router.put("/update-avatar", changeAvatar);
router.delete("/delete-avatar", deleteAvatar);

export { router as Router };
