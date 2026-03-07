"use client";

import SectionTitle from "../components/SectionTitle";
import { Loader2Icon, RectangleHorizontalIcon, RectangleVerticalIcon, UploadCloud, VideoIcon, Wand2Icon } from "lucide-react";
import UploadZone from "../components/UploadZone";
import { useState } from "react";
import {useAuth,useUser} from "@clerk/clerk-react"
import {useNavigate} from "react-router-dom"
import api from "../configs/axios";
import { toast } from "react-hot-toast"


export default function Generator() {

  const {user}=useUser()
  const {getToken}=useAuth()
  const navigate=useNavigate()
  
  const [name,setName]=useState('');
  const [productName,setProductName]=useState('');
  const [productDescription,setProductDescription]=useState('');
  const [aspectratio,setAspectRatio]=useState('9:16');
  const [productImage,setProductImage]=useState(null);
  const [modelImage,setModelImage]=useState(null);
  const [userPrompt,setUserPrompt]=useState('');
  const [isGenerating,setIsGenerating]=useState(false);

  const handleFileChange = (e, type) => {
  if (e.target.files && e.target.files[0]) {
    if (type === "product") {
      setProductImage(e.target.files[0]);
    } else {
      setModelImage(e.target.files[0]);
    }
  }
};

const handleGenerate = async (e) => {
  e.preventDefault();
  if(!user) return toast("Please login to generate")
  if(!productImage || !modelImage || !name || !productName || !aspectratio) return toast("Plaese fill all the Required fields")
    try{
      setIsGenerating(true);
      const formData=new FormData();
      formData.append('name',name)
      formData.append('productName',productName)
      formData.append('productDescription',productDescription)
      formData.append('userPrompt',userPrompt)
      formData.append('aspectRatio',aspectratio)
      formData.append('images',productImage)
      formData.append('images',modelImage)

      const token=await getToken()

      const {data}=await api.post('/api/project/create',formData,{
        headers:{Authorization:`Bearer ${token}`}
      })
      setIsGenerating(false)
      toast.success('Project created Successfully ')
      navigate('/result/'+data.projectId)
    }catch(error){
      setIsGenerating(false)
      toast.error(error?.response?.data?.message || error.message)
    }
};

  return (
    <div className="relative min-h-screen
        bg-[url('/assets/light-hero-gradient.svg')]
        dark:bg-[url('/assets/dark-hero-gradient.svg')]
        bg-no-repeat bg-cover">

      <div className="absolute inset-0 -z-10 opacity-60 blur-3xl
          bg-gradient-to-tr from-purple-500/20 via-pink-400/10 to-indigo-500/20" />

      <div className="pt-28 px-6 md:px-12">
        <form onSubmit={handleGenerate} className="max-w-4xl mx-auto mb-40">
         <div className="mb-20">
  <SectionTitle 
    text2="Create In-Context Image"
    text3="Upload your model and product images to generate stunning UGC, short-form videos and social media posts"
  />
</div>
            <div className="flex  gap-20 max-sm:flex-col  items-start
            justify-between">
              {/* left Col */}
              <div className="flex flex-col w-full sm:max-w-60 gap-8 mt-8 mb-12">
                <UploadZone label="Product Image" file={productImage} onClear={()=>setProductImage(null)} onChange={(e)=>handleFileChange(e,'product')}/>
                <UploadZone label="Model Image" file={modelImage} onClear={()=>setModelImage(null)} onChange={(e)=>handleFileChange(e,'model')}/>
              </div>

              {/* right Col */}
              <div className="w-full ">
                <div className="mb-4 text-gray-300">
                  <label htmlFor="name"className="block text-sm mb-4">Project Name</label>
                  <input type="text" id="name" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name your Project" required 
                  className="w-full bg-white/3 rounded-lg  border-2 p-4 text-sm
                  border-violet-200/10 focus:border-violet-500/50 outline-none *:transition-all"/>
                </div>

                <div className="mb-4 text-gray-300">
                  <label htmlFor="productName"className="block text-sm mb-4">Product Name</label>
                  <input type="text" id="productName" value={productName} onChange={(e)=>setProductName(e.target.value)} placeholder="Enter the name of the product" required 
                  className="w-full bg-white/3 rounded-lg  border-2 p-4 text-sm
                  border-violet-200/10 focus:border-violet-500/50 outline-none *:transition-all"/>
                </div>

                <div className="mb-4 text-gray-300">
                  <label htmlFor="productDescription"className="block text-sm mb-4">Product Description<span className="text-xs text-violet-400">(optional)</span></label>
                  <textarea id="productDescription" rows={4} value={productDescription} 
                  onChange={(e)=> setProductDescription(e.target.value)} 
                  placeholder="Enter the description of the product here" 
                  className="w-full bg-white/3 rounded-lg border-2 p-4 text-sm
                  border-violet-200/10 focus:border-violet-500/50 outline-none resize-none transition-all"/>
                </div>

                <div className="mb-4 text-gray-300">
                  <label className="block text-sm mb-4">Asoect Ratio</label>
                  <div className="flex gap-3">
                    <RectangleVerticalIcon onClick={()=>setAspectRatio('9:16')} 
                    className={`p-2.5 size-13 bg-white/6 rounded transition-all ring-2
                    ring-transparent cursor-pointer ${aspectratio=='9:16' ? 'ring-violet-500/50 bg-white/10' : ''}`}/>

                    <RectangleHorizontalIcon onClick={()=>setAspectRatio('16:9')} 
                    className={`p-2.5 size-13 bg-white/6 rounded transition-all ring-2
                    ring-transparent cursor-pointer ${aspectratio=='16:9' ? 'ring-violet-500/50 bg-white/10' : ''}`}/>
                  </div>
                </div>

                <div className="mb-4 text-gray-300">
                  <label htmlFor="userPrompt"className="block text-sm mb-4">User Prompt<span className="text-xs text-violet-400">(optional)</span></label>
                  <textarea id="userPrompt" rows={4} value={userPrompt} 
                  onChange={(e)=> setUserPrompt(e.target.value)} 
                  placeholder="Describe how you want the naration to be" 
                  className="w-full bg-white/3 rounded-lg border-2 p-4 text-sm
                  border-violet-200/10 focus:border-violet-500/50 outline-none resize-none transition-all"/>
                </div>

              </div>
            </div>

            <div className="flex items-center justify-center mt-10">
                    <button disabled={isGenerating} className="flex items-center gap-2 px-6 py-4 bg-purple-600 hover:bg-purple-700 transition text-white rounded-md">
                      {isGenerating ? (
                          <>
                          <Loader2Icon className="size-5 animate-spin"/>Generating...
                          </>
                        ) : (
                        <>
                          <Wand2Icon className="size-5"/>Generate Image
                        </>
                      )}
                    </button>
            </div>
        </form>

      </div>
    </div>
  );
}
