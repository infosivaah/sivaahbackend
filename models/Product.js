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
seo: {
  title: { type: String },
  description: { type: String },
  keywords: { type: String }
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
