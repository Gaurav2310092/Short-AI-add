const { Project } = require("../models/project");
const { User } = require("../models/user");
const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const ai = require("../config/ai");
const mongoose=require("mongoose");


// ========================
// Convert image to base64
// ========================
const loadImage = (filePath, mimeType) => {
    return {
        inlineData: {
            data: fs.readFileSync(filePath).toString("base64"),
            mimeType
        }
    };
};


// ========================
// CREATE IMAGE PROJECT
// ========================
async function createProject(req, res) {

    let tempProjectId = null;
    let isCreditDeducted = false;

    try {

        const clerkId = req.clerkId;

        const {
            name = "New Project",
            aspectRatio,
            userPrompt,
            productName,
            productDescription,
            targetLength = 5
        } = req.body;

        const images = req.files || [];

        // Validate inputs
        if (images.length < 2 || !productName) {
            return res.status(400).json({
                message: "Please upload at least 2 images and provide a product name"
            });
        }

        // Check user and credits
        const user = await User.findOne({ clerkId });

        if (!user || user.credits < 5) {
            return res.status(401).json({
                message: "Insufficient credits"
            });
        }

        // Deduct credits upfront
        await User.findOneAndUpdate(
            { clerkId },
            { $inc: { credits: -5 } }
        );
        isCreditDeducted = true;


        // Upload original images to Cloudinary
        const uploadedImages = await Promise.all(
            images.map(async (img) => {
                const result = await cloudinary.uploader.upload(img.path, {
                    resource_type: "image"
                });
                return result.secure_url;
            })
        );


        // Create project record in DB
        const project = await Project.create({
            name,
            clerkId,
            productName,
            productDescription,
            userPrompt,
            aspectRatio,
            targetLength: parseInt(targetLength),
            uploadedImages,
            isGenerating: true
        });

        tempProjectId = project._id;


        // Prepare images for Gemini
        const img1 = loadImage(images[0].path, images[0].mimetype);
        const img2 = loadImage(images[1].path, images[1].mimetype);


        // -------------------------------------------------------
        // STEP 1 — gemini-2.0-flash (vision): analyze both images
        // -------------------------------------------------------
        console.log("Step 1: Analyzing images...");

        const visionResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `You are an expert ecommerce product photographer and image analyst.
                                   
                                   Carefully analyze both images provided:

                                   IMAGE 1 (Person):
                                   Describe in full photographic detail — skin tone, hair color and style, facial features, 
                                   clothing (color, style, fit), body pose, hand position, lighting direction, 
                                   shadows, background, overall mood and style.

                                   IMAGE 2 (Product):
                                   Describe in full photographic detail — product type, exact shape, dimensions, 
                                   color(s), texture, material finish, any branding or labels, 
                                   how it would naturally be held or used, lighting, background.

                                   Be extremely specific and vivid. This description will be used to generate a new image.`
                        },
                        img1,
                        img2
                    ]
                }
            ]
        });

        const imageDescription = visionResponse?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!imageDescription) {
            throw new Error("Failed to analyze images — no description returned");
        }

        console.log("Step 1 done:", imageDescription.slice(0, 150) + "...");


        // ------------------------------------------------------------------
        // STEP 2 — gemini-2.0-flash-preview-image-generation: generate image
        // ------------------------------------------------------------------
        console.log("Step 2: Generating combined image...");

        const generationPrompt = `
            You are an expert ecommerce product photographer.

            Using the following detailed description of a real person and a real product, 
            generate a single high-quality, photorealistic ecommerce advertisement image:

            --- DESCRIPTION ---
            ${imageDescription}
            -------------------

            Requirements:
            - The person is naturally holding or using the ${productName} in a realistic, comfortable way
            - Lighting, shadows, perspective and scale are perfectly matched between person and product
            - Clean studio background or lifestyle setting appropriate for ecommerce
            - Photorealistic — not illustrated, not cartoonish, not artistic
            - Professional ecommerce advertisement quality
            - No text overlays or watermarks
            ${userPrompt ? `- Extra instructions from user: ${userPrompt}` : ""}
        `;

        const imageResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: [
                {
                    role: "user",
                    parts: [{ text: generationPrompt }]
                }
            ],
            config: {
                responseModalities: ["TEXT", "IMAGE"]
            }
        });

        if (!imageResponse?.candidates?.[0]?.content?.parts) {
            throw new Error("Invalid response from image generation model");
        }


        // Extract base64 image data from response
        let base64Data = null;

        for (const part of imageResponse.candidates[0].content.parts) {
            if (part.inlineData?.data) {
                base64Data = part.inlineData.data;
                break;
            }
        }

        if (!base64Data) {
            throw new Error("No image was returned by the generation model");
        }

        console.log("Step 2 done. Uploading to Cloudinary...");


        // Upload generated image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(
            `data:image/png;base64,${base64Data}`,
            { resource_type: "image" }
        );


        // Save generated image URL to project
        await Project.findByIdAndUpdate(project._id, {
            generatedImage: uploadResult.secure_url,
            isGenerating: false
        });

        console.log("Image saved to project:", project._id);


        // Clean up local temp files
        images.forEach(img => {
            try { fs.unlinkSync(img.path); }
            catch (err) { console.log("Temp file delete error:", err.message); }
        });


        res.json({ projectId: project._id });


    } catch (error) {

        console.error("createProject error:", error);

        // Mark project as failed
        if (tempProjectId) {
            await Project.findByIdAndDelete(tempProjectId,{
                isGenerating:false,
            });
        }

        // Refund credits on failure
        if (isCreditDeducted) {
            await User.findOneAndUpdate(
                { clerkId: req.clerkId },
                { $inc: { credits: 5 } }
            );
        }

        // Clean up temp files on error
        if (req.files?.length) {
            req.files.forEach(img => {
                try { fs.unlinkSync(img.path); }
                catch (err) { console.log("Temp file delete error:", err.message); }
            });
        }

        res.status(500).json({ message: error.message });
    }
}


