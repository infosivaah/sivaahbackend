const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const auth = require("../middleware/auth");

/* ================= PUBLIC ================= */

router.get("/", async (req, res) => {
  const products = await Product.find({ isActive: true });
  res.json(products);
});

router.get("/slug/:slug", async (req, res) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    isActive: true
  });

  if (!product) return res.status(404).json({ message: "Not found" });
  res.json(product);
});

/* ================= ADMIN ================= */

router.get("/:id", auth, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Not found" });
  res.json(product);
});

router.post("/", auth, async (req, res) => {
  const product = await Product.create(req.body);
  res.json(product);
});

router.put("/:id", auth, async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(product);
});

router.delete("/:id", auth, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;
