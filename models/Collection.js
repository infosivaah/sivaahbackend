const mongoose = require("mongoose");

const CollectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  imageList: [String]
});

module.exports = mongoose.model("Collection", CollectionSchema);
