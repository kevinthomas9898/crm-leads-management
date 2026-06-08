const express = require("express");

const router = express.Router();

const { getRoles, getRoleById, createRole, updateRole, deleteRole } = require("../controllers/roleController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

// Admin only routes
router.get("/", authorize("admin"), getRoles);
router.post("/", authorize("admin"), createRole);
router.put("/:id", authorize("admin"), updateRole);
router.delete("/:id", authorize("admin"), deleteRole);
router.get("/:id", authorize("admin"), getRoleById);

module.exports = router;
