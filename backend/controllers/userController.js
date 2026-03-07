const { User } = require("../models/user");
const { Project } = require("../models/project");


// =============================
// GET USER CREDITS
// =============================
async function getUserCredits(req, res) {

    try {

        const clerkId = req.clerkId;

        if (!clerkId) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const user = await User.findOne({ clerkId });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            credits: user.credits
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: error.message
        });

    }
}



// =============================
// GET ALL USER PROJECTS
// =============================
async function getAllUserProject(req, res) {

    try {

        const clerkId = req.clerkId;

        if (!clerkId) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const projects = await Project
            .find({ clerkId })
            .sort({ createdAt: -1 });

        res.json({ projects });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: error.message
        });

    }
}



// =============================
// GET PROJECT BY ID
// =============================
async function getProjectByid(req, res) {

    try {

        const clerkId = req.clerkId;
        const { projectId } = req.params;

        const project = await Project.findOne({
            _id: projectId,
            clerkId
        });

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        res.json({ project });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: error.message
        });

    }
}



// =============================
// TOGGLE PROJECT PUBLIC
// =============================
async function toggleProjectPublic(req, res) {

    try {

        const clerkId = req.clerkId;
        const { projectId } = req.params;

        const project = await Project.findOne({
            _id: projectId,
            clerkId
        });

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        if (!project.generatedImage && !project.generatedVideo) {
            return res.status(400).json({
                message: "No image or video generated"
            });
        }

        project.isPublished = !project.isPublished;

        await project.save();

        res.json({
            isPublished: project.isPublished
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: error.message
        });

    }
}



module.exports = {
    getUserCredits,
    getAllUserProject,
    getProjectByid,
    toggleProjectPublic
};