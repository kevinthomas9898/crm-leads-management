const Role = require("../models/Role");

const getRoles = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", sortBy = "name", sortOrder = "asc" } = req.query;

    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

    const roles = await Role.find(searchQuery)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Role.countDocuments(searchQuery);

    res.status(200).json({
      roles,
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

const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.status(200).json({ role });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const createRole = async (req, res) => {
  try {
    const { name, permissions, description } = req.body;
    const role = await Role.create({ name, permissions, description });
    res.status(201).json({ message: "Role created successfully", role });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const updateRole = async (req, res) => {
  try {
    const { name, permissions, description } = req.body;
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { name, permissions, description },
      { new: true, runValidators: true }
    );
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.status(200).json({ message: "Role updated successfully", role });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = { getRoles, getRoleById, createRole, updateRole, deleteRole };
