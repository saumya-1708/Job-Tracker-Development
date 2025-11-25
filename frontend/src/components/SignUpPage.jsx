import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const navigate = useNavigate();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc", ".docx"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => setResumeFile(acceptedFiles[0]),
  });

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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (!resumeFile) {
      alert("Please upload your resume.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("phone", phone);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("username", username);
      formData.append("resume", resumeFile);

      const res = await fetch("http://localhost:8080/signup", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Signup failed");

      await res.json();
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Network issue or signup failed");
    }
  };

  return (
    <>
      <Navbar showAuthButtons={false} />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E8F0FF] via-[#F4F8FF] to-[#DDEBFF] p-4 pt-28">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10 border border-[#C5DAFF]">

          <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-[#0066FF] to-[#00BFFF] bg-clip-text text-transparent mb-2">
            Create Your Account ✨
          </h2>

          <p className="text-center text-[#1F2A44] mb-8 text-base">
            Begin your journey with{" "}
            <span className="font-semibold bg-gradient-to-r from-[#0047AB] to-[#00BFFF] bg-clip-text text-transparent">
              JobTracker
            </span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Phone */}
            <div>
              <label className="block text-[#1F2A44] font-semibold mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter your number"
                maxLength={10}
                required
                className="w-full px-4 py-2 border border-[#A7C8F9] rounded-lg focus:ring-2 focus:ring-[#0066FF] outline-none shadow-sm"
              />
            </div>

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
                className="w-full px-4 py-2 border border-[#A7C8F9] rounded-lg focus:ring-2 focus:ring-[#0066FF] outline-none shadow-sm"
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
                className="w-full px-4 py-2 border border-[#A7C8F9] rounded-lg focus:ring-2 focus:ring-[#0066FF] outline-none shadow-sm"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-gray-500 hover:text-[#1F2A44] transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label className="block text-[#1F2A44] font-semibold mb-1">
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 border border-[#A7C8F9] rounded-lg focus:ring-2 focus:ring-[#0066FF] outline-none shadow-sm"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-10 text-gray-500 hover:text-[#1F2A44] transition"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>

            {/* Username */}
            <div>
              <label className="block text-[#1F2A44] font-semibold mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                required
                className="w-full px-4 py-2 border border-[#A7C8F9] rounded-lg focus:ring-2 focus:ring-[#0066FF] outline-none shadow-sm"
              />
            </div>

            {/* Resume Upload */}
            <div>
              <label className="block text-[#1F2A44] font-semibold mb-1">
                Upload Resume
              </label>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition ${
                  isDragActive
                    ? "border-[#00BFFF] bg-[#E8F7FF]"
                    : "border-[#A7C8F9] hover:border-[#0066FF]"
                }`}
              >
                <input {...getInputProps()} />

                {resumeFile ? (
                  <p className="text-[#1F2A44] font-medium">{resumeFile.name}</p>
                ) : isDragActive ? (
                  <p className="text-[#0066FF] font-semibold">Drop your resume...</p>
                ) : (
                  <p className="text-[#1F2A44]">
                    Drag & drop your resume, or click to select (PDF/DOC)
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
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
              Create Account
            </motion.button>
          </form>

          <p className="text-center text-[#1F2A44] text-sm mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-[#0066FF] font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
