import mongoose from "mongoose";

const fileSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    filename: {
      type: String,
    },
    sheetName: {
      type: String,
    },
    rows: {
      type: Number,
      required: [true, "Rows must be provided!"],
    },
    columns: {
      type: Number,
      required: [true, "Columns must be provided!"],
    },
    parsed: {
      type: [
        {
          type: Object,
          required: true,
        },
      ],
      required: [true, "Parsed data must be provided!"],
    },

    fileSize: {
      type: Number,
      required: [true, "filesize must be provided!"],
    },
    sharing: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const file = mongoose.model("File", fileSchema);
export default file;
