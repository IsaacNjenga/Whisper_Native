import UserModel from "../models/User.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { StreamChat } from "stream-chat";
import bcrypt from "bcryptjs";
import admin from "../config/firebaseAdmin.js";

dotenv.config();

const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;

const generateTokens = (user) => {
  const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "10d" },
  );

  return { accessToken, refreshToken };
};

const Register = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    const existingEmail = await UserModel.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ message: "User under this email already exists" });
    }

    const existingUsername = await UserModel.findOne({ username });
    if (existingUsername) {
      return res
        .status(400)
        .json({ message: "User under this username already exists" });
    }

    //random avatar generation logic
    const avatar = `https://api.dicebear.com/7.x/avataaars/png?seed=${username}`;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      avatar,
      password: hashedPassword,
      email: email,
      username: username,
    });
    await newUser.save();

    const serverClient = StreamChat.getInstance(api_key, api_secret);

    await serverClient.upsertUser({
      id: newUser._id.toString(),
      username,
      email,
      image: avatar,
      role: "user",
    });

    res.status(201).json({
      success: true,
      user: {
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
        id: newUser._id,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in Registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await UserModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Email address is invalid" });
    }

    if (user.authProvider !== "local") {
      return res.status(400).json({
        error: "Please login using Google",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Password is invalid" });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    user.refreshToken = refreshToken; // store in DB to track invalidations
    await user.save();

    const client = StreamChat.getInstance(api_key, api_secret);

    const stream_token = client.createToken(user.id);

    res.status(200).json({
      success: true,
      token: accessToken,
      refreshToken,
      user: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        email: user.email,
        createdAt: user.createdAt,
        stream_token: stream_token,
      },
    });
  } catch (error) {
    console.error("Error in Login:", error);
    res
      .status(500)
      .json({ message: "Internal server error", message: error.message });
  }
};

const checkEmailExists = async (req, res) => {
  const { email } = req.query;
  const emailExists = await UserModel.findOne({ email });
  if (!emailExists) return res.status(404).json({ success: false });
  res.json(emailExists);
};

const checkUserExists = async (req, res) => {
  const { username } = req.query;
  const usernameExists = await UserModel.findOne({ username });
  if (!usernameExists) return res.status(404).json({ success: false });
  res.json(usernameExists);
};

const refreshMyToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res
      .status(401)
      .json({ success: false, message: "Refresh token required" });

  try {
    // Verify token signature
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Ensure token matches one stored in DB
    const user = await UserModel.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid refresh token" });
    }

    // Generate new tokens
    const newAccessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "10d" },
    );

    const newRefreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "10d" },
    );

    // Update stored refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    console.error(err);
    res
      .status(403)
      .json({ success: false, message: "Invalid or expired refresh token" });
  }
};

const ChangePassword = async (req, res) => {
  const { resetToken, newPassword, email } = req.body;

  try {
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

    if (decoded.purpose !== "password_reset") {
      return res
        .status(400)
        .json({ error: "Invalid token. Request for a new OTP" });
    }

    const hashPassword = await bcrypt.hash(newPassword, 12);

    const user = await UserModel.findOneAndUpdate(
      { email },
      { $set: { password: hashPassword } },
      { new: true },
    );

    if (!user) {
      return res.status(400).json({ error: `User under ${email} not found` });
    }

    if (user.authProvider !== "local") {
      return res.status(400).json({
        error: "Password reset not available. Use Google login.",
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully!" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

const firebaseGoogleRegister = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        error: "Missing idToken. Cannot proceed",
      });
    }

    // ✅ verify token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const { uid, email, name, picture, email_verified } = decodedToken;

    if (!email_verified) {
      return res.status(400).json({
        error: "Email not verified",
      });
    }

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const newUser = new UserModel({
      avatar: picture,
      email,
      username: name,
      firebaseUid: uid,
    });

    await newUser.save();

    const serverClient = StreamChat.getInstance(api_key, api_secret);

    await serverClient.upsertUser({
      id: newUser._id.toString(), // ✅ FIX
      name,
      email,
      image: picture,
      role: "user",
    });

    return res.status(201).json({
      success: true,
      message: "User signed up successfully",
    });
  } catch (error) {
    console.error("Error in firebase sign up:", error);

    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};
const firebaseGoogleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        error: "Missing idToken",
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture, uid } = decodedToken;

    let user = await UserModel.findOne({ email });

    if (user.authProvider !== "firebase") {
      return res.status(400).json({
        error: "Please login using email and password",
      });
    }

    // ✅ Auto-create user if not exists (better UX)
    if (!user) {
      user = await UserModel.create({
        email,
        username: name,
        avatar: picture,
        firebaseUid: uid,
      });

      const serverClient = StreamChat.getInstance(api_key, api_secret);

      await serverClient.upsertUser({
        id: user._id.toString(),
        name,
        email,
        image: picture,
        role: "user",
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    user.refreshToken = refreshToken;
    await user.save();

    const client = StreamChat.getInstance(api_key, api_secret);

    const stream_token = client.createToken(user._id.toString());

    return res.status(200).json({
      success: true,
      token: accessToken,
      refreshToken,
      user: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        email: user.email,
        createdAt: user.createdAt,
        stream_token,
      },
    });
  } catch (error) {
    console.error("Error on firebase login:", error);

    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

export {
  Register,
  Login,
  ChangePassword,
  refreshMyToken,
  checkEmailExists,
  checkUserExists,
  firebaseGoogleLogin,
  firebaseGoogleRegister,
};
