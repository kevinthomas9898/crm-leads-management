const express = require("express");

const router = express.Router();

const { getLeads, createLead, updateLead, deleteLead } = require("../controllers/leadController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { PERMISSIONS } = require("../config/permissions");

// All routes require authentication
router.use(protect);

// GET is available to users with read_lead permission
router.get("/", authorize(PERMISSIONS.READ_LEAD), getLeads);

// POST, PUT, DELETE require specific permissions
router.post("/", authorize(PERMISSIONS.CREATE_LEAD), createLead);
router.put("/:id", authorize(PERMISSIONS.UPDATE_LEAD), updateLead);
router.delete("/:id", authorize(PERMISSIONS.DELETE_LEAD), deleteLead);

module.exports = router;