const express = require("express");
const router = express.Router();
const MetalRate = require("../models/MetalRate");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

/* GET CURRENT RATE */
router.get("/", async (req, res) => {
  const rateDoc = await MetalRate.findOne({ metal: "silver" });

  if (!rateDoc) {
    return res.json({ rate: null });
  }

  res.json({
    rate: rateDoc.ratePerGram
  });
});


/* UPDATE RATE + REPRICE ALL PRODUCTS */
router.post("/", auth, async (req, res) => {
  const { ratePerGram } = req.body;

  if (!ratePerGram) {
    return res.status(400).json({ message: "Rate required" });
  }

  let rate = await MetalRate.findOneAndUpdate(
    { metal: "silver" },
    { ratePerGram, updatedAt: new Date() },
    { upsert: true, new: true }
  );

  // 🔥 UPDATE ALL PRODUCTS
  const products = await Product.find();

  for (let p of products) {
    const newPrice =
      p.grams * ratePerGram +
      p.grams * p.labourPerGram;

    p.price = Math.round(newPrice);
    await p.save();
  }

  res.json({
    message: "Rate updated & products repriced",
    rate
  });
});

module.exports = router;
