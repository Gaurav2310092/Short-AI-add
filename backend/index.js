const express = require("express");
const cors = require("cors");
const { connectToMongoDB } = require("./connection");
const app = express();

app.get("/api/test", (req, res) => {
  res.json({ status: "✅ Working" });
});

module.exports = app;