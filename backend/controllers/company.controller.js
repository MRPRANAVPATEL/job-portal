const Company = require("../models/company.model.js");
const bcrypt = require("bcrypt");
const db = require("../config/db.config.js");

// =======================
// REGISTER COMPANY (SECURED)
// =======================
exports.register = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Content cannot be empty!" });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const company = new Company({
            ...req.body,
            password: hashedPassword
        });

        Company.create(company, (err, data) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).send({ message: "A company with this email already exists." });
                }
                return res.status(500).send({ message: err.message || "Error registering company." });
            }
            res.status(201).send({ message: "Registration successful", companyId: data.company_id });
        });
    } catch (error) {
        res.status(500).send({ message: "Error hashing password." });
    }
};

// =======================
// LOGIN COMPANY (SECURED)
// =======================
exports.login = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send({ message: "Email and Password are required" });
    }

    Company.findByEmail(email, async (err, company) => {
        if (err) {
            if (err.kind === "not_found") {
                return res.status(401).send({ message: "Invalid Email or Password" });
            }
            return res.status(500).send({ message: "Error during login" });
        } 
        
        const validPassword = await bcrypt.compare(password, company.password);
        if (!validPassword) {
            return res.status(401).send({ message: "Invalid Email or Password" });
        }
        
        await new Promise((resolve, reject) => req.session.regenerate(err => err ? reject(err) : resolve()));
        req.session.company = { 
            company_id: company.company_id, 
            name: company.name, 
            email: company.email 
        };
        res.send({ message: "Login successful", company: req.session.company });
    });
};

// =======================
// GET MY JOBS
// =======================
exports.getMyJobs = (req, res) => {
    const companyId = req.session.company.company_id;

    db.query("SELECT * FROM jobs WHERE company_id = ? ORDER BY posted_date DESC", [companyId], (err, results) => {
        if (err) {
            console.error("Error fetching company jobs:", err);
            return res.status(500).json({ message: "Database error fetching jobs." });
        }
        res.json({ jobs: results });
    });
};

// =======================
// GET MY APPLICATIONS
// =======================
exports.getMyApplications = (req, res) => {
    const companyId = req.session.company.company_id;

    const query = `
        SELECT 
            app.application_id, 
            app.application_date, 
            app.status,
            app.job_id,
            usr.full_name, 
            usr.email,
            jb.title AS job_title
        FROM applications AS app
        JOIN users AS usr ON app.user_id = usr.user_id
        JOIN jobs AS jb ON app.job_id = jb.job_id
        WHERE jb.company_id = ?
        ORDER BY app.application_date DESC
    `;

    db.query(query, [companyId], (err, results) => {
        if (err) {
            // ✅ FIX: Log the actual database error to the console for easier debugging.
            console.error("Database query failed in getMyApplications:", err);
            return res.status(500).json({ message: "Database error fetching applications." });
        }
        res.json({ applications: results });
    });
};

// =======================
// GET ALL COMPANIES (with pagination)
// =======================
exports.findAll = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    Company.getAll(page, limit, (err, data) => {
        if (err) res.status(500).send({ message: err.message || "Error retrieving companies." });
        else res.send({ page, limit, companies: data });
    });
};

// =======================
// GET COMPANY BY ID
// =======================
exports.findById = (req, res) => {
    Company.getById(req.params.id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") res.status(404).send({ message: `Not found Company with id ${req.params.id}.` });
            else res.status(500).send({ message: "Error retrieving company with id " + req.params.id });
        } else res.send(data);
    });
};
 
// =======================
// UPDATE COMPANY
// =======================
exports.update = async (req, res) => {
    if (!req.body) return res.status(400).send({ message: "Content cannot be empty!" });
    if (!req.body.password) return res.status(400).json({message:"Password required."});
    const company = new Company({...req.body, password: await bcrypt.hash(req.body.password,10)});
    Company.updateById(req.params.id, company, (err, data) => {
        if (err) {
            if (err.kind === "not_found") res.status(404).send({ message: `Not found Company with id ${req.params.id}.` });
            else res.status(500).send({ message: "Error updating company with id " + req.params.id });
        } else {
            res.send({company_id:Number(req.params.id),message:"Company updated."});
        }
    });
};

// =======================
// DELETE COMPANY
// =======================
exports.delete = (req, res) => {
    Company.remove(req.params.id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({ message: `Not found Company with id ${req.params.id}.` });
            } else {
                res.status(500).send({ message: "Could not delete company with id " + req.params.id });
            }
        } else {
            res.send({ message: "Company was deleted successfully!" });
        }
    });
};

