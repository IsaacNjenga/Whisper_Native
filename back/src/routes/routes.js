import express from "express";
import {
  changeAvatar,
  deleteAvatar,
  deleteUser,
  fetchUser,
  fetchUsers,
  updateUser,
} from "../controllers/userController.js";
import {
  Register,
  Login,
  checkUserExists,
  checkEmailExists,
  refreshMyToken,
  ChangePassword,
} from "../controllers/authController.js";
import protectRoute from "../middleware/auth.middleware.js";
import { otpRequest } from "../utils/requestOTP.js";
import { verifyOtp } from "../utils/verifyOTP.js";

const router = express.Router();

//auth routes
router.post("/auth/sign-up", Register);
router.post("/auth/sign-in", Login);
router.post("/auth/email-check", checkEmailExists);
router.post("/auth/user-check", checkUserExists);
router.post("/auth/token-refresh", refreshMyToken);
router.post("/auth/change-password", ChangePassword);
router.post("/auth/request-otp", otpRequest);
router.post("/auth/verify-otp", verifyOtp);

//user routes
router.get("/fetch-users", fetchUsers);
router.put("/update-user", protectRoute, updateUser);
router.get("/fetch-user", protectRoute, fetchUser);
router.delete("/delete-user", protectRoute, deleteUser);
router.put("/update-avatar", protectRoute, changeAvatar);
router.delete("/delete-avatar", protectRoute, deleteAvatar);

export { router as Router };
