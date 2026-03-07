import { UserSchema } from "./user";

export const ProjectSchema = {
  id: "",
  name: "",
  userId: "",
  user: { ...UserSchema },

  productName: "",
  productDescription: "",
  userPrompt: "",
  aspectRatio: "",
  targetLength: 0,

  generatedImage: "",
  generatedVideo: "",

  isGenerating: false,
  isPublished: false,
  error: "",

  createdAt: "",
  updatedAt: "",
  uploadedImages: [],
};
