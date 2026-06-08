const express = require("express");

const router = express.Router();

const { getLeads, createLead, updateLead, deleteLead } = require("../controllers/leadController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

// GET is available to all authenticated users
router.get("/", getLeads);

// POST, PUT, DELETE require admin role
router.post("/", authorize("admin"), createLead);
router.put("/:id", authorize("admin"), updateLead);
router.delete("/:id", authorize("admin"), deleteLead);

module.exports = router;