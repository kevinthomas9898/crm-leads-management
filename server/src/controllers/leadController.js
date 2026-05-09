const Lead = require("../models/Lead");

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

module.exports = {
  getLeads,
};