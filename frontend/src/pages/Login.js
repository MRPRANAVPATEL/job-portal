// src/components/Login.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./setting";
import "./portal-forms.css";
import Footer from "../components/Footer";
import Header from "../components/Header";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
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
        `${API_BASE_URL}/users/login`,
        { email, password },
        { withCredentials: true }
      );

      // response shape can vary. try to extract token and user if provided.
      const resData = response?.data || {};
      const token = resData.token || resData.accessToken || "";
      // try common user fields (adjust to your backend)
      const userFromResp =
        resData.user || resData.data?.user || resData.data || null;

      // If backend didn't return a user object, store a minimal user marker so Header knows user is logged in
      const userToStore = userFromResp || { email };

      // Save session flag/info for Header to detect
      try {
        sessionStorage.setItem("user", JSON.stringify(userToStore));
      } catch (err) {
        // fallback: localStorage if sessionStorage blocked
        localStorage.setItem("user", JSON.stringify(userToStore));
      }

      // Save token if provided
      if (token) {
        localStorage.setItem("token", token);
      }

      // Inform header (same-tab)
      window.dispatchEvent(new Event("userLoggedIn"));

      // Trigger storage event to notify other tabs (cross-tab)
      try {
        localStorage.setItem("__auth_changed", Date.now().toString());
        localStorage.removeItem("__auth_changed");
      } catch (err) {
        /* ignore */
      }

      setMessage(resData.message || "Login successful!");

      // Redirect to home/dashboard
      navigate("/"); // SPA friendly
      // If you prefer full reload: window.location.href = "/";
    } catch (error) {
      console.error("Login error:", error);
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
    <Header/>
    <div className="login-wrapper">
      <div className="login-card">
        <h2>JobSphere Login</h2>
        {message && <p className="login-message">{message}</p>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
        <p>
          <a href="/forgot-password">Forgot password?</a>
        </p>

        <p className="login-footer">
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default Login;
