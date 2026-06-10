# Backend Code Explained

This guide explains your actual backend code line by line.

## 1. Your Actual Backend Code Explained (Line by Line)

### app.js - The Main Server File

This is where your server starts. Let's go through it:

```javascript
// Lines 1-4: Import required packages
const express = require("express");      // Express framework
const cors = require("cors");            // Allow frontend to talk to backend
const dotenv = require("dotenv");        // Load environment variables from .env file
const rateLimit = require("express-rate-limit");  // Limit requests to prevent abuse

// Line 7: Import database connection function
const connectDB = require("./config/db");

// Lines 10-14: Import all route files
const leadRoutes = require("./routes/leadRoutes");
const searchRoutes = require("./routes/searchRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const roleRoutes = require("./routes/roleRoutes");

// Line 17: Load environment variables (like MONGO_URI, JWT_SECRET, PORT)
dotenv.config();

// Lines 20-27: Error handlers for crashes
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

// Line 30: Connect to MongoDB
connectDB();

// Line 32: Create Express app
const app = express();

// Lines 35-36: Setup middleware
app.use(cors());              // Allow frontend requests
app.use(express.json());      // Parse JSON from request body

// Lines 39-45: Rate limiter configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // Max 100 requests per 15 minutes per IP
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// Line 48: Apply rate limiting to all /api routes
app.use("/api", limiter);

// Lines 52-68: Setup routes
app.use("/api/auth", authRoutes);      // Login/register endpoints
app.use("/api/leads", leadRoutes);    // Lead CRUD endpoints
app.use("/api/search", searchRoutes);  // Search endpoints
app.use("/api/users", userRoutes);    // User management
app.use("/api/roles", roleRoutes);    // Role management

// Lines 55-57: Test route
app.get("/", (req, res) => {
  res.send("API Running");
});

// Lines 60-62: Health check (for deployment platforms like Render)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is healthy" });
});

// Line 71: Get port from environment or use 5000
const PORT = process.env.PORT || 5000;

// Lines 73-75: Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**What this file does:**
1. Imports all needed packages
2. Connects to database
3. Sets up middleware (security, JSON parsing)
4. Defines which route handles which URL
5. Starts the server on a port

---

### db.js - Database Connection

```javascript
// Line 1: Import Mongoose
const mongoose = require("mongoose");

// Line 3: Define async function to connect to DB
const connectDB = async () => {
  try {
    // Line 5: Connect to MongoDB using URI from .env file
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    // Lines 8-10: If connection fails, log error but don't crash
    console.log("MongoDB Connection Error:", error.message);
  }
};

// Line 14: Export function so other files can use it
module.exports = connectDB;
```

**What this file does:**
- Connects to MongoDB using the connection string from your .env file
- If connection fails, it logs the error but doesn't crash the server

---

### permissions.js - Permission Definitions

```javascript
// Lines 10-32: Define all permissions as constants
const PERMISSIONS = {
  CREATE_LEAD: "create_lead",      // Permission to create leads
  READ_LEAD: "read_lead",          // Permission to read leads
  UPDATE_LEAD: "update_lead",      // Permission to update leads
  DELETE_LEAD: "delete_lead",      // Permission to delete leads
  CREATE_USER: "create_user",      // Permission to create users
  READ_USER: "read_user",          // Permission to read users
  UPDATE_USER: "update_user",      // Permission to update users
  DELETE_USER: "delete_user",      // Permission to delete users
  CREATE_ROLE: "create_role",      // Permission to create roles
  READ_ROLE: "read_role",          // Permission to read roles
  UPDATE_ROLE: "update_role",      // Permission to update roles
  DELETE_ROLE: "delete_role",      // Permission to delete roles
  MANAGE_USERS: "manage_users",    // Super permission (grants all user permissions)
  MANAGE_ROLES: "manage_roles",    // Super permission (grants all role permissions)
};

// Lines 38-42: Group permissions together
const PERMISSION_GROUPS = {
  LEADS: [PERMISSIONS.CREATE_LEAD, PERMISSIONS.READ_LEAD, PERMISSIONS.UPDATE_LEAD, PERMISSIONS.DELETE_LEAD],
  USERS: [PERMISSIONS.CREATE_USER, PERMISSIONS.READ_USER, PERMISSIONS.UPDATE_USER, PERMISSIONS.DELETE_USER],
  ROLES: [PERMISSIONS.CREATE_ROLE, PERMISSIONS.READ_ROLE, PERMISSIONS.UPDATE_ROLE, PERMISSIONS.DELETE_ROLE],
};

