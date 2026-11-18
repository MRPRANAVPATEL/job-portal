const db = require("../config/db.config.js");

// Company constructor
const Company = function (company) {
    this.name = company.name;
    this.industry = company.industry;
    this.size = company.size;
    this.website = company.website;
    this.description = company.description;
    this.location = company.location;
    this.email = company.email;
    this.password = company.password;
};

// =======================
// CREATE COMPANY
// =======================
Company.create = (newCompany, result) => {
    db.query("INSERT INTO company SET ?", newCompany, (err, res) => {
        if (err) {
            result(err, null);
            return;
        }
        result(null, { company_id: res.insertId, ...newCompany });
    });
};

// =======================
// FIND COMPANY BY EMAIL (for secure login)
// =======================
Company.findByEmail = (email, result) => {
    db.query("SELECT * FROM company WHERE email = ?", [email], (err, res) => {
        if (err) {
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

// =======================
// GET ALL COMPANIES (with pagination)
// =======================
Company.getAll = (page = 1, limit = 10, result) => {
    const offset = (page - 1) * limit;
    db.query(
        "SELECT company_id,name,industry,size,website,description,location FROM company ORDER BY company_id ASC LIMIT ?, ?",
        [offset, parseInt(limit)],
        (err, res) => {
            if (err) {
                result(err, null);
                return;
            }
            result(null, res);
        }
    );
};

// =======================
// GET COMPANY BY ID
// =======================
Company.getById = (id, result) => {
    db.query("SELECT company_id,name,industry,size,website,description,location FROM company WHERE company_id = ?", [id], (err, res) => {
        if (err) {
            result(err, null);
            return;
        }
        if (res.length) {
            result(null, res[0]);
            return;
        }
        result({ kind: "not_found" }, null);
    });
};

// =======================
// UPDATE COMPANY BY ID
// =======================
Company.updateById = (id, company, result) => {
    db.query(
        "UPDATE company SET name=?, industry=?, size=?, website=?, description=?, location=?, email=?, password=? WHERE company_id=?",
        [
            company.name,
            company.industry,
            company.size,
            company.website,
            company.description,
            company.location,
            company.email,
            company.password,
            id
        ],
        (err, res) => {
            if (err) {
                result(err, null);
                return;
            }
            if (res.affectedRows === 0) {
                result({ kind: "not_found" }, null);
                return;
            }
            result(null, { company_id: id, ...company });
        }
    );
};
 
// =======================
// DELETE COMPANY
// =======================
Company.remove = (id, result) => {
    db.query("DELETE FROM company WHERE company_id = ?", [id], (err, res) => {
        if (err) {
            result(err, null);
            return;
        }
        if (res.affectedRows === 0) {
            result({ kind: "not_found" }, null);
            return;
        }
        result(null, res);
    });
};

module.exports = Company;
