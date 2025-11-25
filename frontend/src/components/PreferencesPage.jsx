import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

export default function PreferencesPage() {
  const navigate = useNavigate();

  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [experience, setExperience] = useState("");
  const [salary, setSalary] = useState([3, 10]);
  const [errors, setErrors] = useState({});

  const jobRoles = [
    "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
    "Data Scientist", "Machine Learning Engineer", "DevOps Engineer", "UI/UX Designer",
    "Product Manager", "QA Engineer", "Mobile App Developer", "Cloud Engineer",
    "Cybersecurity Specialist", "Business Analyst", "Database Administrator", "IT Support Specialist",
  ];

  const locations = ["Bangalore", "Chennai", "Hyderabad", "Pune", "Mumbai", "Delhi NCR", "Remote", "Kolkata"];

  const handleSelectRole = (e) => {
    const role = e.target.value;
    if (role && !selectedRoles.includes(role)) setSelectedRoles([...selectedRoles, role]);
  };

  const handleRemoveRole = (role) =>
    setSelectedRoles(selectedRoles.filter((r) => r !== role));

  const handleSelectLocation = (e) => {
    const loc = e.target.value;
    if (loc && !selectedLocations.includes(loc))
      setSelectedLocations([...selectedLocations, loc]);
  };

  const handleRemoveLocation = (loc) =>
    setSelectedLocations(selectedLocations.filter((l) => l !== loc));

  const validateForm = () => {
    const newErrors = {};
    if (selectedRoles.length === 0)
      newErrors.roles = "Please select at least one role.";
    if (selectedLocations.length === 0)
      newErrors.locations = "Please select at least one location.";
    if (experience === "" || experience < 0)
      newErrors.experience = "Please enter valid experience (≥0).";
    if (salary[0] > salary[1])
      newErrors.salary = "Invalid salary range.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      alert("Access token missing. Please login again.");
      navigate("/login");
      return;
    }

    const userDetails = {
      roles: selectedRoles,
      locations: selectedLocations,
      experience: Number(experience),
      salaryRange: salary,
    };

    try {
      fetch("http://localhost:8080/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(userDetails),
      });

      navigate("/jobs");
    } catch (err) {
      console.error(err);
      alert("Unexpected error occurred");
    }
  };

  return (
    <>
      <Navbar />

      {/* 🔥 Updated Gradient — matches CompanyLandingPage */}
      <div className="min-h-screen bg-gradient-to-br from-[#EEF3FF] via-[#F5F8FF] to-[#FFFFFF] flex flex-col items-center pt-24 px-4">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 border border-[#D6E4FF]"
        >
          <h2 className="text-3xl font-extrabold text-center text-[#2F3A4A] mb-2">
             Set Your Job Preferences
          </h2>

          <p className="text-gray-600 text-center mb-8">
            Let’s personalize your job search based on your interests and goals.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Roles */}
            <div>
              <label className="block text-[#2F3A4A] font-semibold mb-2">
                Preferred Job Roles
              </label>

              <select
                className="w-full border border-[#C8D9FB] rounded-xl p-3 focus:ring-2 focus:ring-[#4A90E2]/40 outline-none"
                onChange={handleSelectRole}
                defaultValue=""
              >
                <option value="" disabled>Choose a role</option>
                {jobRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              {errors.roles && <p className="text-red-500 mt-1">{errors.roles}</p>}

              <div className="mt-3 flex flex-wrap gap-2">
                {selectedRoles.map((role) => (
                  <motion.span
                    key={role}
                    whileHover={{ scale: 1.05 }}
                    className="bg-[#EDF2FF] text-[#2F3A4A] px-4 py-1 rounded-full flex items-center gap-2 shadow-sm border border-[#C7D6FF]"
                  >
                    {role}
                    <button
                      type="button"
                      className="text-red-500 font-bold"
                      onClick={() => handleRemoveRole(role)}
                    >
                      ✕
                    </button>
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div>
              <label className="block text-[#2F3A4A] font-semibold mb-2">
                Preferred Locations
              </label>

              <select
                className="w-full border border-[#C8D9FB] rounded-xl p-3 focus:ring-2 focus:ring-[#4A90E2]/40 outline-none"
                onChange={handleSelectLocation}
                defaultValue=""
              >
                <option value="" disabled>Choose a location</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>

              {errors.locations && <p className="text-red-500 mt-1">{errors.locations}</p>}

              <div className="mt-3 flex flex-wrap gap-2">
                {selectedLocations.map((loc) => (
                  <motion.span
                    key={loc}
                    whileHover={{ scale: 1.05 }}
                    className="bg-[#EEF4FF] text-[#2F3A4A] px-4 py-1 rounded-full flex items-center gap-2 shadow-sm border border-[#C7D6FF]"
                  >
                    {loc}
                    <button
                      type="button"
                      className="text-red-500 font-bold"
                      onClick={() => handleRemoveLocation(loc)}
                    >
                      ✕
                    </button>
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-[#2F3A4A] font-semibold mb-2">
                Experience (in years)
              </label>

              <input
                type="number"
                min="0"
                max="40"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full border border-[#C8D9FB] rounded-xl p-3 focus:ring-2 focus:ring-[#4A90E2]/40 outline-none"
                placeholder="e.g. 2"
              />

              {errors.experience && (
                <p className="text-red-500 mt-1">{errors.experience}</p>
              )}
            </div>

            {/* Salary Slider */}
            <div>
              <label className="block text-[#2F3A4A] font-semibold mb-2">
                Salary Expectation (in LPA)
              </label>

              <div className="bg-[#F8FAFF] p-4 rounded-xl border border-[#D6E4FF]">
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={salary[0]}
                  onChange={(e) =>
                    setSalary([Math.min(+e.target.value, salary[1]), salary[1]])
                  }
                  className="w-full accent-[#007BFF]"
                />
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={salary[1]}
                  onChange={(e) =>
                    setSalary([salary[0], Math.max(+e.target.value, salary[0])])
                  }
                  className="w-full accent-[#007BFF]"
                />

                <p className="mt-2 text-gray-700 text-center">
                  💰 Range:{" "}
                  <span className="font-semibold text-[#2F3A4A]">
                    {salary[0]} LPA - {salary[1]} LPA
                  </span>
                </p>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{
                scale: 1.05,
                background: "linear-gradient(90deg, #007BFF 0%, #00BFFF 100%)",
                color: "#fff",
                boxShadow: "0 4px 12px rgba(0, 191, 255, 0.4)",
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3 }}
              type="submit"
              className="w-full bg-[#2F3A4A] text-white py-3 rounded-xl font-semibold shadow-md"
            >
              Save Preferences
            </motion.button>

          </form>
        </motion.div>
      </div>
    </>
  );
}
