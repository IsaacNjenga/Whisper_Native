import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
    },
    otp: {
      type: String, // hashed OTP
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 120,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: false },
);

export const OtpModel = mongoose.model("Otp", otpSchema);
