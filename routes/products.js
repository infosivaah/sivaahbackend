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

/* HOME PRODUCTS */

router.get("/featured", async (req, res) => {

  try {

    /* UNIQUE CATEGORIES */

    const categories =
      await Product.distinct(
        "category",
        {
          isActive: true
        }
      );

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

    console.log(err);

    res.status(500).json({

      message:
        "Failed to fetch home products"
    });
  }
});
/* PAGINATED + FILTERED PRODUCTS */

/* PAGINATED + FILTERED PRODUCTS */

router.get("/paginated", async (req, res) => {

  try {

    const page =
      Number(req.query.page) || 1;

    const limit =
      Number(req.query.limit) || 12;

    const skip =
      (page - 1) * limit;

    const {
      category,
      search,
      maxPrice,
      sort
    } = req.query;

    /* FILTER */

    const filter = {
      isActive: true
    };

    /* CATEGORY */

    if (category) {

      filter.category = {
        $regex:
          new RegExp(
            `^${category}$`,
            "i"
          )
      };
    }

    /* SEARCH */

    if (search) {

      filter.$or = [

        {
          name: {
            $regex: search,
            $options: "i"
          }
        },

        {
          category: {
            $regex: search,
            $options: "i"
          }
        }
      ];
    }

    /* PRICE */

    if (maxPrice) {

      filter.price = {
        $lte: Number(maxPrice)
      };
    }

    /* SORT */

    let sortOption = {
      createdAt: -1
    };

    if (sort === "price-asc") {

      sortOption = {
        price: 1
      };
    }

    if (sort === "price-desc") {

      sortOption = {
        price: -1
      };
    }

    if (sort === "latest") {

      sortOption = {
        createdAt: -1
      };
    }

    /* TOTAL */

    const total =
      await Product.countDocuments(
        filter
      );

    /* PRODUCTS */

    const products =
      await Product.find(filter)

        .sort(sortOption)

        .skip(skip)

        .limit(limit);

    res.json({

      products,

      hasMore:
        total >
        skip + products.length
    });

  } catch (err) {

    console.log(err);

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
