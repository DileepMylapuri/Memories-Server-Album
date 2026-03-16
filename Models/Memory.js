const mongoose = require("mongoose");

const memorySchema = new mongoose.Schema(
  {
    fileUrl: { type: String, required: true },
    type: { type: String, enum: ["image", "video"], required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Memory", memorySchema);