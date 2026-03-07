🚀 AI Ad Generator (MERN + Gemini)
    A sophisticated full-stack platform that automates professional advertisement creation using a multi-stage AI vision pipeline.

🤖 The AI Logic (Vision-to-Ad)
    This project implements a unique "double-analysis" workflow:

Analysis: The system takes two inputs—a Product Image and a Model Image—and uses Gemini 2.5 Flash to analyze lighting, positioning, and textures.

Synthesis: It generates a highly detailed composite prompt based on the analysis and the user's specific text requirements.

Generation: The final "Ad Image" or AI Video is generated using Gemini 2.5 Flash- Image and hosted via Cloudinary.

✨ Key Features

Clerk Authentication: Secure and seamless user management.

🚀 Credit System: New users are granted 20 free credits upon signup.

💳Subscription Tiers: Support for Basic, Pro, and Premium plans with varying credit limits.

🤝Community Section: A public gallery to view all ads generated and published by the platform users.

☁️Media Management: High-speed image and video storage powered by Cloudinary.

🛠️ Tech Stack
    Frontend: React.js & Vite.

    Backend: Node.js & Express (with long-timeout support for AI video generation).

    Database: MongoDB Atlas.

AI Engine: Google Gemini API.

🚀 Setup & Installation
    Clone the project:
    git clone https://github.com/Gaurav2310092/Short-AI-add.git

Install dependencies:
    Run npm install in both the backend/ and front-end/ folders.

Configure Environment Variables:
    Create a .env in the backend/ folder with:

      CLERK_PUBLISHABLE_KEY

      GEMINI_API_KEY

      CLOUDINARY_URL

      MONGO_URI

      CLERK_SECRET_KEY
