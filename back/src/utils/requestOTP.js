import dotenv from "dotenv";
import otpGenerator from "otp-generator";
import bcrypt from "bcryptjs";
import { OtpModel } from "../models/OTP.js";
import { transporter } from "./mailer.js";

dotenv.config({});

export const otpRequest = async (req, res) => {
  const { to } = req.body;
  const email = to.toLowerCase().trim();

  const otp = otpGenerator.generate(6, {
    digits: true,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const hashedOtp = await bcrypt.hash(otp, 10);

  try {
    // ❗ delete existing OTP for this email (important)
    await OtpModel.deleteOne({ email });

    // ✅ create new OTP record
    await OtpModel.create({
      email,
      otp: hashedOtp,
    });

    const mailOptions = {
      from: `Support Team`,
      to,
      subject: "Your Verification Code",
      html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #4CAF50;">Verification Code</h2>
      
      <p>Hello,</p>
      
      <p>You requested a one-time password (OTP). Use the code below to proceed:</p>
      
      <div style="
        font-size: 24px;
        font-weight: bold;
        letter-spacing: 4px;
        margin: 20px 0;
        padding: 10px;
        background: #f4f4f4;
        display: inline-block;
        border-radius: 5px;
      ">
        ${otp}
      </div>
      
      <p>This code will expire in <strong>2 minutes</strong>.</p>
      
      <p>If you did not request this, please ignore this email.</p>
      
      <br/>
      <p>— Your Support Team</p>
    </div>
  `,
    };
    await transporter.sendMail(mailOptions);
    res.status(201).json({
      success: true,
      message: "OTP sent! Otp will expire in 2 minutes",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Could not send email" });
  }
};
