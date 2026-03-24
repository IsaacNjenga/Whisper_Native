import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({});

const user = process.env.EMAIL_USER;
const password = process.env.EMAIL_PASS;

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: user,
    pass: password,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