// Lines 67-78: Function to expand super permissions
const expandPermissions = (permissions) => {
  const expanded = new Set(permissions);  // Create a Set from permissions

  // If user has MANAGE_USERS, add all individual user permissions
  if (expanded.has(PERMISSIONS.MANAGE_USERS)) {
    PERMISSION_GROUPS.USERS.forEach(perm => expanded.add(perm));
  }

  // If user has MANAGE_ROLES, add all individual role permissions
  if (expanded.has(PERMISSIONS.MANAGE_ROLES)) {
    PERMISSION_GROUPS.ROLES.forEach(perm => expanded.add(perm));
  }

  return Array.from(expanded);  // Convert back to array
};
```

**What this file does:**
- Defines all permission strings in one place (so you don't have typos)
- Groups related permissions together
- Has a function to expand "super permissions" into individual ones
  - Example: If someone has "manage_users", they automatically get create_user, read_user, update_user, delete_user

---

### authMiddleware.js - Authentication & Authorization

```javascript
// Lines 4-45: protect middleware - checks if user is logged in
const protect = (req, res, next) => {
  // Line 9-10: Get Authorization header from request
  const authHeader = req.headers.authorization;

  // Lines 12-24: Check if token exists and starts with "Bearer"
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    // Line 27-28: Extract token (remove "Bearer " prefix)
    const token = authHeader.split(" ")[1];

    // Lines 30-34: Verify token using JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Line 36: Attach user info to request object
    req.user = decoded;

    // Line 38: Continue to next middleware/route handler
    next();
  } catch (error) {
    // Lines 40-43: If token is invalid, send error
    res.status(401).json({ message: "Invalid token" });
  }
};

// Lines 47-69: authorize middleware - checks if user has permission
const authorize = (...permissions) => {
  return (req, res, next) => {
    // Lines 49-53: Check if user exists (should be set by protect middleware)
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, no user found" });
    }

    // Line 56: Expand user's permissions (convert super permissions to granular)
    const userPermissions = expandPermissions(req.user.permissions || []);

    // Line 59: Check if user has ALL required permissions
    const hasPermission = permissions.every(perm => userPermissions.includes(perm));

    // Lines 61-65: If user doesn't have permission, send 403 error
    if (!hasPermission) {
      return res.status(403).json({ message: "Not authorized to access this resource" });
    }

    // Line 67: Continue to next middleware/route handler
    next();
  };
};
```

**What this file does:**
- `protect`: Checks if user sent a valid JWT token. If yes, adds user info to request.
- `authorize`: Checks if user has specific permissions. Uses the expandPermissions function to handle super permissions.

---

### Lead.js - Mongoose Model (Database Schema)

```javascript
// Line 1: Import Mongoose
const mongoose = require("mongoose");

// Lines 3-34: Define schema for Lead documents
const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,        // Must be a string
      required: true,      // This field is required
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
      enum: ["New", "Contacted", "Qualified", "Lost"],  // Must be one of these values
      default: "New",                                   // Default value if not provided
    },
    owner: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,      // Automatically add createdAt and updatedAt fields
  }
);

// Lines 37-45: Create indexes for faster queries
leadSchema.index({ status: 1 });        // Index on status
leadSchema.index({ owner: 1 });         // Index on owner
leadSchema.index({ createdAt: -1 });    // Index on createdAt (descending)
leadSchema.index({
  name: "text",      // Text index for search
  email: "text",
  company: "text",
});

// Line 47: Create and export the model
module.exports = mongoose.model("Lead", leadSchema);
```

**What this file does:**
- Defines the structure of Lead documents in MongoDB
- Sets validation rules (required fields, allowed values)
- Creates indexes to make queries faster
- Exports a "Lead" model that you can use to create, read, update, delete leads

---

### leadController.js - Business Logic for Leads

```javascript
// Line 1: Import Lead model
const Lead = require("../models/Lead");

