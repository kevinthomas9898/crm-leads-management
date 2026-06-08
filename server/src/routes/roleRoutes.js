const express = require("express");

const router = express.Router();

const { getRoles, getRoleById, createRole, updateRole, deleteRole } = require("../controllers/roleController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

// Routes with manage_roles permission
router.get("/", authorize("manage_roles"), getRoles);
router.post("/", authorize("manage_roles"), createRole);
router.put("/:id", authorize("manage_roles"), updateRole);
router.delete("/:id", authorize("manage_roles"), deleteRole);
router.get("/:id", authorize("manage_roles"), getRoleById);

module.exports = router;
