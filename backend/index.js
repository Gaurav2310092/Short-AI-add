const {instrument} = require("./config/instrument.js");
const Sentry = require("@sentry/node");
const express = require("express");
const cors = require("cors");
const { connectToMongoDB } = require("./connection");
const { clerkMiddleware } = require('@clerk/express');
const {clerkwebHooks} = require('./controllers/clerk');
const userRouter = require("./routes/userRoutes.js");
const projectRouter = require("./routes/projectRoutes.js");

const app = express();

// MongoDB Connection
connectToMongoDB(process.env.MONGODB_URI);

// CORS — must be first
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://short-ai-add-tycr.vercel.app"  // ✅ fixed typo
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Clerk Webhook — raw body before express.json()
app.post('/api/clerk', express.raw({ type: 'application/json' }), clerkwebHooks);

app.use(express.json());
app.use(clerkMiddleware());

app.get("/api/test", (req, res) => {
  res.json({
    status: "✅ Working",
    mongodb: process.env.MONGODB_URI ? "✅ Found" : "❌ Missing",
    clerk_secret: process.env.CLERK_SECRET_KEY ? "✅ Found" : "❌ Missing",
    client_url: process.env.CLIENT_URL || "❌ Not Set",
  });
});

app.use('/api/user', userRouter);
app.use("/api/project", projectRouter);

Sentry.setupExpressErrorHandler(app);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({success: false, message: err.message || 'Internal Server Error'});
});

module.exports = app;