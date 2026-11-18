// controllers/users.controller.js
const db = require("../config/db.config.js");
const bcrypt = require("bcrypt");

// Register user
exports.register = async (req, res) => {
  // ✅ FIX: Destructure all fields sent from the frontend form.
  const { full_name, email, password, phone, role } = req.body;

  // ✅ FIX: Updated validation to check for all required fields.
  if (!full_name || !email || !password || !phone || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ FIX: Updated SQL query to insert all user details into the database.
    const query =
      "INSERT INTO users (full_name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)";
    db.query(
      query,
      [full_name, email, hashedPassword, phone, "jobseeker"],
      (err, result) => {
        if (err) {
          console.error("Register error:", err);
          // Handle potential duplicate email entry
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "Email already exists." });
          }
          return res.status(500).json({ message: "Database error" });
        }
        res.status(201).json({ success: true, message: "User registered successfully!" });
      }
    );
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login user
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error("Login error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ✅ FIX: Save user session with consistent field names (using user.full_name).
    // This ensures other parts of your app can access the user's name and role correctly.
    await new Promise((resolve, reject) => req.session.regenerate(err => err ? reject(err) : resolve()));
        req.session.user = {
      id: user.user_id, // Assuming primary key is user_id
      name: user.full_name,
      email: user.email,
      role: user.role,
    };

    res.json({
      success: true,
      message: "Login successful",
      user: req.session.user,
    });
  });
};

// (Optional) Can be used if you want to fetch user profile
exports.getProfile = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }
  res.json({ success: true, user: req.session.user });
};