// server.js
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const db = require("./config/db.config");

if (!process.env.SESSION_SECRET) throw new Error('Run npm run setup to generate backend/.env');
const path = require('node:path');
const app = express();
const PORT = process.env.PORT || 5001;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const sessionStore = new MySQLStore({}, db.promise ? db.promise() : db);

app.use(
  session({
    key: "jobsphere_session", // This is your cookie's name
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
);



const userRoutes = require("./routes/users.routes");
const jobRoutes = require("./routes/jobs.routes");
const companyRoutes = require("./routes/company.routes");


app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/company", companyRoutes);


app.get("/api/user", (req, res) => {
  if (req.session.user) {
    res.send(req.session.user);
  } else {
    res.status(401).send({ message: "Not logged in" });
  }
});

app.get("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send({ message: "Logout failed" });
    }
    // ✅ FIX: Changed "connect.sid" to "jobsphere_session" to match your session key.
    res.clearCookie("jobsphere_session");
    res.json({ success: true, message: "Logged out successfully" });
  });
});

app.get("/api/check-login", (req, res) => {
  try {
    if (req.session && (req.session.user || req.session.company)) {
      res.json({ loggedIn: true, user: req.session.user || req.session.company });
    } else {
      res.json({ loggedIn: false });
    }
  } catch (err) {
    console.error("Check login error:", err);
    res.status(500).json({ loggedIn: false, message: "Server error" });
  }
});

app.use('/api', (req, res) => res.status(404).json({message: 'API route not found'}));
const build = path.join(__dirname, '../frontend/build');
app.use(express.static(build));
app.get('/{*page}', (req, res) => res.sendFile(path.join(build, 'index.html')));
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});