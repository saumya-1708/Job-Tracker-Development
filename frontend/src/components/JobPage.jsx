import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

export default function JobPage() {
  const [history, setHistory] = useState([]);
  const [toasts, setToasts] = useState([]);

  // 🧾 Fetch request history
  useEffect(() => {
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
    fetchHistory();
  }, []);

  // 💾 Download jobs as JSON
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
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white p-8 pt-24 relative">
        {/* Toasts */}
        <div className="fixed top-6 right-6 flex flex-col space-y-3 z-50">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className="bg-teal-500 text-white px-4 py-2 rounded-lg shadow-md"
            >
              {toast.message}
            </div>
          ))}
        </div>

        <h2 className="text-3xl font-bold text-teal-700 mb-6 text-center">
          Job Requests History
        </h2>

        {/* History Table */}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg shadow-md">
            <thead className="bg-teal-600 text-white">
              <tr>
                <th className="p-3 text-left">Preference ID</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Job Count</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-4 text-gray-600">
                    No requests found
                  </td>
                </tr>
              ) : (
                history.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-t hover:bg-teal-50 transition-colors"
                  >
                    <td className="p-3 font-mono text-sm">{item.PreferenceID}</td>
                    <td className="p-3">
                      {item.Status === "Success" ? (
                        <span className="text-green-600 font-semibold">🟢 Success</span>
                      ) : (
                        <span className="text-red-600 font-semibold">🔴 Failed</span>
                      )}
                    </td>
                    <td className="p-3">{item.JobCount || 0}</td>
                    <td className="p-3 flex gap-3">
                      <button
                        onClick={() => window.location.reload()}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        View Jobs
                      </button>
                      <button
                        onClick={() => handleDownload(item.PreferenceID)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
