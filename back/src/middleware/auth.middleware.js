import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import UserModel from "../models/User.js";

dotenv.config();

const protectRoute = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token provided. Access denied!" });
    } else {
      //verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      //find user by id from db
      const user = await UserModel.findById(decoded.userId).select("-password");
      if (!user) return res.status(401).json({ message: "Token is not valid" });

      req.user = user;
      next();
    }
  } catch (error) {
    console.error("Error in middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default protectRoute;
