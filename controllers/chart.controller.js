import mongoose from "mongoose";
import Chart from "../models/chart.model.js";
import File from "../models/file.model.js";

export const listCharts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const userId = req.id; //From auth middleware

    const [charts, total] = await Promise.all([
      Chart.find({ userId }).skip(skip).limit(limit).lean(),
      Chart.countDocuments({ userId }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Charts fetched successfully",
      data: charts,
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
      message: "Server error while fetching charts",
      error,
    });
  }
};

export const getChart = async (req, res) => {
  try {
    const chartId = req.params.id;
    const userId = req.id; //From auth middleware

    if (!mongoose.Types.ObjectId.isValid(chartId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid chart ID" });
    }

    const chart = await Chart.findById(chartId);

    if (!chart) {
      return res
        .status(404)
        .json({ success: false, message: "Chart not found" });
    }

    if (chart.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized to view this chart" });
    }

    return res.status(200).json({
      success: true,
      message: "Chart fetched successfully",
      data: chart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching chart",
    });
  }
};

export const deleteChart = async (req, res) => {
  try {
    const chartId = req.params.id;
    const userId = req.id;

    const chart = await Chart.findById(chartId);

    if (!chart) {
      return res
        .status(404)
        .json({ success: false, message: "Chart not found" });
    }

    if (chart.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized to delete this chart" });
    }

    // Remove chart reference from its file
    await File.findByIdAndUpdate(chart.fileId, {
      $pull: { charts: chart._id },
    });

    await chart.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Chart deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while deleting chart",
      error,
    });
  }
};
