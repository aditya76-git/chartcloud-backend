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
    name: {
      type: String,
      required: [true, "Chart name must be provided!"],
    },
    type: {
      type: String,
      required: [true, "Chart type must be provided!"],
    },
    subType: {
      type: String,
      required: [true, "Chart subtype must be provided!"],
    },
  },
  {
    timestamps: true,
  }
);

const chart = mongoose.model("Chart", chartSchema);
export default chart;
