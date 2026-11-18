// routes/users.routes.js
const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller.js");
const forgotController = require("../controllers/forgotPassword.controller.js"); // ✅ Forgot password controller

// =======================
// User Routes
// =======================
 
// ✅ Register
router.post("/register", usersController.register);

// ✅ Login
router.post("/login", usersController.login);

// ✅ Check login status
router.get("/check-login", (req, res) => {
  if (req.session && req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// ✅ Logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("jobsphere_session");
    res.json({ success: true, message: "Logged out successfully" });
  });
});

// ✅ Profile route
router.get("/profile", usersController.getProfile);

// ----------------------
// 🔹 Forgot Password Routes
// ----------------------

// Send OTP to email
// POST /api/v1/users/forgot-password
router.post("/forgot-password", forgotController.sendOtp);

// Verify OTP
// POST /api/v1/users/verify-otp
router.post("/verify-otp", forgotController.verifyOtp);

// Reset password after OTP verification
// POST /api/v1/users/reset-password
router.post("/reset-password", forgotController.resetPassword);

module.exports = router;
