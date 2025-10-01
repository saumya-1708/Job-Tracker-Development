import { useState, useEffect } from "react";

export default function JobPage({ preferenceId }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("User not logged in");

        const res = await fetch("http://localhost:8080/jobs-data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ preferenceId }),
        });

        if (!res.ok) throw new Error("Failed to fetch jobs");

        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.error(err);
        setToasts(prev => [...prev, { id: Date.now(), message: "Error fetching jobs. Try again!" }]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [preferenceId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white p-8 relative">
      {/* Toasts */}
      <div className="fixed top-6 right-6 flex flex-col space-y-3 z-50">
        {toasts.map(toast => (
          <div key={toast.id} className="bg-teal-500 text-white px-4 py-2 rounded-lg shadow-md">
            {toast.message}
          </div>
        ))}
      </div>

      <h2 className="text-3xl font-bold text-teal-700 mb-8 text-center">
        Available Jobs
      </h2>

      {loading ? (
        <div className="flex flex-col justify-center items-center min-h-[50vh] space-y-4">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-teal-700 font-medium text-lg">Getting your job recommendations...</p>
        </div>
      ) : jobs.length === 0 ? (
        <p className="text-center text-teal-700 font-medium text-lg">No jobs found for your preferences.</p>
      ) : (
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          {jobs.map((job, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg flex flex-col justify-between hover:shadow-2xl transition hover:scale-105 duration-300">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-teal-700 mb-1">{job.Title}</h3>
                <p className="text-gray-700 font-medium">{job.Company}</p>
                <div className="flex items-center text-gray-500 mt-1 space-x-4 text-sm">
                  <span>📍 {job.Location}</span>
                  <span>💼 {job.Type}</span>
                </div>
              </div>

              <a href={job.Website} target="_blank" rel="noopener noreferrer"
                 className="mt-auto bg-gradient-to-r from-teal-500 to-blue-500 text-white py-2 rounded-lg font-semibold hover:from-teal-600 hover:to-blue-600 transition text-center">
                Go to Job
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
