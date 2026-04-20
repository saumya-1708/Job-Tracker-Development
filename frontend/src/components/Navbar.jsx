import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import { User } from "lucide-react";

export default function Navbar({ showAuthButtons = true }) {
  const navigate = useNavigate();
  const location = useLocation(); // <-- ADD THIS
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUsername = localStorage.getItem("username");
    setIsLoggedIn(!!token);
    setUsername(storedUsername || "");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    navigate("/welcome");
  };

  const handleLogin = () => navigate("/login");

  // Hide scroll links on profile page
  const hideMenu =
  location.pathname === "/profile" ||
  location.pathname === "/login" ||
  location.pathname === "/signup" || 
  location.pathname === "/preferences" ||
  location.pathname.startsWith("/jobs/") ||
  location.pathname === "/jobs";


  return (
    <nav className="fixed top-0 left-0 w-full z-50 
      bg-white/70 backdrop-blur-lg border-b border-[#D0E2FF]/50 
      shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-300">
      
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">

        {/* Logo */}
        <h1
          onClick={() => navigate("/")}
          className="text-2xl font-bold bg-gradient-to-r from-[#0047AB] to-[#00BFFF]
          bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
        >
          🔍JobTracker
        </h1>

        {/* Scroll Links → hidden when on /profile */}
        {!hideMenu && (
          <div className="hidden md:flex gap-8 text-[#1F2A44] font-medium">
            {[
              { to: "hero", label: "Home" },
              { to: "about", label: "About" },
              { to: "how-it-works", label: "How It Works" },
              { to: "features", label: "Features" },
              { to: "contact", label: "Contact" },
            ].map((link) => (
              <ScrollLink
                key={link.to}
                to={link.to}
                smooth={true}
                duration={600}
                offset={-80}
                className="cursor-pointer relative group"
              >
                <span className="transition-all duration-300 group-hover:text-[#0047AB]">
                  {link.label}
                </span>
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] 
                  bg-gradient-to-r from-[#0047AB] to-[#00BFFF] 
                  transition-all duration-300 group-hover:w-full"></span>
              </ScrollLink>
            ))}
          </div>
        )}

        {/* Auth Buttons */}
        {showAuthButtons && (
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => navigate("/profile")}
                  className="p-2 rounded-full hover:bg-[#E8F0FF] transition-colors duration-300"
                  title={username}
                >
                  <User className="h-6 w-6 text-[#0047AB]" />
                </button>

                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-[#0047AB] to-[#00BFFF]
                  text-white px-3 py-2 rounded-lg font-medium shadow-md hover:opacity-90 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="bg-gradient-to-r from-[#0047AB] to-[#00BFFF]
                text-white px-3 py-2 rounded-lg font-medium shadow-md hover:opacity-90 transition"
              >
                Login
              </button>
            )}
          </div>
        )}

      </div>
    </nav>
  );
}
