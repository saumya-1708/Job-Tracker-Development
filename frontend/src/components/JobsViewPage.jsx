import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function JobsViewPage() {
  const { preferenceId } = useParams();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState({});
  const [status, setStatus] = useState("pending");
  const [toasts, setToasts] = useState([]);

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://localhost:8080/jobs/${preferenceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch jobs");

      const data = await res.json();
      setJobs(data.Jobs || {});
      setStatus(data.Status || "pending");
    } catch (err) {
      console.error("❌ Error fetching jobs:", err);
      setToasts(prev => [
        ...prev,
        { id: Date.now(), message: "Error fetching jobs" },
      ]);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  // Download JSON
  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(jobs, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `jobs_${preferenceId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Navbar />

      {/* Background */}
      <div className="min-h-screen bg-gradient-to-br from-[#1F2A44] to-[#2F3A4A] p-8 pt-24 relative">

      {/* Toasts */}
      <div className="fixed top-6 right-6 flex flex-col space-y-3 z-50">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="bg-[#4A90E2] text-white px-4 py-2 rounded-lg shadow-lg"
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate('/jobs')}
        className="mb-4 px-3 py-1 bg-[#2F3A4A] text-white rounded hover:bg-[#1F2A44] transition"
      >
        ← Back
      </button>

      {/* Title */}
      <h2 className="text-3xl font-bold text-[#4A90E2] mb-6 text-center tracking-wide">
        Jobs for Preference {preferenceId}
      </h2>

      {/* Status + Download */}
      <div className="mb-4 text-center">
        <span
          className={`px-2 py-1 rounded font-semibold ${
            status === "pending"
              ? "bg-[#4A90E233] text-[#4A90E2]"
              : status === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          Status: {status.toUpperCase()}
        </span>

        <button
          onClick={handleDownload}
          className="ml-4 px-3 py-1 bg-[#4A90E2] text-white rounded hover:bg-[#3A7AC7] transition"
        >
          Download Jobs
        </button>
      </div>

      {/* Jobs */}
      {Object.keys(jobs).length === 0 ? (
        <p className="text-center text-white/70 mt-8">No jobs found yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(jobs).map(([keyword, links]) => (
            <div
              key={keyword}
              className="bg-white p-4 rounded-xl shadow-lg border border-[#1F2A44]/10"
            >
              <h3 className="font-bold text-[#2F3A4A] mb-2">{keyword}</h3>

              <ul className="list-disc list-inside">
                {links.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#4A90E2] hover:underline"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
