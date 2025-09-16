import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Fetch user profile from backend
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:8080/profile", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white p-6">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-8">
        <h2 className="text-3xl font-bold text-center text-teal-700 mb-6">
          My Profile
        </h2>

        {profile ? (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {profile.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-teal-700">
                  {profile.username}
                </h3>
                <p className="text-gray-600">{profile.email}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between text-gray-700">
                <span className="font-medium">Phone:</span>
                <span>{profile.phone}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span className="font-medium">Email:</span>
                <span>{profile.email}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span className="font-medium">Username:</span>
                <span>{profile.username}</span>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-2 rounded-lg font-semibold shadow-md hover:from-teal-600 hover:to-blue-600 transition">
              Edit Profile
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-500">Loading profile...</p>
        )}
      </div>
    </div>
  );
}
