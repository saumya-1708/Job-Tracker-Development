// src/components/Navbar.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, LogIn } from "lucide-react";

export default function Navbar({ showAuthButtons = true }) {
  const navigate = useNavigate();
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
    console.log("Logged out");
    setIsLoggedIn(false);
    navigate("/welcome");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white bg-opacity-80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* App Name */}
        <h1
          onClick={() => navigate("/")}
          className="text-2xl font-bold text-teal-600 cursor-pointer"
        >
          JobTracker
        </h1>

        {/* Conditionally render auth buttons */}
        {showAuthButtons && (
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>

                {/* Profile Button */}
                <button
                  onClick={() => navigate("/profile")}
                  className="p-2 rounded-full hover:bg-teal-100 transition"
                >
                  <User className="h-6 w-6 text-teal-700" />
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-teal-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-teal-700 transition"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center gap-1 bg-teal-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-teal-700 transition"
              >
                <LogIn className="h-4 w-4" />
                Login
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
