import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar"; // ✅ Import the new Navbar

export default function WelcomePage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    const username = localStorage.getItem("username");
    const accessToken = localStorage.getItem("access_token");

    if (!username || !accessToken) {
      alert("User not found. Please login again.");
      navigate("/login");
      return;
    }

    navigate("/preferences", { state: { username, accessToken } });
  };

  return (
    <div className="bg-gradient-to-b from-teal-50 to-white min-h-screen text-gray-800 flex flex-col">
      <Navbar /> {/* ✅ Reusable Navbar component */}

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
          onClick={handleGetStarted}
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
