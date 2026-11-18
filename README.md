# JobSphere · Job Portal

A full-stack job portal built with React 18, JavaScript, Express and MySQL. Employers post openings and review applicants. Job seekers browse open roles, apply once per role and recover their accounts by email.

## Run the portal

1. Install Node.js 22 or 24 with npm. Start MySQL 8 or MariaDB on your computer.
2. Clone this repository and open a terminal in the project folder.
3. Copy `backend/.env.example` to `backend/.env`. Set `DB_USER` and `DB_PASSWORD` for your local database. Change the host or port if needed. Use an account allowed to create the `job_portal` database and its tables. Leave `SESSION_SECRET` blank on first setup to generate a private random value automatically.
4. From the project root, run:

   ```sh
   npm run setup
   npm start
   ```

5. Open **http://localhost:5001**. Express serves both the React site and its API. On later visits, start your database and run `npm start`.

Setup runs `npm ci` in both folders using their lockfiles, initializes the database, and builds React. Rerunning setup preserves existing tables and records. For frontend development, keep the API running and use `npm start --prefix frontend` in a second terminal. Open http://localhost:3000. The React development server forwards API requests to port 5001. After editing React, run `npm run build` to refresh the site served on port 5001.

## Try a complete hiring flow

- Choose **For employers**, register a company and sign in. Open **Post a job** and choose a posting window that includes today.
- Open a private browser window to keep a separate candidate session. Register a job seeker, sign in, browse jobs and apply.
- Refresh the company dashboard. The application appears with the candidate's name, email, job and submission date. Change its status to **Hired** to update the hiring count. Each employer sees their own records. A new database starts empty.

## Password reset email

The job seeker sign-in page includes **Forgot password?**. The server sends a six-digit code through Nodemailer using SMTP. Gmail requires a sending mailbox and an app password for this configuration. Put these values only in **backend/.env**:

```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=your-sending-mailbox@example.com
EMAIL_PASS=your-app-password
```

Restart the API after editing the file. A different authenticated SMTP provider can supply its own host, port, sender and password. Reset codes expire after ten minutes and allow five attempts. A verified code issues a single-use reset token. The rest of the portal runs with the email fields blank.

## Project folders

- `frontend/src` — React pages, forms, routing and dashboard.
- `backend` — Express API, database-backed sessions and email delivery.
- `backend/schema.sql` — tables for companies, users, jobs, applications and password recovery.

Installed modules, private environment files and generated builds are excluded from Git.
