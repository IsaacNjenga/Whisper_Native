import dotenv from "dotenv";
import UserModel from "../models/User.js";
import { StreamChat } from "stream-chat";

dotenv.config();

const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;

const serverClient = StreamChat.getInstance(api_key, api_secret);
const client = StreamChat.getInstance(api_key, api_secret);

const generateStreamToken = async (id) => {
  try {
    return serverClient.createToken(id.toString());
  } catch (error) {
    console.log("Error in token generation", error);
    throw new Error("Token generation failed");
  }
};

const Register = async (req, res) => {
  const { username, password, email } = req.body;
  try {
    if (!email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 12) {
      return res
        .status(400)
        .json({ message: "Password must be at least 12 characters long" });
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
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    const newUser = new UserModel({ ...req.body, avatar });
    await newUser.save();

    const token = await generateStreamToken(newUser._id);

    await client.upsertUser({
      id: newUser._id,
      email: newUser.email,
      name: newUser.username,
      image: newUser.avatar,
    });

    res.status(201).json({
      success: true,
      stream_token: token,
      user: {
        _id: newUser._id,
        username: newUser.username,
        avatar: newUser.avatar,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.log("Error registering user", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Credentials are invalid" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Credentials are invalid" });
    }

    const token = await generateStreamToken(user._id);

    res.status(200).json({
      success: true,
      stream_token: token,
      user: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.log("Error signing in user", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export { Register, Login };
