import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

export default function JobPage() {
  const [history, setHistory] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Fetch history
  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:8080/jobs-history", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch history");

      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error fetching history:", err);
      setToasts(prev => [
        ...prev,
        { id: Date.now(), message: "Error fetching history" },
      ]);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  // Download jobs JSON
  const handleDownload = (prefId) => {
    const item = history.find(h => h.PreferenceID === prefId);
    if (!item || !item.Jobs) return;

    const blob = new Blob([JSON.stringify(item.Jobs, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `jobs_${prefId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-[#E8F0FF] via-[#F4F8FF] to-[#DDEBFF] p-6 pt-28 relative">

        {/* Toasts */}
        <div className="fixed top-6 right-6 flex flex-col space-y-3 z-50">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className="bg-[#0066FF] text-white px-4 py-2 rounded-xl shadow-lg border border-[#A7C8F9]"
            >
              {toast.message}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-5xl mx-auto border border-[#C5DAFF]">

          {/* Heading */}
          <h2 className="text-3xl font-extrabold text-center mb-8 bg-gradient-to-r from-[#0066FF] to-[#00BFFF] bg-clip-text text-transparent">
            Job Requests History
          </h2>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-[#C5DAFF] shadow-md">
            <table className="w-full border-collapse">
              <thead className="bg-gradient-to-r from-[#1F2A44] to-[#2F3A4A] text-white">
                <tr>
                  <th className="p-4 text-left font-semibold">Preference ID</th>
                  <th className="p-4 text-left font-semibold">Status</th>
                  <th className="p-4 text-left font-semibold">Job Count</th>
                  <th className="p-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-[#1F2A44]">
                      No requests found
                    </td>
                  </tr>
                ) : (
                  history.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-t border-[#E3ECFF] hover:bg-[#F4F8FF] transition"
                    >
                      <td className="p-4 font-mono text-sm text-[#1F2A44]">
                        {item.PreferenceID}
                      </td>

                      <td className="p-4 font-semibold">
                        {item.Status === "pending" && (
                          <span className="text-yellow-600">🟡 Pending</span>
                        )}
                        {item.Status === "success" && (
                          <span className="text-green-600">🟢 Success</span>
                        )}
                        {item.Status === "failed" && (
                          <span className="text-red-600">🔴 Failed</span>
                        )}
                      </td>

                      <td className="p-4">{item.JobCount || 0}</td>

                      <td className="p-4 flex gap-3">

                        {/* VIEW JOBS BUTTON */}
                        <motion.button
                          whileHover={{
                            scale: item.Status === "pending" ? 1 : 1.05,
                            background:
                              item.Status === "pending"
                                ? undefined
                                : "linear-gradient(90deg, #007BFF 0%, #00BFFF 100%)",
                            color: item.Status === "pending" ? undefined : "#fff",
                            boxShadow:
                              item.Status === "pending"
                                ? undefined
                                : "0 4px 12px rgba(0, 191, 255, 0.4)",
                          }}
                          transition={{ duration: 0.3 }}
                          disabled={item.Status === "pending"}
                          onClick={() =>
                            window.open(`/jobs/${item.PreferenceID}`, "_blank")
                          }
                          className={`px-4 py-2 rounded-lg font-semibold shadow-md 
                            ${
                              item.Status === "pending"
                                ? "bg-gray-400 cursor-not-allowed text-white"
                                : "bg-[#1F2A44] text-white"
                            }`}
                        >
                          View Jobs
                        </motion.button>

                        {/* DOWNLOAD BUTTON */}
                        <motion.button
                          whileHover={{
                            scale: 1.05,
                            background: "linear-gradient(90deg, #00BFFF 0%, #4DD3FF 100%)",
                            color: "#fff",
                            boxShadow: "0 4px 12px rgba(0, 191, 255, 0.3)",
                          }}
                          transition={{ duration: 0.3 }}
                          onClick={() => handleDownload(item.PreferenceID)}
                          className="px-4 py-2 bg-[#1F2A44] text-white rounded-lg font-semibold shadow-md"
                        >
                          Download
                        </motion.button>

                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
