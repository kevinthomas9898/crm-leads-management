const Lead = require("../models/Lead");

const globalSearch = async (req, res) => {
  try {
    const query = req.query.query;

    // Prevent empty searches
    if (!query) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const results = await Lead.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
            { company: { $regex: query, $options: "i" } },
          ],
        },
      },

      {
        $limit: 10,
      },

      {
        $project: {
          name: 1,
          email: 1,
          company: 1,
          status: 1,
          owner: 1,
        },
      },
    ]);

    res.status(200).json(results);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  globalSearch,
};