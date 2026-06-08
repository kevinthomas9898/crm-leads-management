const express = require("express");

const router = express.Router();

const { getUsers, getUserById, createUser, updateUser, deleteUser } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

// Admin only routes
router.get("/", authorize("admin"), getUsers);
router.post("/", authorize("admin"), createUser);
router.put("/:id", authorize("admin"), updateUser);
router.delete("/:id", authorize("admin"), deleteUser);
router.get("/:id", authorize("admin"), getUserById);

module.exports = router;
