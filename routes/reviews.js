const express = require("express");
const router = express.Router();

const Review = require("../models/Review");


/* =========================================================
   GET REVIEWS
   ---------------------------------------------------------
   /api/reviews
   → Get all reviews

   /api/reviews?productId=PRODUCT_ID
   → Get reviews for a specific product

   productId is OPTIONAL
========================================================= */

router.get("/", async (req, res) => {
  try {
    const filter = {};

    // Product ID is optional
    if (req.query.productId) {
      filter.productId = req.query.productId;
    }

    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(reviews);

  } catch (err) {
    console.error("Get Reviews Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});


/* =========================================================
   ADD REVIEW
   ---------------------------------------------------------
   POST /api/reviews

   Required:
   - name
   - rating
   - review

   Optional:
   - productId
   - liked
   - channel
   - photos
========================================================= */

router.post("/", async (req, res) => {
  try {
    const {
      productId,
      name,
      rating,
      review,
      liked,
      channel,
      photos,
    } = req.body;


    /* =====================================================
       REQUIRED FIELDS
       -----------------------------------------------------
       productId is NOT required
    ===================================================== */

    if (!name || !rating || !review) {
      return res.status(400).json({
        message: "Name, rating and review are required",
      });
    }


    /* =====================================================
       CLEAN NAME
    ===================================================== */

    const cleanName = String(name).trim();

    if (!cleanName) {
      return res.status(400).json({
        message: "Name is required",
      });
    }


    /* =====================================================
       RATING VALIDATION
       -----------------------------------------------------
       Rating must be 1, 2, 3, 4 or 5
    ===================================================== */

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }


    /* =====================================================
       REVIEW
       -----------------------------------------------------
       No length validation
    ===================================================== */

    const cleanReview = String(review).trim();

    if (!cleanReview) {
      return res.status(400).json({
        message: "Review is required",
      });
    }


    /* =====================================================
       LIKED OPTIONS
       -----------------------------------------------------
       Optional array
    ===================================================== */

    const cleanLiked = Array.isArray(liked)
      ? liked
          .filter(
            (item) =>
              typeof item === "string"
          )
          .map((item) => item.trim())
          .filter(Boolean)
      : [];


    /* =====================================================
       CHANNEL
       -----------------------------------------------------
       Optional text field
    ===================================================== */

    const cleanChannel =
      typeof channel === "string"
        ? channel.trim()
        : "";


    /* =====================================================
       PHOTOS
       -----------------------------------------------------
       Optional Cloudinary URLs

       Maximum 3 photos
    ===================================================== */

    const cleanPhotos = Array.isArray(photos)
      ? photos
          .filter(
            (photo) =>
              typeof photo === "string" &&
              photo.trim()
          )
          .map((photo) => photo.trim())
          .slice(0, 3)
      : [];


    /* =====================================================
       REVIEW DATA
    ===================================================== */

    const reviewData = {
      name: cleanName,

      rating: numericRating,

      review: cleanReview,

      liked: cleanLiked,

      channel: cleanChannel,

      photos: cleanPhotos,
    };


    /* =====================================================
       PRODUCT ID
       -----------------------------------------------------
       OPTIONAL

       Only add it when supplied.
    ===================================================== */

    if (productId) {
      reviewData.productId = productId;
    }


    /* =====================================================
       CREATE REVIEW
    ===================================================== */

    const newReview = new Review(reviewData);


    /* =====================================================
       SAVE
    ===================================================== */

    await newReview.save();


    /* =====================================================
       RESPONSE
    ===================================================== */

    res.status(201).json({
      message: "Review submitted successfully",

      review: newReview,
    });

  } catch (err) {
    console.error("Add Review Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});


module.exports = router;