const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    company: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Lost"],
      default: "New",
    },

    owner: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
leadSchema.index({ status: 1 });
leadSchema.index({ owner: 1 });
leadSchema.index({ createdAt: -1 });

leadSchema.index({
  name: "text",
  email: "text",
  company: "text",
});

module.exports = mongoose.model("Lead", leadSchema);