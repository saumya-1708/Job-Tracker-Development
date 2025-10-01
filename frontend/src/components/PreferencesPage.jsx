import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const handleRemoveRole = (role) => setSelectedRoles(selectedRoles.filter(r => r !== role));

  const handleSelectLocation = (e) => {
    const loc = e.target.value;
    if (loc && !selectedLocations.includes(loc)) setSelectedLocations([...selectedLocations, loc]);
  };
  const handleRemoveLocation = (loc) => setSelectedLocations(selectedLocations.filter(l => l !== loc));

  const validateForm = () => {
    const newErrors = {};
    if (selectedRoles.length === 0) newErrors.roles = "Please select at least one role.";
    if (selectedLocations.length === 0) newErrors.locations = "Please select at least one location.";
    if (experience === "" || experience < 0) newErrors.experience = "Please enter valid experience (>=0).";
    if (salary.length !== 2 || salary[0] > salary[1]) newErrors.salary = "Invalid salary range.";
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
      console.log("Submitting preferences:", userDetails);
      const res = await fetch("http://localhost:8080/preferences", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(userDetails),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Backend error:", errText);
        throw new Error("Failed to save user preferences");
      }

      navigate("/jobs");
    } catch (err) {
      console.error(err);
      alert("Network issue or submission failed");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 shadow-lg rounded-xl bg-white">
      <h2 className="text-2xl font-bold mb-6">Your Preferences</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Roles */}
        <div>
          <label className="block font-medium mb-2">Preferred Job Roles:</label>
          <select className="w-full border rounded-lg p-2" onChange={handleSelectRole} defaultValue="">
            <option value="" disabled>Choose a role</option>
            {jobRoles.map(role => <option key={role} value={role}>{role}</option>)}
          </select>
          {errors.roles && <p className="text-red-500 mt-1">{errors.roles}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedRoles.map(role => (
              <span key={role} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2">
                {role}
                <button type="button" className="text-red-500 font-bold" onClick={() => handleRemoveRole(role)}>✕</button>
              </span>
            ))}
          </div>
        </div>

        {/* Locations */}
        <div>
          <label className="block font-medium mb-2">Preferred Locations:</label>
          <select className="w-full border rounded-lg p-2" onChange={handleSelectLocation} defaultValue="">
            <option value="" disabled>Choose a location</option>
            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
          {errors.locations && <p className="text-red-500 mt-1">{errors.locations}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedLocations.map(loc => (
              <span key={loc} className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-2">
                {loc}
                <button type="button" className="text-red-500 font-bold" onClick={() => handleRemoveLocation(loc)}>✕</button>
              </span>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div>
          <label className="block font-medium mb-2">Experience (in years):</label>
          <input type="number" min="0" max="40" value={experience} onChange={e => setExperience(e.target.value)} className="w-full border rounded-lg p-2" placeholder="e.g. 2" />
          {errors.experience && <p className="text-red-500 mt-1">{errors.experience}</p>}
        </div>

        {/* Salary */}
        <div>
          <label className="block font-medium mb-2">Salary Expectation (in LPA):</label>
          <input type="range" min="1" max="50" value={salary[0]} onChange={e => setSalary([Math.min(+e.target.value, salary[1]), salary[1]])} className="w-full mb-2" />
          <p>Min: {salary[0]} LPA</p>
          <input type="range" min="1" max="50" value={salary[1]} onChange={e => setSalary([salary[0], Math.max(+e.target.value, salary[0])])} className="w-full" />
          <p className="mt-2">Selected Range: {salary[0]} LPA - {salary[1]} LPA</p>
        </div>

        <button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 rounded-lg font-semibold shadow-md hover:from-teal-600 hover:to-blue-600 transition duration-300">Submit</button>
      </form>
    </div>
  );
}
