import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import WelcomeImage from "../images/image.png";
import { motion } from "framer-motion";
import {
  ScanSearch,
  Target,
  Sliders,
  Rocket,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

export default function CompanyLandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    const username = localStorage.getItem("username");
    const accessToken = localStorage.getItem("access_token");

    if (!username || !accessToken) {
      navigate("/login");
      return;
    }
    navigate("/preferences", { state: { username, accessToken } });
  };

  return (
    <div className="bg-white text-[#1F2A44] flex flex-col min-h-screen font-sans scroll-smooth">
      {/* 🔹 Navbar */}
      <Navbar />

      {/* 🔹 Hero Section */}
      <section
        id="hero"
        className="flex flex-col md:flex-row items-center justify-between px-8 md:px-20 py-26 bg-gradient-to-br from-[#F3F7FF] via-[#EAF2FF] to-[#DDEBFF] overflow-hidden"
      >
        <div className="max-w-xl text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 mt-14 bg-gradient-to-r from-[#0066FF] to-[#00BFFF] bg-clip-text text-transparent">
            Land Your Dream Job with{" "}
            <span className="bg-[#0047AB] bg-clip-text text-transparent">
              JobTracker
            </span>
          </h1>

          <p className="text-lg text-[#2F3A4A] mb-8 leading-relaxed">
            Upload your resume, share your preferences, and let AI discover the
            roles that truly fit you. Smart insights, skill analysis, and career
            guidance — all in one elegant platform.
          </p>

          <motion.button
            whileHover={{
              scale: 1.05,
              background: "linear-gradient(90deg, #007BFF 0%, #00BFFF 100%)",
              color: "#fff",
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-[#1F2A44] text-white px-8 py-3 rounded-lg font-semibold shadow-md"
            onClick={handleGetStarted}
          >
            Get Started for Free
          </motion.button>
        </div>

        <div className="mt-10 md:mt-0 w-full md:w-1/2 flex justify-center">
          <img
            src={WelcomeImage}
            alt="JobTracker Illustration"
            className="rounded-3xl shadow-2xl w-full md:w-4/5 border border-[#A7C8F9] object-contain"
          />
        </div>
      </section>

      {/* 🔹 About Section */}
      <section
        id="about"
        className="py-20 px-8 md:px-20 bg-gradient-to-br from-white to-[#F2F7FF]"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-[#0066FF] to-[#00BFFF] bg-clip-text text-transparent">
            About JobTracker
          </h2>
          <p className="text-[#1F2A44] text-lg leading-relaxed">
            JobTracker captures your preferences, analyzes your skills, and
            intelligently recommends roles where you’ll excel. See your fit
            score, understand why, and get actionable career guidance.
          </p>
        </div>
      </section>
      {/* 🔹 How It Works Section — Flow Diagram Style */}
      <section
        id="how-it-works"
        className="py-10 bg-gradient-to-br from-[#E8F0FF] via-[#F4F8FF] to-[#DDEBFF] px-8 md:px-20 text-[#1F2A44]"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-[#0047AB] to-[#00BFFF] bg-clip-text text-transparent">
          How It Works
        </h2>

        {/* Steps Container */}
        <div className="relative flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20 max-w-6xl mx-auto">

          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 border-t-4 border-dashed border-[#A7C8F9] z-0"></div>

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center text-center bg-white rounded-2xl shadow-xl border border-[#C5DAFF] p-8 w-72 hover:shadow-2xl transition">
            <div className="bg-gradient-to-br from-[#0047AB] to-[#00BFFF] text-white w-14 h-14 flex items-center justify-center rounded-full mb-4 text-2xl font-bold">
              1
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#0047AB]">Login / Sign Up</h3>
            <p className="text-sm text-[#2F3A4A]">
              Create your secure JobTracker account to get started instantly.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center text-center bg-white rounded-2xl shadow-xl border border-[#C5DAFF] p-8 w-72 hover:shadow-2xl transition">
            <div className="bg-gradient-to-br from-[#0047AB] to-[#00BFFF] text-white w-14 h-14 flex items-center justify-center rounded-full mb-4 text-2xl font-bold">
              2
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#0047AB]">Upload Resume</h3>
            <p className="text-sm text-[#2F3A4A]">
              Our AI extracts your skills and builds a professional job profile.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center text-center bg-white rounded-2xl shadow-xl border border-[#C5DAFF] p-8 w-72 hover:shadow-2xl transition">
            <div className="bg-gradient-to-br from-[#0047AB] to-[#00BFFF] text-white w-14 h-14 flex items-center justify-center rounded-full mb-4 text-2xl font-bold">
              3
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#0047AB]">Set Preferences</h3>
            <p className="text-sm text-[#2F3A4A]">
              Choose your desired roles, industries, and locations for accurate matching.
            </p>
          </div>

          {/* Step 4 */}
          <div className="relative z-10 flex flex-col items-center text-center bg-white rounded-2xl shadow-xl border border-[#C5DAFF] p-8 w-72 hover:shadow-2xl transition">
            <div className="bg-gradient-to-br from-[#0047AB] to-[#00BFFF] text-white w-14 h-14 flex items-center justify-center rounded-full mb-4 text-2xl font-bold">
              4
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#0047AB]">Get Results</h3>
            <p className="text-sm text-[#2F3A4A]">
              View job matches, track progress, and get personalized improvement tips.
            </p>
          </div>
        </div>
      </section>

      {/* 🔹 Features Section */}
      <section
        id="features"
        className="py-10 bg-gradient-to-b from-[#F8FBFF] to-white px-6 md:px-20"
      >
        <h2 className="text-3xl md:text-4xl pb-1 font-bold text-center mb-14 bg-gradient-to-r from-[#0047AB] to-[#00BFFF] bg-clip-text text-transparent">
          Why JobTracker Stands Out
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            {
              icon: <ScanSearch size={36} className="text-[#1E90FF]" />,
              title: "Smart Resume Analysis",
              desc: "Our system scans your resume to understand your skills, experience, and preferences instantly.",
            },
            {
              icon: <Target size={36} className="text-[#FF4C4C]" />,
              title: "AI Job Matching",
              desc: "Find jobs that align perfectly with your resume data and role preferences — no irrelevant results.",
            },
            {
              icon: <Sliders size={36} className="text-[#6B7280]" />,
              title: "Preference-Based Filtering",
              desc: "Choose your desired roles, locations, or experience levels — get matches that truly fit you.",
            },
            {
              icon: <Rocket size={36} className="text-[#F97316]" />,
              title: "One-Click Job Discovery",
              desc: "Skip searching manually — view all jobs curated for your exact profile in one place.",
            },
            {
              icon: <RefreshCw size={36} className="text-[#6F42C1]" />,
              title: "Continuous Refinement",
              desc: "Your matches improve over time as you refine your preferences and upload new resumes.",
            },
            {
              icon: <ShieldCheck size={36} className="text-[#16A34A]" />,
              title: "Secure & Seamless Experience",
              desc: "Your data remains fully encrypted and protected while delivering a fast, reliable, and user-friendly platform across all devices.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group p-5 bg-white rounded-2xl shadow-lg border border-[#E1EFFF]
                        hover:-translate-y-2 hover:bg-[#E8F1FF] hover:shadow-2xl transition-all duration-300"
            >
              <div className="mb-4 flex justify-center">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3 text-[#1F2A44] group-hover:text-[#0047AB] transition-colors text-center">
                {feature.title}
              </h3>
              <p className="text-[#2F3A4A] leading-relaxed text-center">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 🔹 Contact Section */}
      <section
        id="contact"
        className="py-10 bg-gradient-to-br from-[#E8F0FF] via-[#D6E6FF] to-[#B3D4FF] px-8 md:px-20 text-[#1F2A44]"
      >
        <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-[#0047AB] to-[#00BFFF] bg-clip-text text-transparent">
          Contact Us
        </h2>

        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-10 border border-[#D0E2FF]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Message sent! We'll get back to you soon.");
            }}
          >
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <input
                type="text"
                placeholder="Your Name"
                required
                className="border border-[#B3D4FF] p-3 rounded-lg w-full focus:ring-2 focus:ring-[#0066FF] outline-none"
              />
              <input
                type="email"
                placeholder="Your Email"
                required
                className="border border-[#B3D4FF] p-3 rounded-lg w-full focus:ring-2 focus:ring-[#0066FF] outline-none"
              />
            </div>
            <textarea
              placeholder="Your Message"
              rows="5"
              required
              className="border border-[#B3D4FF] p-3 rounded-lg w-full focus:ring-2 focus:ring-[#0066FF] outline-none mb-6"
            ></textarea>
            <motion.button
              type="submit"
              whileHover={{
                scale: 1.05,
                background: "linear-gradient(90deg, #007BFF 0%, #00BFFF 100%)",
                color: "#fff",
                boxShadow: "0px 4px 15px rgba(0, 191, 255, 0.5)",
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-[#1F2A44] text-white px-8 py-3 rounded-full font-semibold transition w-full"
            >
              Send Message
            </motion.button>
          </form>
        </div>

        <div className="text-center mt-12 text-[#1F2A44]">
          <p>
            Email:{" "}
            <span className="bg-gradient-to-r from-[#0047AB] to-[#00BFFF] bg-clip-text text-transparent">
              support@jobtracker.com
            </span>
          </p>
          <p>Phone: +91 98765 43210</p>
          <p>Bengaluru, India</p>
        </div>
      </section>
      {/* 🔹 Footer */}
      <footer className="bg-[#1F2A44] text-white py-8 text-center">
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-4">
          {["Home", "About", "Features", "Contact"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="hover:text-[#00BFFF] transition"
            >
              {item}
            </a>
          ))}
        </div>
        <p className="text-sm text-[#A7C8F9]">
          &copy; {new Date().getFullYear()} JobTracker Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
