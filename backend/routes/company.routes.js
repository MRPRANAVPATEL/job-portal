const express = require("express");
const router = express.Router();
const companyController = require("../controllers/company.controller.js");
const { isCompanyLoggedIn } = require("../middleware/auth.middleware.js");
 
// =======================
// Company Public Routes
// =======================
// Handles company registration
router.post("/register", companyController.register);

// Handles company login
router.post("/login", companyController.login);

// =======================
// Company Protected Routes (for Dashboard)
// =======================
router.patch('/applications/:id', isCompanyLoggedIn, async (req,res) => {
  const {status} = req.body;
  if (!['Applied','Screened','Interview','Offer','Hired','Rejected'].includes(status)) return res.status(400).json({message:'Invalid status.'});
  const db = require('../config/db.config').promise();
  const [result] = await db.execute('UPDATE applications a JOIN jobs j ON j.job_id=a.job_id SET a.status=? WHERE a.application_id=? AND j.company_id=?', [status,req.params.id,req.session.company.company_id]);
  if (!result.affectedRows) return res.status(404).json({message:'Application not found.'});
  res.json({status});
});
// Gets all jobs posted by the currently logged-in company
router.get("/my-jobs", isCompanyLoggedIn, companyController.getMyJobs);

// Gets all applications for jobs posted by the logged-in company
router.get("/my-applications", isCompanyLoggedIn, companyController.getMyApplications);

// =======================
// Other Company Routes
// =======================
// Get all companies with pagination
router.get("/", companyController.findAll);

// Get a single company by its ID
router.get("/:id", companyController.findById);

function ownsCompany(req,res,next) {
  if (Number(req.params.id) !== req.session.company.company_id) return res.sendStatus(403);
  next();
}
router.put('/:id', isCompanyLoggedIn, ownsCompany, companyController.update);
router.delete('/:id', isCompanyLoggedIn, ownsCompany, companyController.delete);

module.exports = router;
