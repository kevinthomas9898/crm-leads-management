const Lead = require("../models/Lead");

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getLeads = async (req, res) => {
  try {
    // Query Params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const status = req.query.status;
    const owner = req.query.owner;
    const search = req.query.search;

    // Skip
    const skip = (page - 1) * limit;

    // Match Stage
    const matchStage = {};

    // Filters
    if (status) {
      matchStage.status = status;
    }

    if (owner) {
      matchStage.owner = owner;
    }

    // Search
    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }

    // Aggregation Pipeline
    const leads = await Lead.aggregate([
      {
        $match: matchStage,
      },

      {
        $sort: {
          [sortBy]: sortOrder,
        },
      },

      {
        $skip: skip,
      },

      {
        $limit: limit,
      },
    ]);

    // Total Count
    const total = await Lead.countDocuments(matchStage);

    res.status(200).json({
      data: leads,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const createLead = async (req, res) => {
  try {
    const { name, email, company, status, owner } = req.body;

    // Validation
    if (!name || !email || !company || !owner) {
      return res.status(400).json({
        message: "Name, email, company, and owner are required",
      });
    }

    // Email validation
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Check if email already exists
    const existingLead = await Lead.findOne({ email });
    if (existingLead) {
      return res.status(400).json({
        message: "Lead with this email already exists",
      });
    }

    // Create lead
    const lead = await Lead.create({
      name,
      email,
      company,
      status: status || "New",
      owner,
    });

    res.status(201).json({
      data: lead,
      message: "Lead created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, company, status, owner } = req.body;

    // Find lead
    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    // Validation for required fields if provided
    if (name !== undefined && name === "") {
      return res.status(400).json({
        message: "Name cannot be empty",
      });
    }

    if (email !== undefined) {
      if (email === "") {
        return res.status(400).json({
          message: "Email cannot be empty",
        });
      }
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: "Invalid email format",
        });
      }
      // Check if email already exists for another lead
      const existingLead = await Lead.findOne({ email, _id: { $ne: id } });
      if (existingLead) {
        return res.status(400).json({
          message: "Lead with this email already exists",
        });
      }
    }

    if (company !== undefined && company === "") {
      return res.status(400).json({
        message: "Company cannot be empty",
      });
    }

    if (owner !== undefined && owner === "") {
      return res.status(400).json({
        message: "Owner cannot be empty",
      });
    }

    // Update lead
    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(company !== undefined && { company }),
        ...(status !== undefined && { status }),
        ...(owner !== undefined && { owner }),
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      data: updatedLead,
      message: "Lead updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    // Find lead
    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    // Delete lead
    await Lead.findByIdAndDelete(id);

    res.status(200).json({
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
};