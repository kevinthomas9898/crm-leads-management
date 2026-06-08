const express = require("express");

const router = express.Router();

const { getUsers, getUserById, createUser, updateUser, deleteUser } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

// Routes with manage_users permission
router.get("/", authorize("manage_users"), getUsers);
router.post("/", authorize("manage_users"), createUser);
router.put("/:id", authorize("manage_users"), updateUser);
router.delete("/:id", authorize("manage_users"), deleteUser);
router.get("/:id", authorize("manage_users"), getUserById);

module.exports = router;
