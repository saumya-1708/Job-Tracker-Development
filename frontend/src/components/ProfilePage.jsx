import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

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

        if (!res.ok)
          throw new Error("Failed to fetch profile. Please login again.");

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

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E8F0FF] to-[#F7F9FB] py-20">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl flex flex-col md:flex-row overflow-hidden border border-[#A7C8F9]/40">
          
          {/* Left Panel - Profile Summary */}
          <div className="bg-[#4A90E2] text-white md:w-1/3 p-8 flex flex-col items-center justify-center text-center">
            <div className="h-32 w-32 rounded-full bg-white text-[#4A90E2] flex items-center justify-center text-4xl font-bold shadow-md">
              {profile?.username?.charAt(0).toUpperCase() || "?"}
            </div>
            <h2 className="text-2xl font-semibold mt-5">
              {profile?.username || "Guest"}
            </h2>
            <p className="text-[#D6E8FF] mt-1 text-sm">
              {profile?.email || "No email available"}
            </p>

            <div className="mt-6 text-center space-y-2 text-sm italic text-[#E3F0FF]/90">
              “Turning career goals into reality — one job at a time.”
            </div>
          </div>

          {/* Right Panel - Profile Details */}
          <div className="md:w-2/3 p-10 bg-[#F9FBFE]">
            <h3 className="text-3xl font-bold text-[#2F3A4A] border-b-2 border-[#A7C8F9]/40 pb-3 mb-8">
              Profile Overview
            </h3>

            {error && (
              <p className="text-red-500 text-center font-medium">{error}</p>
            )}

            {profile ? (
              <>
                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[#2F3A4A]">
                  <div className="p-5 bg-white rounded-xl shadow-sm border border-[#E0EAFD] hover:shadow-md transition">
                    <span className="font-semibold text-[#4A90E2]">
                      Username:
                    </span>
                    <p>{profile.username || "N/A"}</p>
                  </div>

                  <div className="p-5 bg-white rounded-xl shadow-sm border border-[#E0EAFD] hover:shadow-md transition">
                    <span className="font-semibold text-[#4A90E2]">Email:</span>
                    <p>{profile.email || "N/A"}</p>
                  </div>

                  <div className="p-5 bg-white rounded-xl shadow-sm border border-[#E0EAFD] hover:shadow-md transition">
                    <span className="font-semibold text-[#4A90E2]">Phone:</span>
                    <p>{profile.phone || "Not added"}</p>
                  </div>

                  <div className="p-5 bg-white rounded-xl shadow-sm border border-[#E0EAFD] hover:shadow-md transition">
                    <span className="font-semibold text-[#4A90E2]">
                      Account Created:
                    </span>
                    <p>
                      {new Date(
                        profile.created_at || Date.now()
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-10">
                  <h4 className="text-2xl font-semibold text-[#2F3A4A] mb-4">
                    Quick Actions
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => navigate("/jobs")}
                      className="bg-[#4A90E2] text-white px-5 py-2 rounded-full hover:bg-[#2F3A4A] transition"
                    >
                      View Job Searches
                    </button>
                    <button className="bg-[#A7C8F9] text-[#2F3A4A] px-5 py-2 rounded-full hover:bg-[#8FB9F4] transition">
                      Edit Profile
                    </button>
                    <button className="bg-[#E8F0FF] text-[#2F3A4A] px-5 py-2 rounded-full hover:bg-[#D7E5FD] transition">
                      Settings
                    </button>
                  </div>
                </div>
              </>
            ) : (
              !error && (
                <p className="text-center text-gray-500">
                  Loading profile...
                </p>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
