const { instrument } = require("./config/instrument.js");
const Sentry = require("@sentry/node");
const express = require("express");
const cors = require("cors");
const { connectToMongoDB } = require("./connection");
const { clerkMiddleware } = require('@clerk/express');
const { clerkwebHooks } = require('./controllers/clerk');
const userRouter = require("./routes/userRoutes.js");
const projectRouter = require("./routes/projectRoutes.js");
const app = express();

app.get("/api/test", (req, res) => {
  res.json({ status: "✅ Working" });
});

module.exports = app;