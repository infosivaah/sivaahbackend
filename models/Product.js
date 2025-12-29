const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    unique: true
  },
  subtitle: String,

  emotion: {
    type: String,
    enum: ["Protection", "Strength", "Abundance"]
  },

  description: String,
  benefits: [String],

  price: Number,
  mrp: Number,

  images: [String],

  material: {
    type: String,
    default: "925 Silver"
  },

  stock: Number,

  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Product", ProductSchema);
