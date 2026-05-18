const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const auth = require("../middleware/auth");

/* ================= PUBLIC ================= */

router.get("/", async (req, res) => {
  const products = await Product.find({ isActive: true });
  res.json(products);
});
/* HOME PRODUCTS */

router.get("/featured", async (req, res) => {

  try {

    const categories = [

      "Ring",
      "Pendants",
      "Studs",
      "Bracelets"
    ];

    let homeProducts = [];

    for (const category of categories) {

      const products =
        await Product.find({

          category,

          isActive: true
        })

        .sort({ createdAt: -1 })

        .limit(4);

      homeProducts.push(...products);
    }

    res.json(homeProducts);

  } catch (err) {

    res.status(500).json({

      message:
        "Failed to fetch home products"
    });
  }
});
router.get("/paginated", async (req, res) => {

  try {

    const page =
      Number(req.query.page) || 1;

    const limit =
      Number(req.query.limit) || 12;

    const skip =
      (page - 1) * limit;

    const total =
      await Product.countDocuments({
        isActive: true
      });

    const products =
      await Product.find({
        isActive: true
      })

      .sort({ createdAt: -1 })

      .skip(skip)

      .limit(limit);

    res.json({

      products,

      hasMore:
        total >
        skip + products.length
    });

  } catch (err) {

    res.status(500).json({

      message:
        "Failed to fetch products"
    });
  }
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
/* PAGINATED PRODUCTS */


module.exports = router;
