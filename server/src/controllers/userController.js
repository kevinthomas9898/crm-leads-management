const User = require("../models/User");
const Role = require("../models/Role");
const bcrypt = require("bcryptjs");

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

    // Look up the Role by name (default to "user" if not provided)
    const roleName = role || "user";
    const roleDoc = await Role.findOne({ name: roleName });
    
    if (!roleDoc) {
      return res.status(400).json({ message: `Role "${roleName}" not found` });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with role ObjectId and hashed password
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      role: roleDoc._id 
    });
    
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Build update object dynamically
    const updateData = { name, email };
    
    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    // Look up Role by name if provided
    if (role) {
      const roleDoc = await Role.findOne({ name: role });
      if (!roleDoc) {
        return res.status(400).json({ message: `Role "${role}" not found` });
      }
      updateData.role = roleDoc._id;
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
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
