import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./setting";
import "./portal-forms.css";
import Footer from "../components/Footer";
import Header from "../components/Header";

  const CompanyLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/company/login`,
        { email, password },
        { withCredentials: true }
      );

      const resData = response?.data || {};
      const companyFromResp = resData.company || { email };

      sessionStorage.setItem("companyUser", JSON.stringify(companyFromResp));
      
      window.dispatchEvent(new Event("companyLoggedIn"));

      setMessage(resData.message || "Login successful! Redirecting...");
      
      // ✅ FIX: Changed the navigation path from "/" to "/company-dashboard"
      navigate("/company-dashboard");

    } catch (error) {
      console.error("Company login error:", error);
      setMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="company-login-wrapper">
        <div className="company-login-card">
          <h2>Company Login</h2>
          {message && <p className="company-login-message">{message}</p>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label style={{ color: "black" }}>Email</label>
              <input
                type="email"
                placeholder="Enter company email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label style={{ color: "black" }}>Password</label>
              <input
                type="password"
                placeholder="Enter company password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <span className="error">{errors.password}</span>
              )}
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="login-footer">
            Don’t have an account? <a href="/companyregister">Register here</a>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CompanyLogin;
