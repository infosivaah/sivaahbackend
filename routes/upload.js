const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const auth = require("../middleware/auth");
const streamifier = require("streamifier");

const router = express.Router();

/* ===========================
   MULTER CONFIG
=========================== */

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 12 * 1024 * 1024 // ✅ 12MB per image (safe)
  }
});

/* ===========================
   CLOUDINARY STREAM (SAFE)
=========================== */

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "sivaah-products",

        // 🔥 VERY IMPORTANT
        timeout: 120000, // 120 seconds

        quality: "auto:eco",
        fetch_format: "auto",
        strip_metadata: true
      },
      (error, result) => {
        if (error) {
          console.error("CLOUDINARY ERROR:", error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

/* ===========================
   ROUTE
=========================== */

router.post(
  "/",
  auth,

  (req, res, next) => {
    upload.array("images", 4)(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          message: "Image too large. Max 12MB per image."
        });
      } else if (err) {
        return res.status(500).json({
          message: err.message || "Upload error"
        });
      }
      next();
    });
  },

  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const urls = [];

      // ✅ UPLOAD ONE BY ONE (CRITICAL FIX)
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        urls.push(url);
      }

      res.json({ urls });
    } catch (err) {
      console.error("UPLOAD FAILED:", err);
      res.status(500).json({
        message: "Image upload failed"
      });
    }
  }
);

module.exports = router;
