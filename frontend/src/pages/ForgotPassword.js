// src/pages/ForgotPassword.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./setting";
import "./portal-forms.css";
import Footer from "../components/Footer";
import Header from "../components/Header";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      alert("Please enter your email");
      return;
    }

    setLoading(true);

    try { 
      console.log(email)
      const response = await fetch(`${API_BASE_URL}/users/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setLoading(false);
      console.log(response)
      if (response.ok) {
        alert(data.message);
        navigate("/otp", { state: { email } }); // pass email to OTP page
      } else {
        alert(data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setLoading(false);
      alert("Something went wrong. Please try again.");
    }
  };
 
  return (
    <>
      <Header />
      {/* ✅ ADD THIS WRAPPER DIV */}
      <div className="forgot-container-wrapper">
        <div className="forgot-container">
          <h2>Forgot Password</h2>
          <form onSubmit={handleSubmit} className="forgot-form">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ForgotPassword;
