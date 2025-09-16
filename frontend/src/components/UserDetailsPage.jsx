import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserDetailsPage() {
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [skillsInput, setSkillsInput] = useState("");

  // Validation error states
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    age: "",
    domain: "",
    skills: "",
    resume: "",
  });

  const handleResumeChange = (e) => {
    if (e.target.files.length > 0) {
      setResume(e.target.files[0]);
      setErrors((prev) => ({ ...prev, resume: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = e.target.name.value.trim();
    const email = e.target.email.value.trim();
    const age = e.target.age.value.trim();
    const domain = e.target.domain.value.trim();
    const skill = e.target.skill.value.trim();

    const newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[A-Za-z\s]+$/;
    const ageNum = parseInt(age);

    if (!nameRegex.test(name)) {
      newErrors.name = "Only letters and spaces allowed.";
    }

    if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email format.";
    }

    if (isNaN(ageNum) || ageNum < 18 || ageNum > 99) {
      newErrors.age = "Age must be between 18 and 99.";
    }

    if (domain.length === 0) {
      newErrors.domain = "Domain is required.";
    }

    if (skill.length === 0 || !skill.includes(",")) {
      newErrors.skills = "Enter at least two comma-separated skills.";
    }

    if (!resume) {
      newErrors.resume = "Resume upload is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({ name: "", email: "", age: "", domain: "", skills: "", resume: "" });

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("age", age);
    formData.append("domain", domain);
    formData.append("skills", skill);
    formData.append("resume", resume);

    try {
      const res = await fetch("http://localhost:8080/api/user-details", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to submit user details");
      const data = await res.json();
      localStorage.setItem("userId", data.userId);
      navigate("/jobs");
    } catch (err) {
      console.error(err);
      alert("Network issue or submission failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-white p-4">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-lg p-10">
        <h2 className="text-3xl font-bold text-center text-teal-700 mb-8">
          Your Details
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 outline-none placeholder-gray-400"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 outline-none placeholder-gray-400"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Age */}
          <div>
            <input
              type="number"
              name="age"
              placeholder="Age"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 outline-none placeholder-gray-400"
            />
            {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
          </div>

          {/* Domain */}
          <div>
            <input
              type="text"
              name="domain"
              placeholder="Interested Domain"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 outline-none placeholder-gray-400"
            />
            {errors.domain && <p className="text-red-500 text-sm mt-1">{errors.domain}</p>}
          </div>

          {/* Skills Input */}
          <div>
            <input
              type="text"
              name="skill"
              value={skillsInput}
              onChange={(e) => {
                setSkillsInput(e.target.value);
                if (e.target.value.length > 0) {
                  setErrors((prev) => ({ ...prev, skills: "" }));
                }
              }}
              placeholder="Skills (comma separated, e.g. Java, Python, React)"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 outline-none placeholder-gray-400"
            />
            {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills}</p>}
          </div>

          {/* Resume Upload */}
          <div className="border-2 border-dashed border-teal-400 rounded-lg p-4 text-center cursor-pointer hover:bg-teal-50 transition relative">
            <label
              htmlFor="resumeInput"
              className="w-full h-full flex flex-col items-center justify-center text-teal-700 font-medium cursor-pointer"
            >
              {resume ? (
                <span>📄 {resume.name}</span>
              ) : (
                <span>Click to upload your resume (PDF)</span>
              )}
              <input
                id="resumeInput"
                type="file"
                accept=".pdf"
                onChange={handleResumeChange}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>
            {errors.resume && <p className="text-red-500 text-sm mt-2">{errors.resume}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 rounded-lg font-semibold shadow-md hover:from-teal-600 hover:to-blue-600 transition duration-300"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
