//src/pages/ResetPassword.js

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_BASE_URL from "./setting";
import Footer from "../components/Footer";
import Header from "../components/Header";

// ✅ 1. Import the existing CSS file
import "./forgotpassword.css";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  React.useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, newPassword, resetToken: location.state?.resetToken }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        alert(data.message);
        navigate("/login");
      } else {
        alert(data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setLoading(false);
      alert("Something went wrong. Please try again.");
    }
  };

  if (!email) {
    return null; // Render nothing while redirecting
  }

  return (
    <>
      <Header />
      {/* ✅ 2. Add the same wrapper div for centering */}
      <div className="forgot-container-wrapper">
        <div className="forgot-container">
          <h2>Reset Password</h2>
          <form onSubmit={handleSubmit} className="forgot-form">
            <label>New Password</label>
            <input
              type="password"
              minLength={8} required placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ResetPassword;