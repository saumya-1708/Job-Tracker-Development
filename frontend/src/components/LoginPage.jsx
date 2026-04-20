import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    try {
      const res = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        // 🔐 Do NOT expose backend details
        setError("Incorrect email or password");
        return;
      }

      const data = await res.json();

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("username", data.username);

      navigate("/");
    } catch (err) {
      // 🌐 Network / server issue only
      alert("Unable to connect to server. Please try again.");
    }
  };
  return (
    <>
      <Navbar showAuthButtons={false} />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E8F0FF] via-[#F4F8FF] to-[#DDEBFF] p-4 pt-28">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10 border border-[#C5DAFF]">
          
          {/* Heading */}
          <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-[#0066FF] to-[#00BFFF] bg-clip-text text-transparent mb-2">
            Welcome Back 👋
          </h2>
          {error && (
                <div className="mb-0 text-center text-sm text-red-600 font-medium">
                  {error}
                </div>
          )}
          <p className="text-center text-[#1F2A44] mb-8 text-base">
            Sign in to continue your journey with{" "}
            <span className="font-semibold bg-gradient-to-r from-[#0047AB] to-[#00BFFF] bg-clip-text text-transparent">
              JobTracker 
            </span>
          </p>
          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-[#1F2A44] font-semibold mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2 border border-[#A7C8F9] rounded-lg focus:ring-2 focus:ring-[#0066FF] outline-none transition shadow-sm"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-[#1F2A44] font-semibold mb-1">
                Password
              </label>

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 border border-[#A7C8F9] rounded-lg focus:ring-2 focus:ring-[#0066FF] outline-none transition shadow-sm"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-gray-500 hover:text-[#1F2A44] transition"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{
                scale: 1.05,
                background: "linear-gradient(90deg, #007BFF 0%, #00BFFF 100%)",
                color: "#fff",
                boxShadow: "0 4px 12px rgba(0, 191, 255, 0.4)",
              }}
              transition={{ duration: 0.3 }}
              type="submit"
              className="w-full bg-[#1F2A44] text-white py-2.5 rounded-xl font-semibold shadow-md"
            >
              Sign In
            </motion.button>
          </form>

          {/* Sign Up */}
          <p className="text-center text-[#1F2A44] text-sm mt-5">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-[#0066FF] font-semibold hover:underline"
            >
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
