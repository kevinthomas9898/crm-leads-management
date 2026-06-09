const express = require("express");

const router = express.Router();

const { getUsers, getUserById, createUser, updateUser, deleteUser } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { PERMISSIONS } = require("../config/permissions");

// All routes require authentication
router.use(protect);

// Routes with granular user permissions
router.get("/", authorize(PERMISSIONS.READ_USER), getUsers);
router.post("/", authorize(PERMISSIONS.CREATE_USER), createUser);
router.put("/:id", authorize(PERMISSIONS.UPDATE_USER), updateUser);
router.delete("/:id", authorize(PERMISSIONS.DELETE_USER), deleteUser);
router.get("/:id", authorize(PERMISSIONS.READ_USER), getUserById);

module.exports = router;
