import mongoose from "mongoose";
import File from "../models/file.model.js";
import Chart from "../models/chart.model.js";
import XLSX from "xlsx";
import fs from "fs";

export const listFiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const userId = req.id; // From auth middleware

    const [files, total] = await Promise.all([
      File.find({ userId }).skip(skip).limit(limit).lean(),
      File.countDocuments({ userId }),
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
    return res.status(500).json({
      success: false,
      message: "Server error",
      error,
    });
  }
};

export const getFile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.id; //auth middleware

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    const file = await File.findById(id);

    if (file.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized to view this file" });
    }

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
    const { id } = req.params;
    const userId = req.id; // auth middleware

    const file = await File.findById(id);

    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    if (file.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized to delete this file" });
    }

    await file.deleteOne();

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

    const totalFiles = await File.countDocuments({ userId });

    const publicFiles = await File.countDocuments({
      userId,
      sharing: true,
    });

    const privateFiles = await File.countDocuments({
      userId,
      sharing: false,
    });

    const result = await File.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
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
        .json({ success: false, message: "File not found or Unauthorized" });
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

export const addChartToFile = async (req, res) => {
  try {
    const userId = req.id; // From auth middleware
    const { chart, dataKey } = req.body;

    if (!chart?.config || !chart?.data) {
      return res.status(400).json({
        success: false,
        message: "Chart config and data are required.",
      });
    }

    if (!dataKey?.xAxis || !dataKey?.yAxis) {
      return res
        .status(400)
        .json({ success: false, message: "x and y data keys are required." });
    }

    const fileId = req.params.id;

    const file = await File.findById(fileId);
    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "File not found." });
    }

    const newChart = await Chart.create({
      userId,
      fileId,
      config: chart.config,
      data: chart.data,
      xAxisDataKey: dataKey.xAxis,
      yAxisDataKey: dataKey.yAxis,
      name: chart.name,
      type: chart.type,
      subType: chart.subType,
    });

    file.charts.push(newChart._id);
    await file.save();

    return res.status(201).json({
      success: true,
      message: "Chart created and linked to file successfully.",
      chart: newChart,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

export const getChartsFromFileId = async (req, res) => {
  const { id } = req.params; // fileId
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found.",
      });
    }

    if (!file.sharing) {
      return res.status(403).json({
        success: false,
        message: "Access denied. File is not shared.",
      });
    }

    const [charts, total] = await Promise.all([
      Chart.find({ fileId: id }).skip(skip).limit(limit).lean(),
      Chart.countDocuments({ fileId: id }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Charts fetched successfully",
      data: charts,
      file,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching shared charts:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching charts",
      error,
    });
  }
};
