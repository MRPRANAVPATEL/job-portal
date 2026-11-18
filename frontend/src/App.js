import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
// import Homepage from "./pages/Homepage";  // fixed name
import Landingpage from "./pages/Landingpage";
import CompanyRegi from "./pages/CompanyRegi";
import CompanyLogin from "./pages/CompanyLogin";
import Jobs from "./pages/Jobs";
import JobsRegister from "./pages/JobsRegister";
import ForgotPassword from "./pages/ForgotPassword";
import OtpPage from "./pages/OtpPage";
import ResetPassword from "./pages/ResetPassword";
import AdminCompany from './pages/AdminCompany'; // Make sure to import it

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<Homepage />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> 
        <Route path="/" element={<Landingpage />} />
        <Route path="/companyregister" element={<CompanyRegi />} />
        <Route path="/companylogin" element={<CompanyLogin />} />
        <Route path="/Jobs" element={<Jobs />} /> 
        <Route path="/Jobsregister" element={<JobsRegister />} /> 
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/company-dashboard" element={<AdminCompany />} />
        <Route path="*" element={<main><h1>Page not found</h1><a href="/">Return home</a></main>} />
        {/* <Route path="/reset-password" element={<ResetPassword />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
