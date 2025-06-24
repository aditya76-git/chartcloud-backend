import mongoose from "mongoose";
import File from "../models/file.model.js";
import XLSX from "xlsx";
import fs from "fs";

export const listFiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [files, total] = await Promise.all([
      File.find({}).skip(skip).limit(limit).lean(),
      File.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      message: "Files fetched successfully",
      data: files,
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

export const getFile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    const file = await File.findById(id);

    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }
    return res.status(200).json({
      success: true,
      message: "File fetched successfully",
      data: file,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteFile = async (req, res) => {
  try {
    // /users/:id
    const { id } = req.params;

    const deleted = await File.findByIdAndDelete(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error });
  }
};

export const getFilesStats = async (req, res) => {
  try {
    const userId = req.id; // From auth middleware
    const totalFiles = await File.countDocuments();

    const publicFiles = await File.countDocuments({ sharing: true });
    const privateFiles = await File.countDocuments({ sharing: false });

    const result = await File.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalSize: { $sum: "$fileSize" },
        },
      },
    ]);

    const totalSize = result[0]?.totalSize || 0;

    return res.status(200).json({
      success: true,
      message: "User files stats fetched successfully",
      count: {
        total: totalFiles,
        public: publicFiles,
        private: privateFiles,
      },
      sum: {
        fileSize: totalSize,
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

export const toggleFileSharing = async (req, res) => {
  try {
    const userId = req.id; // From auth middleware
    const fileId = req.params.id;
    const { sharing } = req.body; // expects: true or false

    const file = await File.findOneAndUpdate(
      { _id: fileId, userId },
      { sharing },
      { new: true }
    );

    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    res.status(200).json({
      success: true,
      message: `File is now ${file.sharing ? "public" : "private"}`,
      file,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, error: "Error updating file sharing status" });
  }
};

export const uploadFile = async (req, res) => {
  try {
    const file = req.file;
    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const parsed = data;
    const headers = Object.keys(data[0] || {});
    console.log(req.id);
    const newFile = new File({
      userId: req.id, // auth middleware
      filename: file.filename,
      sheetName,
      rows: data.length,
      columns: headers.length,
      parsed,
      fileSize: Math.round(file.size / 1024), //KB
    });

    await newFile.save();

    fs.unlink(file.path, (err) => {
      if (err) console.error("Failed to delete uploaded file:", err);
    });

    res.status(200).json({
      success: true,
      message: "File uploaded and parsed successfully.",
      file: newFile,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, error: "Error uploading or parsing file." });
  }
};
