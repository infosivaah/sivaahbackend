const express = require("express");
const router = express.Router();

const Review = require("../models/Review");



/* =========================
   GET REVIEWS OF PRODUCT
========================= */

router.get("/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({
      productId: req.params.productId,
    }).sort({ createdAt: -1 });

    res.json(reviews);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});



/* =========================
   ADD REVIEW
========================= */

router.post("/", async (req, res) => {
  try {
    const {
      productId,
      name,
      rating,
      review,
    } = req.body;

    if (
      !productId ||
      !name ||
      !rating ||
      !review
    ) {
      return res.status(400).json({
        message: "All fields required",
      });
    }

    const newReview = new Review({
      productId,
      name,
      rating,
      review,
    });

    await newReview.save();

    res.status(201).json(newReview);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});



module.exports = router;