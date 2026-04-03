const mongoose=require("mongoose");

const projectScema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    clerkId:{
        type:String,
        required:true,
    },
    productName:{
        type:String,
        required:true,
    },
    productDescription:{
        type:String,
        default:"",
    },
    userPrompt:{
        type:String,
        default:"",
    },
    aspectRatio:{
        type:String,
        default:'9:16',
    },
    targetLength:{
        type:Number,
        default:5,
    },
    uploadedImages:{
        type:[String],
        default:[]
    },
    generatedImage:{
        type:String,
        default:"",
    },
    generatedVideo:{
        type:String,
        default:"",
    },
    isGenerating:{
        type:Boolean,
        default:false,
    },
    isPublished:{
        type:Boolean,
        default:false,
    },
    error:{
        type:String,
        default:"",
    }
},{timestamps:true}
);

const Project=mongoose.model('project',projectScema);

module.exports={Project}