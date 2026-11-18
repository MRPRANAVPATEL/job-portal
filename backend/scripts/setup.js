const fs = require('node:fs');
const crypto = require('node:crypto');
const mysql = require('mysql2/promise');
if (!fs.existsSync('.env')) fs.copyFileSync('.env.example', '.env');
require('dotenv').config();
async function setup() {
  if (!process.env.SESSION_SECRET) {
    const current = fs.readFileSync('.env', 'utf8').replace(/^SESSION_SECRET=.*$/gm, '');
    fs.writeFileSync('.env', current.trimEnd() + '\nSESSION_SECRET=' + crypto.randomBytes(32).toString('hex') + '\n', { mode: 0o600 });
  }
  const name = process.env.DB_NAME || 'job_portal';
  const db = await mysql.createConnection({ host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD });
  try {
    await db.query('CREATE DATABASE IF NOT EXISTS ?? CHARACTER SET utf8mb4', [name]);
    await db.query('USE ??', [name]);
    for (const sql of fs.readFileSync('schema.sql','utf8').split(';').filter(s => s.trim())) await db.query(sql);
    console.log('JobPortal database is ready.');
  } finally { await db.end(); }
}
setup().catch(error => { console.error('Check backend/.env and your MySQL service:', error.message); process.exitCode = 1; });
