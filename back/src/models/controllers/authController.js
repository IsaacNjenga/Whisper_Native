import UserModel from "../User.js";
import { connectDB } from "../../config/db.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const generateTokens = (user) => {
  const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "30m" },
  );

  return { accessToken, refreshToken };
};

const Register = async (req, res) => {
  await connectDB();
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

    const newUser = new UserModel({ ...req.body, avatar });
    await newUser.save();

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
  await connectDB();
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Email address is invalid" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Password is invalid" });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken; // store in DB to track invalidations
    await user.save();

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
      },
    });
  } catch (error) {
    console.error("Error in Login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const checkEmailExists = async (req, res) => {
  const { email } = req.query;
  const emailExists = await UserModel.findOne({ email });
  res.json(emailExists);
};

const checkUserExists = async (req, res) => {
  const { username } = req.query;
  const usernameExists = await UserModel.findOne({ username });
  res.json(usernameExists);
};

const refreshMyToken = async (req, res) => {
  await connectDB();
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
      { expiresIn: "1h" },
    );

    const newRefreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "30m" },
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

const ChangePassword = async (req, res) => {};

export {
  Register,
  Login,
  ChangePassword,
  refreshMyToken,
  checkEmailExists,
  checkUserExists,
};
