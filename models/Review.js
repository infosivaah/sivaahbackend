const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    /* =========================
       PRODUCT ID - OPTIONAL
    ========================= */

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false,
      index: true,
    },

    /* =========================
       CUSTOMER NAME
    ========================= */

    name: {
      type: String,
      required: true,
      trim: true,
    },

    /* =========================
       RATING
    ========================= */

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    /* =========================
       REVIEW
    ========================= */

    review: {
      type: String,
      required: true,
      trim: true,
    },

    /* =========================
       WHAT CUSTOMER LIKED
    ========================= */

    liked: {
      type: [String],
      default: [],
    },

    /* =========================
       PURCHASE CHANNEL
       OPTIONAL
    ========================= */

    channel: {
      type: String,
      trim: true,
      default: "",
    },

    /* =========================
       CUSTOMER PHOTOS
       Cloudinary URLs
    ========================= */

    photos: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Review", ReviewSchema);