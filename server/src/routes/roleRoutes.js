const express = require("express");

const router = express.Router();

const { getRoles, getRoleById, createRole, updateRole, deleteRole } = require("../controllers/roleController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { PERMISSIONS } = require("../config/permissions");

// All routes require authentication
router.use(protect);

// Routes with granular role permissions
router.get("/", authorize(PERMISSIONS.READ_ROLE), getRoles);
router.post("/", authorize(PERMISSIONS.CREATE_ROLE), createRole);
router.put("/:id", authorize(PERMISSIONS.UPDATE_ROLE), updateRole);
router.delete("/:id", authorize(PERMISSIONS.DELETE_ROLE), deleteRole);
router.get("/:id", authorize(PERMISSIONS.READ_ROLE), getRoleById);

module.exports = router;
