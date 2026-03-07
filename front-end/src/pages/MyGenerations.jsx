import { useEffect, useState } from "react";
import ProjectCard from "../components/ProjectCard";
import { Loader2Icon } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../configs/axios"; // 👈 add your api import

const MyGenerations = () => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth(); // 👈 destructure getToken, not token
  const navigate = useNavigate();

  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyGenerations = async () => {
    try {
      const token = await getToken(); // 👈 now getToken is defined
      const { data } = await api.get("/api/user/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGenerations(data.projects);
      setLoading(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyGenerations();
    } else if (isLoaded && !user) {
      navigate("/");
    }
  }, [user]);

  return (
  <div className="relative min-h-screen
      bg-[url('/assets/light-hero-gradient.svg')]
      dark:bg-[url('/assets/dark-hero-gradient.svg')]
      bg-no-repeat bg-cover">

    {/* blur overlay */}
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
              My Generations
            </h1>
            <p className="text-gray-400">
              View and manage your AI-generated content
            </p>
          </header>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {generations.map((gen) => (
              <ProjectCard
                key={gen._id}
                gen={gen}
                setGenerations={setGenerations}
              />
            ))}
          </div>

          {generations.length === 0 && (
            <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10 mt-10">
              <h3 className="text-xl font-medium mb-2">
                No Generations yet
              </h3>
              <p className="text-gray-400 mb-6">
                Start creating stunning product photos today
              </p>

              <button
                className="px-4 py-3 rounded-4xl bg-purple-600 hover:bg-purple-700 transition text-white"
                onClick={() => (window.location.href = "/generate")}
              >
                Create new Generations
              </button>
            </div>
          )}

        </div>
      </div>
    )}

  </div>
);
}

export default MyGenerations