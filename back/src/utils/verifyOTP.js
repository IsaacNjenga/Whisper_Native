import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OtpModel } from "../models/OTP.js";

export const verifyOtp = async (req, res) => {
  try {
    const { otp, email } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const record = await OtpModel.findOne({ email: normalizedEmail });

    if (!record) {
      return res.status(400).json({ error: "OTP not found or expired" });
    }

    if (record.verified) {
      return res.status(400).json({ error: "OTP already used" });
    }

    if (record.attempts >= 5) {
      return res.status(400).json({ error: "Too many attempts" });
    }

    const isMatch = await bcrypt.compare(cleanOtp, record.otp);

    if (!isMatch) {
      record.attempts += 1;
      await record.save();

      return res.status(400).json({ error: "Invalid OTP" });
    }

    // ✅ mark as verified
    record.verified = true;
    await record.save();

    // ✅ issue reset token
    const resetToken = jwt.sign(
      { email: normalizedEmail, purpose: "password_reset" },
      process.env.JWT_SECRET,
      { expiresIn: "10m" },
    );

    return res.status(200).json({
      success: true,
      resetToken,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

