import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Pencil,Settings } from "lucide-react";


export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("To view your profile, please log in or sign up.");
          return;
        }

        const res = await fetch("http://localhost:8080/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch profile. Please login again.");

        const data = await res.json();
        setProfile(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProfile();
  }, []);

  return (
    <>
      <Navbar />

      {/* Background theme same as landing page */}
      <div className="min-h-screen w-full bg-gradient-to-br from-[#F3F7FF] via-[#EAF2FF] to-[#DDEBFF] flex justify-center py-20 px-6">
        
        {/* Card Wrapper */}
        <div className="bg-white shadow-2xl rounded-3xl border border-[#C5DAFF] max-w-6xl w-full flex flex-col md:flex-row overflow-hidden">

          {/* Left Panel */}
          <div className="md:w-1/3 bg-gradient-to-br from-[#0047AB] to-[#00BFFF] text-white p-10 flex flex-col items-center justify-center text-center">
            <div className="w-32 h-32 rounded-full bg-white text-[#0047AB] font-bold flex justify-center items-center text-4xl shadow-xl border border-[#A7C8F9]">
              {profile?.username?.charAt(0).toUpperCase() || "?"}
            </div>

            <h2 className="text-2xl font-bold mt-6 drop-shadow-md">
              {profile?.username || "Guest User"}
            </h2>

            <p className="text-[#D6EFFF] mt-1 text-sm">
              {profile?.email || "No email available"}
            </p>

            <div className="mt-6 italic text-[#EAF6FF] max-w-xs text-sm">
              “Turning career goals into reality — one job at a time.”
            </div>
          </div>

          {/* Right Panel */}
          <div className="md:w-2/3 bg-[#F9FBFF] p-10">
           <div className="flex items-center justify-between pb-4 border-b-2 border-[#C5DAFF]">
            <h3 className="text-3xl font-bold text-[#1F2A44]">
              Profile Overview
            </h3>

            {/* Icons Row */}
            <div className="flex items-center gap-3">

              {/* Edit (Pencil) */}
              <button
              onClick={() => navigate("/edit-profile")}
              className="group p-2 rounded-xl border border-[#C5DAFF] bg-white 
                        hover:bg-gradient-to-r from-[#0047AB] to-[#00BFFF] 
                        transition shadow-sm flex items-center justify-center"
            >
              <Pencil
                size={20}
                className="text-[#0066FF] group-hover:text-white transition"
              />
            </button>

              {/* Settings (Gear/Wheel) */}
              <button
                onClick={() => navigate("/settings")}
                className="group p-2 rounded-xl border border-[#C5DAFF] bg-white 
                          hover:bg-gradient-to-r from-[#0047AB] to-[#00BFFF] 
                          transition shadow-sm flex items-center justify-center"
              >
                <Settings
                  size={20}
                  className="text-[#0066FF] group-hover:text-white transition"
                />
              </button>


            </div>
          </div>
   
            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-center mt-4 font-medium">{error}</p>
            )}

            {/* Info Section */}
            {profile ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                  
                  {/* Card 1 */}
                  <div className="bg-white border border-[#E1EFFF] p-5 rounded-xl shadow hover:shadow-lg transition">
                    <span className="font-semibold text-[#0066FF]">Username</span>
                    <p className="text-[#2F3A4A]">{profile.username}</p>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white border border-[#E1EFFF] p-5 rounded-xl shadow hover:shadow-lg transition">
                    <span className="font-semibold text-[#0066FF]">Email</span>
                    <p className="text-[#2F3A4A]">{profile.email}</p>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white border border-[#E1EFFF] p-5 rounded-xl shadow hover:shadow-lg transition">
                    <span className="font-semibold text-[#0066FF]">Phone</span>
                    <p className="text-[#2F3A4A]">{profile.phone || "Not added"}</p>
                  </div>

                  {/* Card 4 */}
                  <div className="bg-white border border-[#E1EFFF] p-5 rounded-xl shadow hover:shadow-lg transition">
                    <span className="font-semibold text-[#0066FF]">Account Created</span>
                    <p className="text-[#2F3A4A]">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-12">
                  <h4 className="text-2xl font-semibold text-[#1F2A44] mb-4">
                    Quick Actions
                  </h4>
                  <div className="flex gap-4 flex-wrap">
                    {/* Button 1 */}
                    <motion.button
                      whileHover={{
                        scale: 1.05,
                        background: "linear-gradient(90deg, #007BFF, #00BFFF)",
                        color: "#fff",
                      }}
                      transition={{ duration: 0.3 }}
                      onClick={() => navigate("/jobs")}
                      className="bg-[#1F2A44] text-white px-6 py-2 rounded-full font-semibold shadow"
                    >
                      View Job Searches
                    </motion.button>
                  </div>
                </div>
              </>
            ) : (
              !error && <p className="mt-8 text-center text-gray-500">Loading profile...</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
