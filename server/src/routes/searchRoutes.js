const express = require("express");

const router = express.Router();

const { globalSearch } = require("../controllers/searchController");

router.get("/global", globalSearch);

module.exports = router;