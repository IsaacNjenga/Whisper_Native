import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OtpModel } from "../models/OTP.js";

export const verifyOtp = async (req, res) => {
  const { otp, email } = req.body;
  const normalizedEmail = email.toLowerCase().trim();
  const cleanOtp = String(otp).trim();
  console.log("Entered OTP:", cleanOtp);

  const record = await OtpModel.findOne({ email: normalizedEmail });
  
  const isMatch = await bcrypt.compare(cleanOtp, record.otp);
  console.log("match!", isMatch);
  
  console.log(record);

  if (!record) {
    throw new Error("OTP not found or expired");
  }

  if (record.attempts >= 5) {
    await OtpModel.deleteOne({ email: normalizedEmail });
    throw new Error("Too many attempts");
  }

  // increment attempts
  record.attempts += 1;
  await record.save();

//   const isMatch = await bcrypt.compare(cleanOtp, record.otp);

//   console.log("match!", isMatch);

  if (!isMatch) {
    throw new Error("Invalid OTP");
  }

  // ✅ delete after success
  await OtpModel.deleteOne({ email: normalizedEmail });

  // ✅ issue reset token
  const resetToken = jwt.sign(
    { email: normalizedEmail, purpose: "password_reset" },
    process.env.JWT_SECRET,
    { expiresIn: "10m" },
  );

  return resetToken;
};
