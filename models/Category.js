const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: [true, "Category type is required"],
    },
    color: {
      type: String,
      default: "#6366f1", // default indigo color
    },
    icon: {
      type: String,
      default: "tag",
    },
  },
  { timestamps: true }
);

// Prevent duplicate category names per user per type
categorySchema.index({ user: 1, name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);
