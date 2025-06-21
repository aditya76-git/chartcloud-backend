import mongoose from "mongoose";
import User from "../models/user.model.js";

export const listUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({}, "-password").skip(skip).limit(limit).lean(),
      User.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error });
  }
};

export const deleteUser = async (req, res) => {
  try {
    // /users/:id
    const { id } = req.params;

    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ verified: true });
    const unverifiedUsers = totalUsers - verifiedUsers;

    const emailUsers = await User.countDocuments({ accountType: "email" });
    const githubUsers = await User.countDocuments({ accountType: "github" });
    const googleUsers = await User.countDocuments({ accountType: "google" });

    return res.status(200).json({
      success: true,
      message: "User stats fetched successfully",
      count: {
        total: totalUsers,
        verified: verifiedUsers,
        unverified: unverifiedUsers,
        google: googleUsers,
        github: githubUsers,
        email: emailUsers,
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user stats",
    });
  }
};
