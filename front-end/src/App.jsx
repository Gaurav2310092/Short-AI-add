import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import LenisScroll from "./components/Lenis"
import Generator from "./pages/Generator"
import Result from "./pages/Result"
import MyGenerations from "./pages/MyGenerations"
import Community from "./pages/Community"
import Plans from "./pages/Plans"
import Loading from "./pages/Loading"
import {Toaster} from "react-hot-toast"

export default function App() {
    return (
        <>
            <Toaster toastOptions={{style:{background:'#333',color:'#fff'}}}/>
            <Navbar />
            <LenisScroll />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path='/generate' element={<Generator/>}/>
                <Route path='/result/:projectId' element={<Result/>}/>
                <Route path='/my-generations' element={<MyGenerations/>}/>
                <Route path='/community' element={<Community/>}/>
                <Route path='/plans' element={<Plans/>}/>
                <Route path='/loading' element={<Loading/>}/>
            </Routes>
            <Footer />
        </>
    )
}