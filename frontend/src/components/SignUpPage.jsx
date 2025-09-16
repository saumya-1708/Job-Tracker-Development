import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phone = e.target.phone.value.trim();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;
    const username = e.target.username.value.trim();

    if (!/^\d{10}$/.test(phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, email, password, username }),
      });

      if (!res.ok) throw new Error("Signup failed");

      const data = await res.json();
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Network issue or signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-center text-teal-700 mb-6">
          Sign Up
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-teal-700 mb-1">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="Enter your number"
              required
              pattern="\d{10}"
              maxLength={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
            />
          </div>

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
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="relative">
            <label className="block text-teal-700 mb-1">Confirm Password</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              placeholder="••••••••"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          <div>
            <label className="block text-teal-700 mb-1">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your Username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-2 rounded-lg font-semibold shadow-md hover:from-teal-600 hover:to-blue-600 transition duration-300"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-teal-700 text-sm mt-4">
          Already have an account?{" "}
          <Link to="/" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
