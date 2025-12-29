const express = require("express");
const router = express.Router();
const Collection = require("../models/Collection");

router.get("/:name", async (req, res) => {
  const collection = await Collection.findOne({
    name: req.params.name
  });
  res.json(collection);
});

module.exports = router;
