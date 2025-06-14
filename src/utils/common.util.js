import { createHmac } from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const hmacProcess = (value, secret) => {
  // Verification code will be used here, so need to do toString()
  const result = createHmac("sha256", secret)
    .update(value.toString())
    .digest("hex");
  return result;
};

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODE_SENDING_EMAIL,
    pass: process.env.NODE_SENDING_PASSWORD,
  },
});
