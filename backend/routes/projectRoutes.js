const express=require("express");
const {protect}=require("../middleware/auth")
const {upload}=require("../config/multer")
const { createProject, createVideo, getAllPublishedProjects, deleteProject } = require("../controllers/projectController");
const projectRouter=express.Router()

projectRouter.post("/create",protect,upload.array('images',2),createProject)
projectRouter.post("/video",protect,createVideo)
projectRouter.get("/published",getAllPublishedProjects)
projectRouter.delete("/:projectId",protect,deleteProject)

module.exports=projectRouter

