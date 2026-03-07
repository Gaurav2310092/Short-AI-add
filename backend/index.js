require("dotenv").config();
const {instrument} =require("./config/instrument.js");
const Sentry = require("@sentry/node");
const express=require("express");
const cors=require("cors");
const { connectToMongoDB } = require("./connection");

const { User } = require("./models/user"); // adjust path
const { clerkMiddleware } = require('@clerk/express');
const {protect} = require('./middleware/auth');
const app=express();
const {clerkwebHooks}=require('./controllers/clerk');
const userRouter = require("./routes/userRoutes.js");
const projectRouter = require("./routes/projectRoutes.js");


//MongoDB Connection 
connectToMongoDB('mongodb://127.0.0.1:27017/short-add')
    .then(()=> console.log("MongoDB is Connected."));


//Middleware
app.use(cors());

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

const PORT=process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`Server is at http://localhost:${PORT}`)
})