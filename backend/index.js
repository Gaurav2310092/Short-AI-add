const {instrument} =require("./config/instrument.js");
const Sentry = require("@sentry/node");
const express=require("express");
const cors=require("cors");
const { connectToMongoDB } = require("./connection");
const { clerkMiddleware } = require('@clerk/express');
const {clerkwebHooks}=require('./controllers/clerk');
const userRouter = require("./routes/userRoutes.js");
const projectRouter = require("./routes/projectRoutes.js");

const app=express();

//MongoDB Connection 
connectToMongoDB(process.env.MONGODB_URI);

//Middleware
app.use(cors({
    origin:[process.env.CLIENT_URL,"https://short-ai-add-tycr.vercel.app/"],
    credentials:true,
    methods:["GET","POST","PUT","DELETE"],
    allowedHeaders:["Content-Type","Authorization"]
}));

app.post('/api/clerk',express.raw({ type: 'application/json' }),clerkwebHooks)

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

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});



app.use('/api/user',userRouter);
app.use("/api/project",projectRouter);

// The error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

app.use((err,req,res,next)=>{
    console.error(err.stack);
    res.status(err.status || 500).json({success:false,message:err.message || 'Internal Server Error '});
});

module.exports=app;