const mongoose = require("mongoose");

const journeySchema = new mongoose.Schema({
  type: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Journey", journeySchema);