const mongoose = require("mongoose");

const metalRateSchema = new mongoose.Schema({
  metal: {
    type: String,
    default: "silver",
    unique: true
  },

  ratePerGram: {
    type: Number,
    required: true
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("MetalRate", metalRateSchema);
