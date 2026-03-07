import { useEffect, useState } from "react"
import { ImageIcon, Loader2Icon, VideoIcon, Sparkles, RefreshCwIcon } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useAuth, useUser } from "@clerk/clerk-react"
import api from "../configs/axios"
import { toast } from "react-hot-toast"


const Result = () => {
  const { projectId } = useParams()
  const { getToken } = useAuth()
  const { user, isLoaded } = useUser()
  const navigate = useNavigate()

  const [project, setProjectData] = useState({})
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)


  const fetchProjectData = async () => {
    if (!projectId || projectId === "undefined") {
      toast.error("Invalid project ID")
      navigate("/my-generations")
      return
    }

    try {
      const token = await getToken()
      const { data } = await api.get(`/api/user/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProjectData(data.project)
      setIsGenerating(data.project.isGenerating)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
      console.log(error)
    } finally {
      setLoading(false)
    }
  }


  const handleGenerateVideo = async () => {
    if (!projectId || projectId === "undefined") {
      toast.error("Invalid project ID")
      return
    }

    setIsGenerating(true)
    try {
      const token = await getToken()
      const { data } = await api.post("/api/project/video", { projectId }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProjectData(prev => ({ ...prev, generatedVideo: data.videoUrl }))
      toast.success(data.message)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
      console.log(error)
    } finally {
      setIsGenerating(false)
    }
  }


  // Initial load — wait for Clerk auth
  useEffect(() => {
    if (!isLoaded) return
    if (user) {
      fetchProjectData()
    } else {
      navigate("/")
    }
  }, [isLoaded, user, projectId])


  // Poll every 10s while image/video is still generating
  useEffect(() => {
    if (!user || !isGenerating) return
    const interval = setInterval(fetchProjectData, 10000)
    return () => clearInterval(interval)
  }, [user, isGenerating])

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
          <Loader2Icon className="animate-spin size-9 text-indigo-400" />
        </div>
      ) : (
        <div className="pt-28 px-6 md:px-12 text-white">
          <div className="max-w-6xl mx-auto">

            <header className="flex justify-between items-center mb-8">
              <h1 className="text-2xl md:text-3xl font-medium">Generations</h1>

              <Link
                to="/generate"
                className="py-4 border border-slate-800 p-6 rounded-2xl
              bg-slate-950/5 hover:bg-slate-950/10
              dark:bg-white/10 dark:hover:bg-white/20
              text-sm flex items-center gap-2"
              >
                <RefreshCwIcon className="w-4 h-4" />
                <p className="max-sm:hidden">New Generation</p>
              </Link>
            </header>

            {/* Grid layout */}
            <div className="grid lg:grid-cols-3 gap-8">

              {/* Main result */}
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-panel inline-block p-2 rounded-2xl">
                  <div className={`${project?.aspectRatio === "9:16" ? "aspect-[9/16]" : "aspect-video"} sm:max-h-[800px] rounded-xl bg-gray-900 overflow-hidden relative`}>
                    {project?.generatedVideo ? (
                      <video
                        src={project.generatedVideo}
                        controls
                        autoPlay
                        loop
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={project.generatedImage}
                        alt="Generated Result"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">

                {/* Download */}
                <div className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-xl rounded-2xl p-8 text-white">
                  <h3 className="text-xl font-semibold mb-4">Actions</h3>

                  <div className="flex flex-col gap-3">
                    <a href={project.generatedImage} download>
                      <button
                        disabled={!project.generatedImage}
                        className="w-full flex items-center justify-center gap-2
                            bg-gradient-to-r from-purple-600 to-violet-600
                           hover:from-purple-700 hover:to-violet-700
                           text-white font-medium py-3 rounded-xl
                            shadow-lg shadow-purple-600/20
                            transition-all duration-200
                            disabled:opacity-40 disabled:shadow-none"
                      >
                        <ImageIcon className="size-4.5" />
                        Download Image
                      </button>
                    </a>

                    <a href={project.generatedVideo} download>
                      <button
                        disabled={!project.generatedVideo}
                        className="w-full flex items-center justify-center gap-2
      bg-white/10 hover:bg-white/20
      border border-white/20
      backdrop-blur-md
      text-white font-medium py-3 rounded-xl
      transition-all duration-200
      disabled:opacity-40"
                      >
                        <VideoIcon className="size-4.5" />
                        Download Video
                      </button>
                    </a>
                  </div>
                </div>

                {/* Generate video */}
                <div className="bg-slate-950/5 hover:bg-slate-950/10 dark:bg-white/10 dark:hover:bg-white/20 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">

                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <VideoIcon className="size-24" />
                  </div>

                  <h3 className="text-xl font-semibold mb-2">Video Magic</h3>
                  <p className="text-gray-400 text-sm mb-6">
                    Turn this static image into a dynamic video for social media.
                  </p>

                  {!project.generatedVideo ? (
                    <button
                      onClick={handleGenerateVideo}
                      disabled={isGenerating}
                      className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <>Generating Video...</>
                      ) : (
                        <>
                          <Sparkles className="size-4" />
                          Generate Video
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-center text-sm font-medium">
                      Video Generated Successfully
                    </div>
                  )}

                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Result