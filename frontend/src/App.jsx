import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import WelcomePage from "./components/WelcomePage";
import JobPage from "./components/JobPage";
import UserDetailsPage from "./components/UserDetailsPage";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Login at root */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* Sign Up page */}
        <Route path="/signup" element={<SignUpPage />} />   
        {/* Welcome page after login */}
        <Route path="/welcome" element={<WelcomePage />} />  
        {/* Jobs page */}
        <Route path="/jobs" element={<JobPage />} />  
        {/* User Details page */}
        <Route path="/user-details" element={<UserDetailsPage />} /> 
      </Routes>
    </Router>
  );
}
