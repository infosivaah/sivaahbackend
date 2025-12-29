const express = require("express");
const next = require("next");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, dir: "../frontend" });
const handle = app.getRequestHandler();

const server = express();

// API routes
app.use("/api/products", require("./routes/products"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/collections", require("./routes/collections"));
app.prepare().then(() => {
  // Next.js pages
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () =>
    console.log(`🚀 SIVAAH running on port ${PORT}`)
  );
});
