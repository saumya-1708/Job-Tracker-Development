import { useState, useEffect } from "react";

export default function JobPage() {
  const [jobs, setJobs] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate backend delay (2 seconds)
    setTimeout(() => {
      const sampleJobs = [
        {
          id: 1,
          title: "Frontend Developer",
          company: "TechNova Pvt Ltd",
          location: "Remote",
          type: "Full-Time",
          website: "https://www.technova.com",
        },
        {
          id: 2,
          title: "Backend Engineer",
          company: "CloudWorks",
          location: "Bengaluru, India",
          type: "Internship",
          website: "https://www.cloudworks.com",
        },
        {
          id: 3,
          title: "UI/UX Designer",
          company: "DesignHub",
          location: "Chennai, India",
          type: "Contract",
          website: "https://www.designhub.com",
        },
      ];

      setJobs(sampleJobs);
      setLoading(false);
    }, 2000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white p-8 relative">
      {/* Toasts */}
      <div className="fixed top-6 right-6 flex flex-col space-y-3 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="relative w-80 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold py-3 px-4 rounded-2xl shadow-lg flex items-center animate-slide-in backdrop-blur-sm"
          >
            <span className="flex-1">{toast.message}</span>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-white/30 rounded-b-2xl overflow-hidden">
              <div className="bg-white h-1 animate-progress rounded-b-2xl"></div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-3xl font-bold text-teal-700 mb-8 text-center">
        Available Jobs
      </h2>

      {loading ? (
        // Loading Spinner + Message
        <div className="flex flex-col justify-center items-center min-h-[50vh] space-y-4">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-teal-700 font-medium text-lg">
            Getting your job recommendations...
          </p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-6 rounded-2xl shadow-lg flex flex-col justify-between hover:shadow-2xl transition hover:scale-105 duration-300"
            >
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-teal-700 mb-1">
                  {job.title}
                </h3>
                <p className="text-gray-700 font-medium">{job.company}</p>
                <div className="flex items-center text-gray-500 mt-1 space-x-4 text-sm">
                  <span>📍 {job.location}</span>
                  <span>⏱ {job.type}</span>
                </div>
              </div>

              {/* Go to Job Website */}
              <a
                href={job.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto bg-gradient-to-r from-teal-500 to-blue-500 text-white py-2 rounded-lg font-semibold hover:from-teal-600 hover:to-blue-600 transition text-center"
              >
                Go to Job
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Tailwind custom animations */}
      <style>
        {`
          @keyframes slide-in {
            0% { transform: translateX(100%) scale(0.8); opacity: 0; }
            100% { transform: translateX(0) scale(1); opacity: 1; }
          }
          .animate-slide-in {
            animation: slide-in 0.5s ease-out forwards;
          }
          @keyframes progress {
            0% { width: 100%; }
            100% { width: 0%; }
          }
          .animate-progress {
            animation: progress 3s linear forwards;
          }
        `}
      </style>
    </div>
  );
}
