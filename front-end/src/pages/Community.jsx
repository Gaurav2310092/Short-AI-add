"use client";
import { useEffect, useState } from "react";
import ProjectCard from "../components/ProjectCard";
import { Loader2Icon } from "lucide-react";
import api from "../configs/axios";
import toast from "react-hot-toast";

const Community = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
      try{
        const {data}=await api.get('/api/project/published')
        setProjects(data.projects)
        setLoading(false)

      }catch(error){
        toast.error(error?.response?.data?.message  || error.message);
        console.log(error);
      }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
  <div className="relative min-h-screen
      bg-[url('/assets/light-hero-gradient.svg')]
      dark:bg-[url('/assets/dark-hero-gradient.svg')]
      bg-no-repeat bg-cover">

    <div className="absolute inset-0 -z-10 opacity-60 blur-3xl
        bg-gradient-to-tr from-purple-500/20 via-pink-400/10 to-indigo-500/20" />

    {loading ? (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2Icon className="size-7 animate-spin text-indigo-400" />
      </div>
    ) : (
      <div className="pt-28 px-6 md:px-12 text-white">
        <div className="max-w-6xl mx-auto">

          <header className="mb-12">
            <h1 className="text-3xl md:text-4xl font-semibold mb-2">
              Community
            </h1>
            <p className="text-gray-400">
              See what others are creating with UGC.ai
            </p>
          </header>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                gen={project}
                setGenerations={setProjects}
                forCommunity={true}
              />
            ))}
          </div>

        </div>
      </div>
    )}

  </div>
);
}

export default Community;