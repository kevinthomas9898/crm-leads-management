const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// DB Connection
const connectDB = require("./config/db");

// Routes
const leadRoutes = require("./routes/leadRoutes");
const searchRoutes = require("./routes/searchRoutes");

// Config
dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("API Running");
});

// API Routes
app.use("/api/leads", leadRoutes);

app.use("/api/search", searchRoutes);

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});