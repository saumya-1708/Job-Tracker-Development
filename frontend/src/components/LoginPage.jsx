import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Login failed");

      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      navigate("/welcome");
    } catch (err) {
      console.error(err);
      alert("Network issue or login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-center text-teal-700 mb-6">
          Sign In
        </h2>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-teal-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
            />
          </div>

          <div className="relative">
            <label className="block text-teal-700 mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="••••••••"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-2 rounded-lg font-semibold shadow-md hover:from-teal-600 hover:to-blue-600 transition duration-300"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-teal-700 text-sm mt-4">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
