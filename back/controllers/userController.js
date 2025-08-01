import { StreamChat } from "stream-chat";
import cloudinary from "../config/cloudinary.js";
import UserModel from "../models/User.js";

const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;

const client = StreamChat.getInstance(api_key, api_secret);

const fetchUsers = async (req, res) => {
  try {
    const users = await UserModel.find({}).select(
      "_id username email avatar createdAt"
    );

    if (!users || users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No users found" });
    }
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.log("Error on fetching users", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const fetchUser = async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(404).json({ message: "No ID specified" });
  try {
    const user = await UserModel.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, userDetails: user });
  } catch (error) {
    console.log("Error on user fetch", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(404).json({ message: "No ID specified" });
  const { email, avatar } = req.body;

  const updates = {};
  if (email) updates.email = email;
  if (avatar) updates.avatar = avatar;

  try {
    const user = await UserModel.findByIdAndUpdate(
      { _id: id },
      { $set: updates },
      { new: true }
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const updatedUser = await client.upsertUser({
      id,
      email: email || "noemail@example.com",
      image: avatar || null,
    });
    return res.status(200).json({
      success: true,
      user: {
        _id: updatedUser._id,
        avatar: updatedUser.image,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.log("Error on user update", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const changeAvatar = async (req, res) => {
  const { image } = req.body;
  const { id } = req.query;
  if (!id) return res.status(404).json({ message: "No ID specified" });
  if (!image) return res.status(400).json({ message: "No image provided" });

  try {
    const uploadedResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadedResponse.secure_url;

    if (!uploadedResponse) {
      return res.status(500).json({ message: "Image upload failed" });
    }

    const user = await UserModel.findByIdAndUpdate(
      { _id: id },
      { $set: { avatar: imageUrl } },
      { new: true }
    );

    await client.upsertUser({
      id,
      email: user.email,
      image: imageUrl,
    });

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        avatar: user.avatar,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Error on avatar change", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const deleteAvatar = async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(404).json({ message: "No ID specified" });
  try {
    const user = await UserModel.findByIdAndUpdate(
      { _id: id },
      { $set: { avatar: null } },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await client.upsertUser({
      id,
      email: user.email,
      image: null,
    });

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        avatar: user.avatar,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Error on avatar delete", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(404).json({ message: "No ID specified" });
  try {
    await UserModel.findByIdAndDelete({ _id: id });
    await client.deleteUser(id, {
      delete_conversation_channels: true,
      mark_messages_deleted: true,
      hard_delete: true,
    });
    return res
      .status(200)
      .json({ success: true, message: "Successfully deleted!" });
  } catch (error) {
    console.log("Error on user delete", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export {
  changeAvatar,
  deleteAvatar,
  deleteUser,
  fetchUser,
  fetchUsers,
  updateUser,
};
