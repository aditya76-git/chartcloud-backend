import mongoose from "mongoose";

const chartSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true,
    },
    data: {
      type: [
        {
          type: Object,
        },
      ],
      required: [true, "Chart Data must be provided!"],
    },
    config: {
      type: Object,
      required: [true, "Chart Config must be provided!"],
    },
    xAxisDataKey: {
      type: String,
      required: [true, "xDataKey must be provided!"],
    },
    yAxisDataKey: {
      type: String,
      required: [true, "yDataKey must be provided!"],
    },
    legend: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const chart = mongoose.model("Chart", chartSchema);
export default chart;
