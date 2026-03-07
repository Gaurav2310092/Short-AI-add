import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EllipsisIcon, ImageIcon, Loader2Icon, PlaySquareIcon, Share2Icon, Trash2Icon } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import api from "../configs/axios";
import toast from "react-hot-toast";

const ProjectCard = ({ gen, setGenerations, forCommunity = false }) => {
  const {getToken}=useAuth()
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDelete=async(id)=>{
    const confirm=window.confirm('Are you sure you want to delete this project ?');
    if(!confirm) return;
    
    try{
      const token =await getToken();
      const {data}=await api.delete(`/api/project/${id}`,{
        headers:{Authorization:`Bearer ${token}`}
      })
      setGenerations((generations)=>generations.filter((gen)=>gen.id!==id));
      toast.success(data.message);
    }catch(error){
      toast.error(error?.response?.data?.message  || error.message);
      console.log(error);
    }
  }

 const togglePublish = async (projectId) => {
    try {
        const token = await getToken();
        
        console.log("Token:", token); // ✅ Add this to verify token exists

        const { data } = await api.get(`/api/user/publishs/${projectId}`, {
            headers: { Authorization: `Bearer ${token}` }  // ✅ correct spelling
        });

        setGenerations((generations) =>
            generations.map((gen) =>
                gen._id === projectId ? { ...gen, isPublished: data.isPublished } : gen
            )
        );
        toast.success(data.isPublished ? 'Project Published' : 'Project Unpublished');
    } catch (error) {
        toast.error(error?.response?.data?.message || error.message);
        console.log(error);
    }
};

  return (
    <div className="mb-4 break-inside-avoid">
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition group">

        {/* preview */}
        <div className={`${gen?.aspectRatio === "9:16" ? "aspect-[9/16]" : "aspect-video"} relative overflow-hidden`}>
          
          {gen.generatedImage && (
            <img
              src={gen.generatedImage}
              alt={gen.productName}
              className={`absolute inset-0 w-full h-full object-cover transition duration-500 ${
                gen.generatedVideo ? "group-hover:opacity-0" : "group-hover:scale-105"
              }`}
            />
          )}

          {gen.generatedVideo && (
            <video
              src={gen.generatedVideo}
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition duration-500"
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => e.currentTarget.pause()}
            />
          )}

          {!gen?.generatedImage && !gen?.generatedVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Loader2Icon className="size-7 animate-spin" />
            </div>
          )}

          {/* Status badges */}
          <div className="absolute left-3 top-3 flex gap-2 items-center">
            {gen.isGenerating && (
              <span className="text-xs px-2 py-1 bg-yellow-600/30 rounded-full">
                Generating
              </span>
            )}
            {gen.isPublished && (
              <span className="text-xs px-2 py-1 bg-green-600/30 rounded-full">
                Published
              </span>
            )}
          </div>

          {/*Action Menu for my generations only  */}
          {!forCommunity && (
            <div onMouseDownCapture={()=>{setMenuOpen(true)}}
            onMouseLeave={()=>{setMenuOpen(false)}} 
            className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition flex items-center gap-2">
              <div className="absolute top-3 right-3">
                <EllipsisIcon className="ml-auto bg-black/10 rounded-full
                p-1 size-7"/>
              </div>
              <div className="flex flex-col items-end w-32 text-sm">
                <ul className={`text-xs ${menuOpen ? 'block' : 'hidden'} overflow-hidden right-0 peer-focus:block hover:block w-40 bg-black/50 backgrop-blur text-white border border-gray-500/50
                rounded-lg shadow-md mt-2 py-1 z-10`}>
                  {gen.generatedImage && <a href="#" download className="flex gap-2 items-center px-4 py-2 hover:bg-black/10 cursor-pointer">
                  <ImageIcon size={14} />Downlaod Image 
                  </a>}

                  {gen.generatedVideo && <a href="#" download className="flex gap-2 items-center px-4 py-2 hover:bg-black/10 cursor-pointer">
                  <PlaySquareIcon size={14} />Downlaod Video 
                  </a>}

                  {(gen.generatedVideo || gen.generatedImage) && <button onClick={()=>navigator.share({url:gen.generatedVideo || gen.generatedImage,title:gen.productName,text:gen.productDescription})}
                    className="w-full flex gap-2 items-center px-4 py-2 hover:bg-black/10 cursor-pointer">
                    <Share2Icon size={14} /> Share
                    </button>}


                    <button onClick={()=> handleDelete(gen._id)} className="w-full flex gap-2 items-center px-4 py-2 hover:bg-red-950/10 text-red-400 cursor-pointer">
                      <Trash2Icon size={14}/>Delete
                    </button>
                </ul>

              </div>
            </div>
          )} 
          {/* Source images */}
          {gen.uploadedImages?.length > 0 && (
            <div className="absolute right-3 bottom-3 flex">
              {gen.uploadedImages[0] && (
                <img
                  src={gen.uploadedImages[0]}
                  alt="product"
                  className="w-16 h-16 object-cover rounded-full animate-float"
                />
              )}
              {gen.uploadedImages[1] && (
                <img
                  src={gen.uploadedImages[1]}
                  alt="model"
                  className="w-16 h-16 object-cover rounded-full animate-float -ml-8"
                  style={{ animationDelay: "3s" }}
                />
              )}
            </div>
          )}
        </div>

        {/* details */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-1">
                {gen.productName}
              </h3>

              {gen.createdAt && (
                <p className="text-sm text-gray-400">
                  Created: {new Date(gen.createdAt).toLocaleString()}
                </p>
              )}

              {gen.updatedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  Updated: {new Date(gen.updatedAt).toLocaleString()}
                </p>
              )}
            </div>

            <div className="text-right">
              <div className="mt-2 flex flex-col items-end gap-1">
                <span className="text-xs px-2 py-1 bg-white/5 rounded-full">
                  Aspect: {gen.aspectRatio}
                </span>
              </div>
            </div>
          </div>

          {/* description */}
          {gen.productDescription && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <div className="text-sm text-gray-300 bg-white/3 p-2 rounded-md break-words">
                {gen.productDescription}
              </div>
            </div>
          )}

          {/* prompt */}
          {gen.userPrompt && (
            <div className="mt-3 text-sm text-gray-300">
              {gen.userPrompt}
            </div>
          )}

          {/*Buttons  */}
          {!forCommunity && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button className="w-full px-4 py-2 text-sm font-medium text-white 
             border border-gray-600 rounded-full 
             hover:bg-gray-600/20 active:scale-95 
             transition flex items-center justify-center" onClick={()=>{navigate(`/result/${gen._id}`);scrollTo(0,0)}}>
                View Details
              </button>
              <button onClick={()=>togglePublish(gen._id)} className=" text-sm  bg-purple-600 hover:bg-purple-700 transition text-white rounded-md px-6 h-11">
                {gen.isPublished ? 'Unpublished' : 'Publish'}
              </button>
              
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;