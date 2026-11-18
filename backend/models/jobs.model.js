const sql = require("../config/db.config.js");

// Constructor
const Job = function(job) {
    this.company_id = job.company_id;
    this.title = job.title;
    this.description = job.description;
    this.requirements = job.requirements;
    this.location = job.location;
    this.salary_min = job.salary_min;
    this.salary_max = job.salary_max;
    this.job_type = job.job_type;
    this.posted_date = job.posted_date;
    this.expiry_date = job.expiry_date;
};
 
// CREATE JOB
Job.create = (newJob, result) => {
    sql.query("INSERT INTO jobs SET ?", newJob, (err, res) => {
        if (err) {
            console.log("❌ error: ", err);
            result(err, null);
            return;
        }
        result(null, { job_id: res.insertId, ...newJob });
    });
};

// GET ALL JOBS WITH PAGINATION
Job.getAll = (page = 1, limit = 10, result) => {
    const offset = (page - 1) * limit;

    // This new query JOINS the jobs and company tables to fetch the company name.
    const query = `
        SELECT 
            jobs.*, 
            company.name AS company_name 
        FROM 
            jobs 
        JOIN 
            company ON jobs.company_id = company.company_id
        ORDER BY 
            jobs.job_id DESC 
        LIMIT ?, ?
    `;
    
    sql.query(query, [offset, limit], (err, res) => {
        if (err) {
            console.log("❌ error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};

// GET JOB BY ID
Job.getById = (id, result) => {
    // This query is also updated to include the company name for a single job view.
    const query = `
        SELECT 
            jobs.*, 
            company.name AS company_name 
        FROM 
            jobs 
        JOIN 
            company ON jobs.company_id = company.company_id
        WHERE 
            jobs.job_id = ?
    `;

    sql.query(query, [id], (err, res) => {
        if (err) {
            console.log("❌ error: ", err);
            result(err, null);
            return;
        } 
        
        if (res.length) {
            result(null, res[0]);
            return;
        } 
        
        // Not found
        result({ kind: "not_found" }, null);
    });
};

// UPDATE JOB
Job.updateById = (id, job, result) => {
    sql.query(
        "UPDATE jobs SET company_id=?, title=?, description=?, requirements=?, location=?, salary_min=?, salary_max=?, job_type=?, posted_date=?, expiry_date=? WHERE job_id=? AND company_id=?",
        [
            job.company_id, 
            job.title, 
            job.description, 
            job.requirements, 
            job.location, 
            job.salary_min, 
            job.salary_max, 
            job.job_type, 
            job.posted_date, 
            job.expiry_date, 
            id, job.company_id
        ],
        (err, res) => {
            if (err) {
                console.log("❌ error: ", err);
                result(err, null);
                return;
            }
            
            if (res.affectedRows == 0) {
                result({ kind: "not_found" }, null);
                return;
            }

            result(null, { job_id: id, ...job });
        }
    );
};

// DELETE JOB
Job.remove = (id, companyId, result) => {
    sql.query("DELETE FROM jobs WHERE job_id = ? AND company_id = ?", [id,companyId], (err, res) => {
        if (err) {
            console.log("❌ error: ", err);
            result(err, null);
            return;
        }

        if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        }

        result(null, res);
    });
};

module.exports = Job;

