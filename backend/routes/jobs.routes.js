// routes/jobs.routes.js
const express = require("express");
const router = express.Router();
const jobsController = require("../controllers/jobs.controller.js");

// ✅ FIX: Import the middleware from its new dedicated file.
const { isUserLoggedIn, isCompanyLoggedIn } = require("../middleware/auth.middleware.js");

// CREATE JOB
// Note: We might want to protect this with an isCompanyLoggedIn middleware later.
router.post("/", isCompanyLoggedIn, jobsController.create);

// GET ALL JOBS (Publicly accessible)
router.get("/", jobsController.findAll);

// GET JOB BY ID (Publicly accessible)
router.get("/:id", jobsController.findById);

// ✅ FIX: The route is now protected using the imported middleware.
// This is cleaner and more maintainable.
router.post("/:id/apply", isUserLoggedIn, jobsController.apply);

router.put('/:id', isCompanyLoggedIn, jobsController.update);
router.delete('/:id', isCompanyLoggedIn, jobsController.delete);

module.exports = router;
