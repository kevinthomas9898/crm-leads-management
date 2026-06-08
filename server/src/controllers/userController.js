const User = require("../models/User");
const Role = require("../models/Role");

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", sortBy = "name", sortOrder = "asc" } = req.query;

    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

    const users = await User.find(searchQuery)
      .populate("role")
      .select("-password")
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(searchQuery);

    res.status(200).json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.create({ name, email, password, role: role || "user" });
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, password, role },
      { new: true, runValidators: true }
    ).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };
