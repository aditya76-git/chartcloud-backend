import {
  signupValidation,
  loginValidation,
  verificationCodeValidation,
} from "../src/validations/user.validation.js";
import z from "zod";
import User from "../models/user.model.js";
import BlockedToken from "../models/blocked-token.model.js";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../src/utils/jwt.util.js";
import { hmacProcess, transporter } from "../src/utils/common.util.js";

export const login = async (req, res) => {
  try {
    const parsed = loginValidation.parse(req.body);
    const { username, password } = parsed;

    const existingUser = await User.findOne({ username }).select("+password");

    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exists!" });
    }
    // console.log(existingUser);

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials!" });
    }

    const accessToken = generateAccessToken(username, existingUser.role);
    const refreshToken = generateRefreshToken(username, existingUser.role);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      verified: existingUser.verified,
      token: {
        access: accessToken,
        refresh: refreshToken,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validaion failed.",
        error: error.errors,
      });
    }
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error,
    });
  }
};

export const sendVerificationCode = async (req, res) => {
  // From auth middleware
  const { username, tokenType } = req;

  if (tokenType == "refresh") {
    return res
      .status(400)
      .json({ success: false, message: "Access token required" });
  }

  // console.log(username);
  try {
    const existingUser = await User.findOne({ username }).select("+password");

    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exists!" });
    }

    if (existingUser.verified) {
      return res
        .status(400)
        .json({ success: false, message: "You are already verified" });
    }

    const code = Math.floor(Math.random() * 1000000).toString();

    const info = await transporter.sendMail({
      from: `ChartCloud <${process.env.NODE_SENDING_EMAIL}>`,
      to: existingUser.email,
      subject: "ChartCloud Verification Code",
      html: "<h1>" + code + "</h1>",
    });

    // console.log(info);

    if (info.accepted[0] === existingUser.email) {
      const hashedCode = hmacProcess(code, process.env.HMAC_SECRET);

      existingUser.verificationCode = hashedCode;
      existingUser.verificationCodeExpiry = Date.now() + 10 * 60 * 1000; //10 mins
      await existingUser.save();
      return res.status(200).json({ success: true, message: "Code sent!" });
    }

    return res
      .status(400)
      .json({ success: false, message: "Something went wrong sending code" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error,
    });
  }
};

export const verifyVerificationCode = async (req, res) => {
  // From auth middlewares
  const { username, tokenType } = req;

  if (tokenType == "refresh") {
    return res
      .status(400)
      .json({ success: false, message: "Access token required" });
  }

  try {
    const parsed = verificationCodeValidation.parse(req.body);

    const { code } = parsed;

    const existingUser = await User.findOne({ username }).select(
      "+verificationCode +verificationCodeExpiry"
    );

    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exists!" });
    }

    if (existingUser.verified) {
      return res
        .status(400)
        .json({ success: false, message: "You are already verified" });
    }

    if (
      !existingUser.verificationCode ||
      !existingUser.verificationCodeExpiry
    ) {
      return res.status(400).json({
        success: false,
        message: "Request for a verification code and then hit this route.",
      });
    }

    const isExpired = Date.now() > existingUser.verificationCodeExpiry;

    if (isExpired) {
      return res.status(400).json({
        success: false,
        message: "Code has been expired",
      });
    }

    const hashedCode = hmacProcess(code, process.env.HMAC_SECRET);

    console.log("hashedCode", hashedCode);
    console.log("existingUser.verificationCode", existingUser.verificationCode);

    if (hashedCode === existingUser.verificationCode) {
      existingUser.verified = true;
      existingUser.verificationCode = undefined;
      existingUser.verificationCodeExpiry = undefined;

      await existingUser.save();
      return res
        .status(200)
        .json({ success: true, message: "Your account has been verified!" });
    }

    return res.status(400).json({ success: true, message: "Invalid code!" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validaion failed.",
        error: error.errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
      error,
    });
  }
};

export const logout = async (req, res) => {
  // From auth middleware
  const { token, tokenType } = req;

  if (tokenType == "access") {
    return res
      .status(400)
      .json({ success: false, message: "Refresh token required" });
  }

  try {
    // On logout, we want to add the token, so that new access tokens can't be generated
    await BlockedToken.create({ token });
    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch {
    return res
      .status(400)
      .json({ success: false, message: "Already logged out" });
  }
};

export const signup = async (req, res) => {
  try {
    const parsed = signupValidation.parse(req.body);

    const { username, email, password } = parsed;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      accountType: "email",
      role: "user",
    });
    await user.save();

    res.status(201).json({
      errro: false,
      message: "Your account has been created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors,
        message: "Validation failed.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
      error,
    });
  }
};

export const refreshAccessToken = (req, res) => {
  // From auth middleware
  const { username, tokenType, role } = req;

  console.log(role);

  if (tokenType == "access") {
    return res
      .status(400)
      .json({ success: false, message: "Refresh token required" });
  }

  const newAccessToken = generateAccessToken(username, role);

  return res.status(200).json({
    success: true,
    message: "Access token refreshed successfully",
    token: {
      access: newAccessToken,
    },
  });
};
