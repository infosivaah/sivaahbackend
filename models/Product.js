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
  enum: [
    "Protection",
    "Strength",
    "Abundance",
    "Balance",
    "Healing",
    "Love",
    "Peace",
    "Focus",
    "Grounding",
    "Good Luck",
    "Care"
  ],
  default: "Protection"
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
grams: {
  type: Number,
  required: true
},

labourPerGram: {
  type: Number,
  required: true
},

  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Product", ProductSchema);
