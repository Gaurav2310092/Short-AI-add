const express=require("express");
const {protect}=require("../middleware/auth")
const { getUserCredits ,getAllUserProject, getProjectByid, toggleProjectPublic} = require("../controllers/userController");

const userRouter=express.Router();

userRouter.get("/credits",protect , getUserCredits)
userRouter.get("/projects",protect , getAllUserProject)
userRouter.get("/projects/:projectId",protect,getProjectByid)
userRouter.get("/publishs/:projectId",protect , toggleProjectPublic)

module.exports=userRouter
