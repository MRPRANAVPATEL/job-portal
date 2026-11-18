// controllers/jobs.controller.js
const Job = require("../models/jobs.model.js");
const db = require("../config/db.config.js"); // ✅ IMPORT: We need this for the new apply function.

// CREATE JOB
exports.create = (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Content cannot be empty!" });
    }

    const {title, description, location, salary_min, salary_max, posted_date, expiry_date} = req.body;
    if (!title?.trim() || !description?.trim() || !location?.trim() || !posted_date || !expiry_date ||
        posted_date > expiry_date || Number(salary_min) < 0 || Number(salary_max) < Number(salary_min)) {
        return res.status(400).json({message: 'Check the job details, salary range and dates.'});
    }
    const job = new Job({
        company_id: req.session.company.company_id,
        title: req.body.title,
        description: req.body.description,
        requirements: req.body.requirements,
        location: req.body.location,
        salary_min: req.body.salary_min,
        salary_max: req.body.salary_max,
        job_type: req.body.job_type,
        posted_date: req.body.posted_date,
        expiry_date: req.body.expiry_date
    });

    Job.create(job, (err, data) => {
        if (err) {
            res.status(500).send({ message: err.message || "Failed to create job." });
        } else {
            res.status(201).send({ message: "Job created successfully", job: data });
        }
    });
};
 
// GET ALL JOBS with pagination
exports.findAll = (req, res) => {
    const page = Math.max(1,parseInt(req.query.page) || 1);
    const limit = Math.max(1,Math.min(100,parseInt(req.query.limit) || 10));
    const userId = req.session.user?.id || 0;
    db.query(`SELECT j.*, c.name AS company_name, EXISTS(SELECT 1 FROM applications a
        WHERE a.job_id=j.job_id AND a.user_id=?) AS applied FROM jobs j
        JOIN company c ON c.company_id=j.company_id WHERE CURRENT_DATE BETWEEN j.posted_date AND j.expiry_date
        ORDER BY j.job_id DESC LIMIT ? OFFSET ?`, [userId,limit+1,(page-1)*limit], (err,rows) => {
        if (err) return res.status(500).json({message:'Could not fetch jobs.'});
        res.json({page,limit,hasMore:rows.length>limit,jobs:rows.slice(0,limit)});
    });
};

// GET JOB BY ID
exports.findById = (req, res) => {
    Job.getById(req.params.id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({ message: `Job not found with id ${req.params.id}` });
            } else {
                res.status(500).send({ message: "Error retrieving job with id " + req.params.id });
            }
        } else {
            res.send(data);
        }
    });
};

// ✅ NEW: APPLY FOR JOB Controller Function
exports.apply = (req, res) => {
    const jobId = req.params.id;
    // Get user ID from the session that our middleware verified
    const userId = req.session.user.id;

    if (!jobId || !userId) {
        return res.status(400).json({ message: "Missing job or user information." });
    }

    const query = "INSERT INTO applications (user_id, job_id) SELECT ?,job_id FROM jobs WHERE job_id=? AND CURRENT_DATE BETWEEN posted_date AND expiry_date";

    db.query(query, [userId, jobId], (err, result) => {
        if (err) {
            // Handle case where user has already applied for this job
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: "You have already applied for this job." });
            }
            console.error("Apply error:", err);
            return res.status(500).json({ message: "Database error during application." });
        }
        if (!result.affectedRows) return res.status(409).json({message:"This job is closed."});
        res.status(201).json({ success: true, message: "Application submitted successfully!" });
    });
};

// UPDATE JOB
exports.update = (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Content cannot be empty!" });
    }

    const job = new Job({...req.body, company_id:req.session.company.company_id});

    Job.updateById(req.params.id, job, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({ message: `Job not found with id ${req.params.id}` });
            } else {
                res.status(500).send({ message: "Error updating job with id " + req.params.id });
            }
        } else {
            res.send(data);
        }
    });
};

// DELETE JOB
exports.delete = (req, res) => {
    Job.remove(req.params.id, req.session.company.company_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({ message: `Job not found with id ${req.params.id}` });
            } else {
                res.status(500).send({ message: "Could not delete job with id " + req.params.id });
            }
        } else {
            res.send({ message: "Job deleted successfully!" });
        }
    });
};