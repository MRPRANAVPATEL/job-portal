//db.cofig.js
const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "job_portal",
  port: process.env.DB_PORT || 3306,
  connectionLimit: 10,
});

db.getConnection((err, connection) => {
  if (err) console.error("❌ Database connection failed: ", err.message);
  else {
    console.log("✅ Database Connected!");
    connection.release();
  }
});

module.exports = db;


