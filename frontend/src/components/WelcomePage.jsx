import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";

export default function WelcomePage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear authentication here if needed
    console.log("Logged out");
    navigate("/login");
  };

  return (
    <div className="bg-gradient-to-b from-teal-50 to-white min-h-screen text-gray-800 flex flex-col">
      <nav className="sticky top-0 z-50 bg-white bg-opacity-80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-teal-600">JobTracker</h1>

          {/* Profile + Logout buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/profile")}
              className="p-2 rounded-full hover:bg-teal-100 transition"
            >
              <User className="h-6 w-6 text-teal-700" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 bg-teal-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-teal-700 transition"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <section className="flex-1 flex flex-col justify-center items-center text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-extrabold text-teal-700 mb-6"
        >
          Land your dream Job
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-lg max-w-2xl text-gray-700 mb-8"
        >
          Manage applications, follow up with recruiters, and secure your dream job with JobTracker.
        </motion.p>
        <motion.button
          onClick={() => navigate("/user-details")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:from-teal-600 hover:to-blue-600 transition"
        >
          Get Started
        </motion.button>
      </section>
    </div>
  );
}
