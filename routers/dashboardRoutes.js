const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getDashboard } = require("../controllers/dashboardController");

router.get("/", protect, getDashboard); // GET /api/dashboard?month=5&year=2025

module.exports = router;
