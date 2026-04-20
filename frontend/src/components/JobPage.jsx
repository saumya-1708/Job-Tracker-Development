import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Eye, Download } from "lucide-react";

export default function JobPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // ✅ NEW
  const navigate = useNavigate();
  const historyRef = useRef([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,      // column key
    direction: "asc" // asc | desc
  });
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-700",
    success: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  };

  // ✅ NEW — counts for tabs
  const statusCount = {
    all: history.length,
    pending: history.filter(h => h.Status === "pending").length,
    failed: history.filter(h => h.Status === "failed").length,
    success: history.filter(h => h.Status === "success").length,
  };

  const formatDateTime = (date) =>
  new Date(date).toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        // toggle direction
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc"
        };
      }
      // new column → default asc
      return { key, direction: "asc" };
    });
  };
  // 1️⃣ Filter first
const filteredHistory =
  activeTab === "all"
    ? history
    : history.filter(h => h.Status === activeTab);

// 2️⃣ Then sort
const sortedHistory = [...filteredHistory].sort((a, b) => {
  if (!sortConfig.key) return 0;

  let valA = a[sortConfig.key];
  let valB = b[sortConfig.key];

  if (valA == null) return 1;
  if (valB == null) return -1;

  if (typeof valA === "number" && typeof valB === "number") {
    return sortConfig.direction === "asc"
      ? valA - valB
      : valB - valA;
  }

  return sortConfig.direction === "asc"
    ? String(valA).localeCompare(String(valB))
    : String(valB).localeCompare(String(valA));
});

  // ✅ NEW — filtered list
  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:8080/jobs-history", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();
      const list = Array.isArray(data) ? data : [];

      setHistory(list);
      historyRef.current = list;
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();

    const interval = setInterval(() => {
      if (historyRef.current.some(h => h.Status === "pending")) {
        fetchHistory();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleDownload = (prefId) => {
  const item = history.find(h => h.PreferenceID === prefId);
  if (!item || item.Status !== "success" || !item.Jobs) return;

  let content = "";

  Object.entries(item.Jobs).forEach(([role, jobList]) => {
    content += `\n=== ${role} ===\n\n`;

    jobList.forEach((job, index) => {
      content += `${index + 1}. ${job}\n`;
    });

    content += "\n";
  });

  const blob = new Blob([content], {
    type: "text/plain",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `jobs_${prefId}.txt`;
  link.click();

  URL.revokeObjectURL(url);
};

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-[#E8F0FF] via-[#F4F8FF] to-[#DDEBFF] pt-28 px-8">
        <div className="bg-white max-w-6xl mx-auto rounded-3xl shadow-2xl border border-[#C5DAFF] p-10">

          <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-[#0066FF] to-[#00BFFF] bg-clip-text text-transparent">
            Job Searches
          </h2>
          <div className="flex justify-end mt-6 mb-6">
          <button
            onClick={() => navigate("/preferences")}
            className="flex items-center gap-2 px-5 py-2.5
                      bg-gradient-to-r from-[#0047AB] to-[#00BFFF] text-white font-semibold rounded-lg
                      shadow-md hover:bg-[#1D4ED8] transition"
          >
            <span className="text-lg leading-none">+</span>
            New Job Search
          </button>
        </div>
          {/* ✅ NEW — Tabs (from image) */}
          <div className="flex gap-8 border-b border-[#D0E2FF] mt-8 mb-10">
            {[
              { key: "all", label: "All" },
              { key: "pending", label: "In progress" },
              { key: "failed", label: "Exceptions" },
              { key: "success", label: "Completed" },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 text-sm font-semibold relative
                  ${
                    activeTab === tab.key
                      ? "text-[#0066FF]"
                      : "text-gray-500 hover:text-[#1F2A44]"
                  }`}
              >
                {tab.label}
                {tab.key !== "all" && (
                  <span className="ml-2 px-2 py-[2px] rounded-full text-xs bg-[#E8F0FF] text-[#0066FF]">
                    {statusCount[tab.key]}
                  </span>
                )}

                {activeTab === tab.key && (
                  <span className="absolute left-0 -bottom-[1px] w-full h-[2px] bg-[#0066FF]" />
                )}
              </button>
            ))}
          </div>
          <div className="mt-6 overflow-x-auto border border-[#C5DAFF] rounded-xl">
            <table className="w-full text-left">
              <thead className="bg-[#0047AB] text-white">
                <tr>
                  <th
                    className="p-4 cursor-pointer select-none"
                    onClick={() => handleSort("PreferenceID")}
                  >
                    Search ID{" "}
                    {sortConfig.key === "PreferenceID" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="p-4 cursor-pointer select-none"
                    onClick={() => handleSort("CreatedAt")}
                  >
                    Created{" "}
                    {sortConfig.key === "CreatedAt" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>

                  <th
                    className="p-4 cursor-pointer select-none"
                    onClick={() => handleSort("Status")}
                  >
                    Status{" "}
                    {sortConfig.key === "Status" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>

                  <th
                    className="p-4 cursor-pointer select-none"
                    onClick={() => handleSort("JobCount")}
                  >
                    Jobs{" "}
                    {sortConfig.key === "JobCount" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>

                  <th className="p-4">Actions</th>
                </tr>
              </thead>


              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-gray-400">
                      Loading job history...
                    </td>
                  </tr>
                ) : sortedHistory.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-6 text-center">
                      No job requests
                    </td>
                  </tr>
                ) : (
                  sortedHistory.map((item, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-t hover:bg-[#F4F8FF]"
                    >
                      <td className="p-4 font-medium text-[#1F2A44]">
                        Job Search {idx + 1}
                      </td>


                      <td className="p-4 text-sm text-gray-600">
                        {item.CreatedAt ? formatDateTime(item.CreatedAt) : "—"}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${statusStyles[item.Status]}`}
                        >
                          {item.Status.toUpperCase()}
                        </span>
                      </td>

                      <td className="p-4">{item.JobCount || 0}</td>

                      <td className="p-4 flex gap-3">
                        <button
                          disabled={item.Status === "pending"}
                          onClick={() => navigate(`/jobs/${item.PreferenceID}`)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300
                            ${
                              item.Status === "pending"
                                ? "bg-gray-400 cursor-not-allowed text-white"
                                : "bg-[#1F2A44] text-white hover:bg-gradient-to-r hover:from-[#0047AB] hover:to-[#00BFFF] hover:shadow-lg hover:scale-105"
                            }`}
                        >
                          <Eye size={16} />
                          View
                        </button>

                        <button
                          disabled={item.Status !== "success"}
                          onClick={() => handleDownload(item.PreferenceID)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300
                            ${
                              item.Status !== "success"
                                ? "bg-gray-400 cursor-not-allowed text-white"
                                : "bg-[#1F2A44] text-white hover:bg-gradient-to-r hover:from-[#0047AB] hover:to-[#00BFFF] hover:shadow-lg hover:scale-105"
                            }`}
                        >
                          <Download size={16} />
                          Download
                        </button>

                      </td>
                    </motion.tr>
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
