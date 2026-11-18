//src/pages/OtpPage.js

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_BASE_URL from "./setting";
import Footer from "../components/Footer";
import Header from "../components/Header";

// ✅ 1. Import the existing CSS file from the Forgot Password page
import "./forgotpassword.css";

const OtpPage = () => {
  const [otp, setOtp] =  useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  React.useEffect(() => { if (!email) navigate('/forgot-password'); }, [email, navigate]);
  if (!email) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      alert("Please enter OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        alert(data.message);
        navigate("/reset-password", { state: { email, resetToken: data.resetToken } });
      } else {
        alert(data.message || "OTP verification failed");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setLoading(false);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <Header />
      {/* ✅ 2. Add the same wrapper div for centering */}
      <div className="forgot-container-wrapper">
        <div className="forgot-container">
          <h2>Enter OTP</h2>
          <p style={{ marginTop: '-15px', marginBottom: '25px', color: '#666' }}>
            An OTP has been sent to {email}
          </p>
          <form onSubmit={handleSubmit} className="forgot-form">
            <label>OTP Code</label>
            <input
              type="text"
              placeholder="Enter the 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
              pattern="\d{6}"
              title="OTP must be 6 digits"
            />
            <button type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OtpPage;