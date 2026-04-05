import axios from "axios";

const api = axios.create({
    // Remove "/api/test" from the end. Keep it to the base /api path.
    baseURL: import.meta.env.VITE_BASEURL || 'https://short-ai-add.vercel.app',
    withCredentials: true // Important for Clerk/Cookies if you use them later
});

export default api;