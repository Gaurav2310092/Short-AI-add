import { DollarSignIcon, FolderEditIcon, GalleryHorizontalEnd, MenuIcon, Sparkle, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useThemeContext } from "../context/ThemeContext";
import { navLinks } from "../data/navLinks";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useClerk, useUser, UserButton, useAuth } from "@clerk/clerk-react";
import api from "../configs/axios";

export default function Navbar() {
    const navigate = useNavigate()

    const { user } = useUser()
    const { openSignIn, openSignUp } = useClerk()
    const{getToken}=useAuth()
    const [openMobileMenu, setOpenMobileMenu] = useState(false);
    const { theme } = useThemeContext();

    const [credits,setCredits]=useState(0);
    const {pathname}=useLocation()

    const getUsercredits=async()=>{
        try{
            const token=await getToken()
            const {data}=await api.get('/api/user/credits',{headers:{Authorization :`Bearer ${token}`}})
            setCredits(data.credits)
        }catch(error){
            toast.error(error?.response?.data?.message || error.message)
            console.log(error);
        }
    }

    useEffect(()=>{
        if(user){
            (async()=>await getUsercredits())();
        }
    },[user,pathname])

    useEffect(() => {
        if (openMobileMenu) {
            document.body.classList.add("max-md:overflow-hidden");
        } else {
            document.body.classList.remove("max-md:overflow-hidden");
        }
    }, [openMobileMenu]);

    return (
        <nav className={`flex items-center justify-between fixed z-50 top-0 w-full px-6 md:px-16 lg:px-24 xl:px-32 py-4 ${openMobileMenu ? '' : 'backdrop-blur'}`}>
            <Link to="/" onClick={() => scrollTo(0, 0)}>
                <img className="h-9 md:h-9.5 w-auto shrink-0" src={theme === "dark" ? "/assets/logo.svg" : "/assets/logo.svg"} alt="Logo" width={140} height={40} priority fetchPriority="high" />
            </Link>
            <div className="hidden items-center md:gap-8 lg:gap-9 md:flex lg:pl-20">
                {navLinks.map((link) => (
                    <Link key={link.name} to={link.href} className="hover:text-slate-600 dark:hover:text-slate-300" onClick={() => scrollTo(0, 0)}>
                        {link.name}
                    </Link>
                ))}
            </div>
            {/* Mobile menu */}
            <div className={`fixed inset-0 flex flex-col items-center justify-center gap-6 text-lg font-medium bg-white/60 dark:bg-black/40 backdrop-blur-md md:hidden transition duration-300 ${openMobileMenu ? "translate-x-0" : "-translate-x-full"}`}>
                {navLinks.map((link) => (
                    <Link key={link.name} href={link.href}>
                        {link.name}
                    </Link>
                ))}
                <button onClick={() => openSignIn()}>
                    Sign in
                </button>
                <button onClick={() => openSignUp()}>
                    Get Started
                </button>
                <button className="aspect-square size-10 p-1 items-center justify-center bg-purple-600 hover:bg-purple-700 transition text-white rounded-md flex" onClick={() => setOpenMobileMenu(false)}>
                    <XIcon />
                </button>
            </div>

            {!user ? (
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <button onClick={() => openSignIn()} className="hidden md:block hover:bg-slate-100 dark:hover:bg-purple-950 transition px-4 py-2 border border-purple-600 rounded-md">
                        Sign in
                    </button>
                    <button onClick={() => openSignUp()} className="hidden md:block px-4 py-2 bg-purple-600 hover:bg-purple-700 transition text-white rounded-md">
                        Get started
                    </button>
                    <button onClick={() => setOpenMobileMenu(!openMobileMenu)} className="md:hidden">
                        <MenuIcon size={26} className="active:scale-90 transition" />
                    </button>
                </div>
            ) : (
                <div className="flex gap-2">
                    <button onClick={() => navigate('/plans')} className="border-none text-gray-300 sm:py-1 ">
                        Credits:{credits}
                    </button>
                    <UserButton afterSignOutUrl="/">
                        <UserButton.MenuItems>

                            <UserButton.Link
                                label="Generate"
                                labelIcon={<Sparkle size={14} />}
                                href="/generate"
                            />

                            <UserButton.Link
                                label="My Generations"
                                labelIcon={<FolderEditIcon size={14} />}
                                href="/my-generations"
                            />

                            <UserButton.Link
                                label="Community"
                                labelIcon={<GalleryHorizontalEnd size={14} />}
                                href="/community"
                            />

                            <UserButton.Link
                                label="Plans"
                                labelIcon={<DollarSignIcon size={14} />}
                                href="/plans"
                            />

                        </UserButton.MenuItems>
                    </UserButton>

                </div>
            )}

        </nav>
    );
}