// ========================
// CREATE VIDEO
// ========================
async function createVideo(req, res) {

    let isCreditDeducted = false;

    try {

        const clerkId = req.clerkId;
        const { projectId } = req.body;

        // Validate project ID
        if (!projectId) {
            return res.status(400).json({ message: "Project ID is required" });
        }

        // Check user and credits
        const user = await User.findOne({ clerkId });

        if (!user || user.credits < 10) {
            return res.status(401).json({ message: "Insufficient credits" });
        }

        // Deduct credits
        await User.findOneAndUpdate(
            { clerkId },
            { $inc: { credits: -10 } }
        );
        isCreditDeducted = true;


        // Fetch project
        const project = await Project.findOne({ _id: projectId, clerkId });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (!project.generatedImage) {
            throw new Error("Generated image not found. Please generate an image first.");
        }


        // Mark as generating
        await Project.updateOne(
            { _id: projectId },
            { isGenerating: true }
        );


        // Download generated image from Cloudinary as buffer
        const imageAxiosResponse = await axios.get(project.generatedImage, {
            responseType: "arraybuffer"
        });

        const imageBytes = Buffer.from(imageAxiosResponse.data);


        // Start video generation with Veo
        console.log("Starting video generation...");

        const operation = await ai.models.generateVideos({
            model: "veo-2.0-generate-001",
            prompt: `Create a professional product advertisement video for ${project.productName}. 
                     ${project.productDescription || ""}
                     Show the product being used naturally. 
                     Cinematic quality, smooth motion, ecommerce style.`,
            image: {
                imageBytes: imageBytes.toString("base64"),
                mimeType: "image/png"
            },
            config: {
                aspectRatio: project.aspectRatio || "9:16",
                numberOfVideos: 1,
                resolution: "720p",
                durationSeconds: project.targetLength || 5
            }
        });


        // Poll until video generation is complete
        let videoOperation = operation;

        while (!videoOperation.done) {
            console.log("Waiting for video generation...");
            await new Promise(resolve => setTimeout(resolve, 10000));
            videoOperation = await ai.operations.getVideosOperation({
                operation: videoOperation
            });
        }

        console.log("Video generation complete. Downloading...");


        // Save video locally
        const filename = `${clerkId}-${Date.now()}.mp4`;
        const filePath = path.join("videos", filename);

        fs.mkdirSync("videos", { recursive: true });

        await ai.files.download({
            file: videoOperation.response.generatedVideos[0].video,
            downloadPath: filePath
        });


        // Upload video to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            resource_type: "video"
        });

        console.log("Video uploaded to Cloudinary:", uploadResult.secure_url);


        // Update project with video URL
        await Project.updateOne(
            { _id: projectId },
            {
                generatedVideo: uploadResult.secure_url,
                isGenerating: false
            }
        );


        // Clean up local video file
        try { fs.unlinkSync(filePath); }
        catch (err) { console.log("Video file delete error:", err.message); }


        res.json({
            message: "Video generated successfully",
            videoUrl: uploadResult.secure_url
        });


    } catch (error) {

        console.error("createVideo error:", error);

        // Refund credits on failure
        if (isCreditDeducted) {
            await User.findOneAndUpdate(
                { clerkId: req.clerkId },
                { $inc: { credits: 10 } }
            );
        }

        // Reset project generating state
        if (req.body?.projectId) {
            await Project.updateOne(
                { _id: req.body.projectId },
                { isGenerating: false, error: error.message }
            );
        }

        res.status(500).json({ message: error.message });
    }
}


// ========================
// GET ALL PUBLISHED PROJECTS
// ========================
async function getAllPublishedProjects(req, res) {

    try {

        const projects = await Project.find({ isPublished: true });

        res.json({ projects });

    } catch (error) {

        console.error("getAllPublishedProjects error:", error);
        res.status(500).json({ message: error.message });

    }
}


// ========================
// DELETE PROJECT
// ========================


async function deleteProject(req, res) {
    try {
        const clerkId = req.clerkId;
        const { projectId } = req.params;

        // ✅ Validate projectId before querying
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ message: "Invalid project ID" });
        }

        const project = await Project.findOne({ 
            _id: new mongoose.Types.ObjectId(projectId),  // ✅ Convert to ObjectId
            clerkId 
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        await Project.deleteOne({ _id: new mongoose.Types.ObjectId(projectId) });

        res.json({ message: "Project deleted successfully" });

    } catch (error) {
        console.error("deleteProject error:", error);
        res.status(500).json({ message: error.message });
    }
}


module.exports = {
    createProject,
    createVideo,
    getAllPublishedProjects,
    deleteProject
};