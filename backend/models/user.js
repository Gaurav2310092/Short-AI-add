const mongoose=require("mongoose");

const userSchema=new mongoose.Schema(
    {
        clerkId: {
            type: String,
            required: true,
            unique: true
        },
        email:{
            type:String,
            required:true,
            unique:true,
        },
        name:{
            type:String,
            default:"",
        },
        image:{
            type:String,
            default:"",
        },
        credits:{
            type:Number,
            default:20,
            min:0
        }
        
    },{timestamps:true}
);



const User=mongoose.model('User',userSchema);

module.exports={
    User
}