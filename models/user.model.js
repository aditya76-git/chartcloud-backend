import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required."],
      unique: [true, "Username must be unique!"],
      lowerCase: true,
      trim: true,
      minLength: [5, "Username must have 5 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      unique: [true, "Email must be unique!"],
      minLength: [5, "Email must have 5 characters"],
      lowerCase: true,
    },
    password: {
      type: String,
      required: [true, "Password must be provided!"],
      trim: true,
      select: false,
    },
    role: {
      type: String,
      required: [true, "Role must be provided!"],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    accountType: {
      type: String,
      required: [true, "Account type must be provided!"],
    },
    profilePicture: {
      type: String,
    },
    verificationCode: {
      type: String,
      select: false,
    },
    verificationCodeExpiry: {
      type: Number,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

const user = mongoose.model("User", userSchema);
export default user;
