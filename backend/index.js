
const {instrument} =require("./config/instrument.js");
const Sentry = require("@sentry/node");
const express=require("express");
const cors=require("cors");
const { connectToMongoDB } = require("./connection");
const { clerkMiddleware } = require('@clerk/express');
const {clerkwebHooks}=require('./controllers/clerk');
const userRouter = require("./routes/userRoutes.js");
const projectRouter = require("./routes/projectRoutes.js");


//MongoDB Connection 
connectToMongoDB(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });


  const app=express();

  app.get("/api/test", (req, res) => {
  res.json({
    mongodb: process.env.MONGODB_URI ? "✅ Found" : "❌ Missing",
    clerk_secret: process.env.CLERK_SECRET_KEY ? "✅ Found" : "❌ Missing",
    clerk_webhook: process.env.CLERK_WEBHOOK_SIGNING_SECRET ? "✅ Found" : "❌ Missing",
    cloudinary: process.env.CLOUDINARY_URL ? "✅ Found" : "❌ Missing",
    gemini: process.env.GEMINI_API_KEY ? "✅ Found" : "❌ Missing",
  });
});

//Middleware
app.use(cors({
    origin:process.env.CLIENT_URL
}));

// Add this route before your other routes
app.get("/api/test", (req, res) => {
  res.json({
    mongodb_uri: process.env.MONGODB_URI ? "✅ Found" : "❌ Missing",
    client_url: process.env.CLIENT_URL ? "✅ Found" : "❌ Missing",
    clerk_key: process.env.CLERK_SECRET_KEY ? "✅ Found" : "❌ Missing",
  });
});

app.post('/api/clerk',express.raw({ type: 'application/json' }),clerkwebHooks)

app.use(express.json());
app.use(clerkMiddleware());


app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});



app.use('/api/user',userRouter);
app.use("/api/project",projectRouter);

// The error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

app.use((err,req,res,next)=>{
    console.error(err.stack);
    res.status(err.status || 500).json({message:err.message || 'Internal Server Error '});
});

module.exports=app;