// Lines 6-81: getLeads function - get all leads with filtering/pagination
const getLeads = async (req, res) => {
  try {
    // Lines 9-17: Get query parameters from URL
    const page = parseInt(req.query.page) || 1;           // Page number (default 1)
    const limit = parseInt(req.query.limit) || 20;        // Items per page (default 20)
    const sortBy = req.query.sortBy || "createdAt";       // Sort field (default createdAt)
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;  // Sort direction
    const status = req.query.status;                      // Filter by status
    const owner = req.query.owner;                        // Filter by owner
    const search = req.query.search;                      // Search term

    // Line 20: Calculate how many documents to skip
    const skip = (page - 1) * limit;

    // Line 23: Build match stage for aggregation
    const matchStage = {};

    // Lines 26-32: Add filters if provided
    if (status) {
      matchStage.status = status;
    }
    if (owner) {
      matchStage.owner = owner;
    }

    // Lines 35-41: Add search filter (search in name, email, company)
    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: "i" } },      // Case-insensitive regex
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }

    // Lines 44-62: MongoDB aggregation pipeline
    const leads = await Lead.aggregate([
      { $match: matchStage },      // Filter documents
      { $sort: { [sortBy]: sortOrder } },  // Sort documents
      { $skip: skip },             // Skip documents for pagination
      { $limit: limit },           // Limit number of results
    ]);

    // Line 65: Count total documents matching filters
    const total = await Lead.countDocuments(matchStage);

    // Lines 67-73: Send response with data and pagination info
    res.status(200).json({
      data: leads,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    // Lines 75-79: Handle errors
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Lines 83-128: createLead function - create a new lead
const createLead = async (req, res) => {
  try {
    // Line 85: Get data from request body
    const { name, email, company, status, owner } = req.body;

    // Lines 88-92: Validate required fields
    if (!name || !email || !company || !owner) {
      return res.status(400).json({
        message: "Name, email, company, and owner are required",
      });
    }

    // Lines 95-99: Validate email format
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Lines 102-107: Check if lead with this email already exists
    const existingLead = await Lead.findOne({ email });
    if (existingLead) {
      return res.status(400).json({ message: "Lead with this email already exists" });
    }

    // Lines 110-116: Create new lead in database
    const lead = await Lead.create({
      name,
      email,
      company,
      status: status || "New",  // Default to "New" if not provided
      owner,
    });

    // Lines 118-121: Send response with created lead
    res.status(201).json({
      data: lead,
      message: "Lead created successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Lines 130-205: updateLead function - update an existing lead
const updateLead = async (req, res) => {
  try {
    // Line 132: Get lead ID from URL parameters
    const { id } = req.params;
    // Line 133: Get updated data from request body
    const { name, email, company, status, owner } = req.body;

    // Lines 136-141: Find lead by ID
    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Lines 144-180: Validate each field if provided
    if (name !== undefined && name === "") {
      return res.status(400).json({ message: "Name cannot be empty" });
    }
    if (email !== undefined) {
      if (email === "") {
        return res.status(400).json({ message: "Email cannot be empty" });
      }
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      // Check if email already exists for another lead
      const existingLead = await Lead.findOne({ email, _id: { $ne: id } });
      if (existingLead) {
        return res.status(400).json({ message: "Lead with this email already exists" });
      }
    }

    // Lines 183-193: Update lead (only update fields that are provided)
    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      {
        ...(name !== undefined && { name }),      // Only include if provided
        ...(email !== undefined && { email }),
        ...(company !== undefined && { company }),
        ...(status !== undefined && { status }),
        ...(owner !== undefined && { owner }),
      },
      { new: true, runValidators: true }  // Return updated doc, run validation
    );

    // Lines 195-198: Send response
    res.status(200).json({
      data: updatedLead,
      message: "Lead updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Lines 207-231: deleteLead function - delete a lead
const deleteLead = async (req, res) => {
  try {
    // Line 209: Get lead ID from URL
    const { id } = req.params;

    // Lines 212-217: Find lead
    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Line 220: Delete lead
    await Lead.findByIdAndDelete(id);

    // Lines 222-224: Send response
    res.status(200).json({ message: "Lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
```

**What this file does:**
- Contains functions that handle the business logic for leads
- `getLeads`: Gets leads with filtering, sorting, pagination
- `createLead`: Creates a new lead with validation
- `updateLead`: Updates an existing lead with validation
- `deleteLead`: Deletes a lead

---

### leadRoutes.js - Route Definitions

```javascript
// Line 1: Import Express
const express = require("express");

// Line 3: Create router
const router = express.Router();

// Line 5: Import controller functions
const { getLeads, createLead, updateLead, deleteLead } = require("../controllers/leadController");

// Line 6: Import middleware
const { protect, authorize } = require("../middleware/authMiddleware");

// Line 7: Import permissions
const { PERMISSIONS } = require("../config/permissions");

// Line 10: Apply protect middleware to ALL routes in this file
router.use(protect);

// Line 13: GET /api/leads - requires READ_LEAD permission
router.get("/", authorize(PERMISSIONS.READ_LEAD), getLeads);

// Line 16: POST /api/leads - requires CREATE_LEAD permission
router.post("/", authorize(PERMISSIONS.CREATE_LEAD), createLead);

// Line 17: PUT /api/leads/:id - requires UPDATE_LEAD permission
router.put("/:id", authorize(PERMISSIONS.UPDATE_LEAD), updateLead);

// Line 18: DELETE /api/leads/:id - requires DELETE_LEAD permission
router.delete("/:id", authorize(PERMISSIONS.DELETE_LEAD), deleteLead);
```

**What this file does:**
- Defines which URL maps to which controller function
- Applies middleware (protect, authorize) to routes
- The `:id` in the URL is a parameter that gets passed to the controller

**Example:**
- When frontend sends `GET /api/leads?page=1&limit=10`
  1. `protect` middleware runs first (checks JWT token)
  2. `authorize(PERMISSIONS.READ_LEAD)` runs next (checks if user has read_lead permission)
  3. If both pass, `getLeads` controller function runs
  4. Controller gets leads from database and sends response

---

### authController.js - Login & Register

```javascript
// Lines 1-2: Import packages
const bcrypt = require("bcryptjs");  // For password hashing
const jwt = require("jsonwebtoken");  // For creating JWT tokens

// Lines 4-5: Import models
const User = require("../models/User");
const Role = require("../models/Role");

// Lines 11-56: registerUser function
const registerUser = async (req, res) => {
  try {
    // Line 13: Get data from request body
    const { name, email, password } = req.body;

    // Lines 16-22: Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Line 25: Hash password (10 is the salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Lines 28-29: Get default role ("user")
    const defaultRole = await Role.findOne({ name: "user" });

    // Lines 31-36: Create user with hashed password
    const user = await User.create({
      name,
      email,
      password: hashedPassword,  // Store hashed password, not plain text
      role: defaultRole ? defaultRole._id : null,
    });

    // Lines 39-48: Send response (don't send password back)
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Lines 62-123: loginUser function
const loginUser = async (req, res) => {
  try {
    // Line 64: Get email and password from request body
    const { email, password } = req.body;

    // Line 67: Find user and populate role (get role details)
    const user = await User.findOne({ email }).populate("role");

    // Lines 69-73: Check if user exists
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Lines 76-79: Compare password with hashed password in database
    const isMatch = await bcrypt.compare(password, user.password);

    // Lines 81-85: If password doesn't match
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Line 88: Get permissions from user's role
    const permissions = user.role && typeof user.role === 'object' ? user.role.permissions : [];

    // Lines 91-103: Create JWT token with user info
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role && typeof user.role === 'object' ? user.role.name : user.role,
        permissions: permissions,  // Include permissions in token
      },
      process.env.JWT_SECRET,  // Secret key to sign token
      { expiresIn: "7d" }      // Token expires in 7 days
    );

    // Lines 106-115: Send token and user info
    res.json({
      token,  // Frontend will store this
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
```

**What this file does:**
- `registerUser`: Creates a new user, hashes their password, assigns default role
- `loginUser`: Verifies credentials, creates JWT token with user info and permissions

**Key points:**
- Passwords are never stored as plain text - always hashed with bcrypt
- JWT token contains user ID, role, and permissions
- Frontend stores the token and sends it with every request

---

### How All These Files Work Together

When you click "Login" in your frontend:

1. **Frontend** sends POST to `/api/auth/login` with email/password
2. **app.js** routes to `authRoutes`
3. **authRoutes** calls `loginUser` in `authController`
4. **authController**:
   - Finds user in database
   - Compares password using bcrypt
   - Creates JWT token with user info
   - Sends token back to frontend
5. **Frontend** stores token in localStorage

When you click "Get Leads" in your frontend:

1. **Frontend** sends GET to `/api/leads` with token in Authorization header
2. **app.js** routes to `leadRoutes`
3. **leadRoutes** runs `protect` middleware:
   - Extracts token from header
   - Verifies token with JWT
   - Adds user info to request
4. **leadRoutes** runs `authorize(PERMISSIONS.READ_LEAD)`:
   - Checks if user has read_lead permission
5. If authorized, calls `getLeads` in `leadController`
6. **leadController**:
   - Gets leads from MongoDB with filters/pagination
   - Sends leads back to frontend
7. **Frontend** displays the leads

---
