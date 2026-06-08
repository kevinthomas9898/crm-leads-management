const express = require("express");

const router = express.Router();

const { getLeads, createLead, updateLead, deleteLead } = require("../controllers/leadController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

// GET is available to users with read_lead permission
router.get("/", authorize("read_lead"), getLeads);

// POST, PUT, DELETE require specific permissions
router.post("/", authorize("create_lead"), createLead);
router.put("/:id", authorize("update_lead"), updateLead);
router.delete("/:id", authorize("delete_lead"), deleteLead);

module.exports = router;