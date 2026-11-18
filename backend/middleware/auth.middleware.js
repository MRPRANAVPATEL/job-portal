// middleware/auth.middleware.js

// This middleware checks if a user (job seeker) is logged in.
exports.isUserLoggedIn = (req, res, next) => {
    if (req.session && req.session.user) {
        // If a user session exists, proceed to the next function (the controller).
        return next();
    }
    // If no user session is found, block the request with an error.
    res.status(401).json({ message: "You must be logged in as a job seeker to perform this action." });
};

// This middleware checks if a company is logged in.
exports.isCompanyLoggedIn = (req, res, next) => {
    if (req.session && req.session.company) {
        // If a company session exists, proceed.
        return next();
    }
    // If no company session is found, block the request.
    res.status(401).json({ message: "You must be logged in as a company to perform this action." });
};

