const express = require("express");

const router = express.Router();

const { getLeads } = require("../controllers/leadController");

router.get("/", getLeads);

module.exports = router;