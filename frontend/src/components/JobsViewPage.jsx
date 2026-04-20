import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

export default function JobsViewPage() {
  const { preferenceId } = useParams();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState({});
  const [status, setStatus] = useState("pending");
  const [preference, setPreference] = useState(null);
  const [toasts, setToasts] = useState([]);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:8080/jobs-history", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch jobs");

      const data = await res.json();
      const pref = data.find(
        (item) => item.PreferenceID === preferenceId
      );

      if (!pref) {
        setStatus("pending");
        setJobs({});
        setPreference(null);
        return;
      }

      setStatus(pref.Status);
      setJobs(pref.Jobs || {});
      setPreference({
        roles: pref.roles || [],
        locations: pref.locations || [],
        experience: pref.experience,
        salaryRange: pref.salaryRange || [],
      });

    } catch (err) {
      console.error(err);
      setToasts((prev) => [
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

  const handleDownload = () => {
  if (status !== "success" || Object.keys(jobs).length === 0) return;

  let content = "";

  Object.entries(jobs).forEach(([role, jobList]) => {
    content += `\n=== ${role} ===\n\n`;

    jobList.forEach((job, index) => {
      content += `${index + 1}. ${job}\n`;
    });

    content += "\n";
  });

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `jobs_${preferenceId}.txt`;
  link.click();

  URL.revokeObjectURL(url);
};

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-[#E8F0FF] via-[#F4F8FF] to-[#DDEBFF] p-6 pt-28">

        {/* Toasts */}
        <div className="fixed top-6 right-6 space-y-3 z-50">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="bg-[#0066FF] text-white px-4 py-2 rounded-xl shadow-lg border border-[#A7C8F9]"
            >
              {toast.message}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-6xl mx-auto border border-[#C5DAFF]">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate("/jobs")}
              className="px-4 py-2 bg-[#1F2A44] text-white rounded-lg font-semibold"
            >
              ← Back
            </button>

            <motion.button
              whileHover={status === "success" ? { scale: 1.05 } : {}}
              transition={{ duration: 0.3 }}
              disabled={status !== "success"}
              onClick={handleDownload}
              className={`px-4 py-2 rounded-lg font-semibold
                ${
                  status !== "success"
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-[#1F2A44] text-white hover:bg-[#162033]"
                }`}
            >
              Download Jobs
            </motion.button>

          </div>

          {/* Title */}
          <h2 className="text-3xl font-extrabold text-center mb-4 bg-gradient-to-r from-[#0066FF] to-[#00BFFF] bg-clip-text text-transparent">
            Jobs for Preference {preferenceId}
          </h2>

          {/* Status */}
          <div className="text-center mb-6">
            <span className={`px-4 py-2 rounded-lg font-semibold
              ${status === "pending" && "bg-yellow-100 text-yellow-700"}
              ${status === "success" && "bg-green-100 text-green-700"}
              ${status === "failed" && "bg-red-100 text-red-700"}
            `}>
              {status.toUpperCase()}
            </span>
          </div>

          {/* ✅ Preference Used */}
          {preference && (
            <div className="mb-10 bg-[#F4F8FF] border border-[#C5DAFF] rounded-2xl p-6">
              <h3 className="text-xl font-bold text-[#1F2A44] mb-4">
                Preference Used
              </h3>

              <div className="grid md:grid-cols-2 gap-4 text-sm">

                <div>
                  <span className="font-semibold text-[#0066FF]">Roles:</span>
                  <p className="text-[#1F2A44]">
                    {preference.roles.join(", ") || "—"}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-[#0066FF]">Locations:</span>
                  <p className="text-[#1F2A44]">
                    {preference.locations.join(", ") || "—"}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-[#0066FF]">Experience:</span>
                  <p className="text-[#1F2A44]">
                    {preference.experience ?? "—"} years
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-[#0066FF]">Salary Range:</span>
                  <p className="text-[#1F2A44]">
                    {preference.salaryRange.length === 2
                      ? `₹${preference.salaryRange[0]} – ₹${preference.salaryRange[1]}`
                      : "—"}
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* Jobs */}
          {Object.keys(jobs).length === 0 ? (
            <p className="text-center text-[#1F2A44]">
              No jobs found yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(jobs).map(([keyword, links]) => (
                <div
                  key={keyword}
                  className="bg-white p-6 rounded-2xl shadow-xl border border-[#C5DAFF]"
                >
                  <h3 className="font-bold text-[#1F2A44] mb-3">
                    {keyword}
                  </h3>

                  <ul className="list-disc list-inside space-y-1">
                    {links.map((link, idx) => (
                      <li key={idx}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0066FF] hover:underline break-all"
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
      </div>
    </>
  );
}
