# CRM Leads Management Backend - Complete Guide

## Table of Contents
1. [Project Structure & Dependencies](#step-1-project-structure--dependencies)
2. [Database Configuration](#step-2-database-configuration)
3. [Data Models](#step-3-data-models)
4. [Authentication System](#step-4-authentication-system)
5. [Lead Management](#step-5-lead-management)
6. [Search Functionality](#step-6-search-functionality)
7. [Routing](#step-7-routing)
8. [Main Application Setup](#step-8-main-application-setup)

---

## Step 1: Project Structure & Dependencies

### Project Overview
This is a **CRM Leads Management Backend** built with Node.js, Express, and MongoDB.

### Folder Structure
```
server/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic
│   ├── middleware/      # Authentication middleware
│   ├── models/          # Database schemas
│   ├── routes/          # API routes
│   └── app.js          # Main application file
├── package.json        # Dependencies & scripts
└── package-lock.json
```

### Dependencies Explained

**Core Framework:**
- `express` (v5.2.1) - Web framework for building APIs
- `cors` (v2.8.6) - Enable Cross-Origin Resource Sharing

**Database:**
- `mongoose` (v9.6.2) - MongoDB ODM (Object Data Modeling)

**Authentication:**
- `bcryptjs` (v3.0.3) - Password hashing
- `jsonwebtoken` (v9.0.3) - JWT token generation & verification

**Security & Utilities:**
- `express-rate-limit` (v7.5.0) - Rate limiting to prevent API abuse
- `dotenv` (v17.4.2) - Load environment variables
- `@faker-js/faker` (v10.4.0) - Generate fake data for testing

**Development:**
- `nodemon` (v3.1.14) - Auto-restart server on file changes

### Scripts
- `npm run dev` - Start server with nodemon (development)
- `npm start` - Start server with node (production)

### package.json
```json
{
  "name": "server",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "nodemon src/app.js",
    "start": "node src/app.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "dependencies": {
    "@faker-js/faker": "^10.4.0",
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "express-rate-limit": "^7.5.0",
    "jsonwebtoken": "^9.0.3",
    "mongoose": "^9.6.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.14"
  }
}
```

---

## Step 2: Database Configuration

### File: `src/config/db.js`

```javascript
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### How It Works

**1. Import Mongoose**
- `mongoose` is the MongoDB ODM that helps interact with MongoDB using JavaScript objects

**2. Async Function `connectDB`**
- Uses `async/await` for handling asynchronous database connection
- `process.env.MONGO_URI` reads the MongoDB connection string from environment variables

**3. Error Handling**
- `try/catch` block catches connection errors
- `process.exit(1)` terminates the server if connection fails (1 = error code)

**4. Export**
- Exports the function so it can be called in `app.js`

### Environment Variable
You need a `.env` file in the root:
```
MONGO_URI=mongodb://localhost:27017/crm-leads
PORT=5000
JWT_SECRET=your-secret-key
```

---

## Step 3: Data Models

### User Model (`src/models/User.js`)

```javascript
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
```

### User Model Explained

**Fields:**
- `name` - User's full name (required)
- `email` - Unique email address (required, unique)
- `password` - Hashed password (required)
- `role` - User role: "admin" or "user" (defaults to "user")

**Options:**
- `timestamps: true` - Automatically adds `createdAt` and `updatedAt` fields

**Enum:**
- `role` uses enum to restrict values to only "admin" or "user"

---

### Lead Model (`src/models/Lead.js`)

```javascript
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
```

### Lead Model Explained

**Fields:**
- `name` - Lead's name (required)
- `email` - Lead's email (required)
- `company` - Lead's company name (required)
- `status` - Lead status: "New", "Contacted", "Qualified", "Lost" (defaults to "New")
- `owner` - Person who owns this lead (required)

**Indexes for Performance:**
- `status: 1` - Index on status for faster filtering
- `owner: 1` - Index on owner for faster filtering
- `createdAt: -1` - Index on creation time (descending) for sorting
- **Text Index** - Enables full-text search on name, email, and company fields

**Text Index Benefits:**
- Allows efficient text search across multiple fields
- Supports case-insensitive search
- Used by the search functionality

---

## Step 4: Authentication System

### Auth Controller (`src/controllers/authController.js`)

```javascript
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// REGISTER
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

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
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
```

### Register Function Explained

**1. Extract Data**
- Gets `name`, `email`, `password` from request body

**2. Check Existing User**
- `User.findOne({ email })` - Checks if email already exists
- Returns 400 error if user exists

**3. Hash Password**
- `bcrypt.hash(password, 10)` - Hashes password with salt rounds of 10
- Never store plain text passwords!

**4. Create User**
- `User.create()` - Creates new user with hashed password

**5. Response**
- Returns 201 (Created) status
- Returns user data (excluding password)

### Login Function Explained

**1. Extract Credentials**
- Gets `email`, `password` from request body

**2. Find User**
- `User.findOne({ email })` - Finds user by email
- Returns 400 if user not found

**3. Compare Password**
- `bcrypt.compare(password, user.password)` - Compares plain password with hashed password
- Returns 400 if passwords don't match

**4. Generate JWT Token**
- `jwt.sign()` - Creates signed token
- Payload contains user `id` and `role`
- `expiresIn: "7d"` - Token expires in 7 days
- `process.env.JWT_SECRET` - Secret key for signing

**5. Response**
- Returns token and user data

---

### Auth Middleware (`src/middleware/authMiddleware.js`)

```javascript
const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if token exists
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({
      message: "Not authorized",
    });
  }

  try {
    // Extract token from "Bearer <token>"
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = decoded;

    // Continue to next middleware/route
    next();
  } catch (error) {
    res.status(401).json({
      message: "Invalid token",
    });
  }
};

module.exports = protect;
```

### Auth Middleware Explained

**1. Check Authorization Header**
- Looks for `Authorization` header
- Must start with "Bearer"

**2. Extract Token**
- Splits header to get token: `"Bearer <token>"` → `<token>`

**3. Verify Token**
- `jwt.verify()` - Decodes and validates token
- Uses same secret key as when signed
- Throws error if token is invalid/expired

**4. Attach User to Request**
- `req.user = decoded` - Makes user data available in protected routes

**5. Continue**
- `next()` - Passes control to next middleware or route handler

---

## Step 5: Lead Management

### Lead Controller (`src/controllers/leadController.js`)

```javascript
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

    // Skip calculation for pagination
    const skip = (page - 1) * limit;

    // Match Stage for filtering
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

    // Total Count for pagination
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
```

### Get Leads Function Explained

**1. Query Parameters**
- `page` - Current page number (default: 1)
- `limit` - Items per page (default: 20)
- `sortBy` - Field to sort by (default: "createdAt")
- `sortOrder` - "asc" or "desc" (default: desc)
- `status` - Filter by lead status
- `owner` - Filter by owner
- `search` - Search term for name, email, company

**2. Pagination**
- `skip = (page - 1) * limit` - Calculates how many documents to skip
- Example: Page 2, limit 20 → skip = 20

**3. Filtering**
- `matchStage` - MongoDB query object
- Adds filters conditionally

**4. Search with Regex**
- `$regex` - Pattern matching
- `$options: "i"` - Case insensitive
- `$or` - Matches ANY of the conditions

**5. Aggregation Pipeline**
- `$match` - Filters documents
- `$sort` - Sorts documents
- `$skip` - Skips documents for pagination
- `$limit` - Limits results per page

**6. Total Count**
- `countDocuments()` - Gets total matching documents
- Used for pagination metadata

**7. Response**
- Returns paginated data with metadata

---

## Step 6: Search Functionality

### Search Controller (`src/controllers/searchController.js`)

```javascript
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
```

### Global Search Explained

**1. Extract Query**
- Gets search term from `req.query.query`

**2. Validation**
- Returns 400 if query is empty

**3. Aggregation Pipeline**
- `$match` - Searches across name, email, company using regex
- `$limit: 10` - Returns max 10 results
- `$project` - Selects only specific fields to return

**4. Regex Search**
- Case-insensitive search
- Partial matches allowed (e.g., "john" matches "Johnson")

---

## Step 7: Routing

### Auth Routes (`src/routes/authRoutes.js`)

```javascript
const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
```

### Lead Routes (`src/routes/leadRoutes.js`)

```javascript
const express = require("express");
const router = express.Router();
const { getLeads } = require("../controllers/leadController");

router.get("/", getLeads);

module.exports = router;
```

### Search Routes (`src/routes/searchRoutes.js`)

```javascript
const express = require("express");
const router = express.Router();
const { globalSearch } = require("../controllers/searchController");

router.get("/global", globalSearch);

module.exports = router;
```

### Routing Explained

**Express Router**
- Creates modular route handlers
- Can be mounted on specific paths in main app

**Route Structure**
- `router.METHOD(path, handler)`
- Methods: GET, POST, PUT, DELETE, etc.

**API Endpoints**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/leads` - Get leads with pagination/filters
- `GET /api/search/global` - Global search

---

## Step 8: Main Application Setup

### App File (`src/app.js`)

```javascript
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");

// DB Connection
const connectDB = require("./config/db");

// Routes
const leadRoutes = require("./routes/leadRoutes");
const searchRoutes = require("./routes/searchRoutes");
const authRoutes = require("./routes/authRoutes");

// Config
dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use("/api", limiter);

// Auth Routes
app.use("/api/auth", authRoutes);

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
```

### App.js Explained

**1. Imports**
- Express and middleware packages
- Database connection
- Route files

**2. Configuration**
- `dotenv.config()` - Loads environment variables from `.env`

**3. Database Connection**
- `connectDB()` - Connects to MongoDB on startup

**4. Middleware**
- `cors()` - Enables CORS for cross-origin requests
- `express.json()` - Parses JSON request bodies

**5. Rate Limiting**
- Limits requests to 100 per 15 minutes per IP
- Applied to all `/api` routes
- Prevents API abuse

**6. Route Mounting**
- `/api/auth` → auth routes
- `/api/leads` → lead routes
- `/api/search` → search routes

**7. Server Start**
- Listens on PORT from env or 5000
- Logs server start message

---

## Complete API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
  - Body: `{ name, email, password }`
  - Response: `{ message, user }`

- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
  - Response: `{ token, user }`

### Leads
- `GET /api/leads` - Get leads with pagination
  - Query: `?page=1&limit=20&status=New&owner=John&search=john&sortBy=createdAt&sortOrder=desc`
  - Response: `{ data, total, page, limit, totalPages }`

### Search
- `GET /api/search/global` - Global search
  - Query: `?query=john`
  - Response: Array of leads

---

## How to Run

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Create `.env` file**
   ```
   MONGO_URI=mongodb://localhost:27017/crm-leads
   PORT=5000
   JWT_SECRET=your-secret-key-here
   ```

3. **Start MongoDB**
   - Make sure MongoDB is running on localhost:27017

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Run Production Server**
   ```bash
   npm start
   ```

---

## Key Concepts Summary

### MongoDB & Mongoose
- **Schema** - Defines structure of documents
- **Model** - Interface to interact with database
- **Indexes** - Improve query performance
- **Aggregation** - Advanced data processing pipeline

### Authentication
- **bcrypt** - Hash passwords (never store plain text)
- **JWT** - Stateless authentication tokens
- **Middleware** - Protect routes by verifying tokens

### REST API Design
- **HTTP Methods** - GET (read), POST (create), PUT (update), DELETE (remove)
- **Status Codes** - 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 500 (Server Error)
- **Pagination** - Split large datasets into pages
- **Query Parameters** - Filter, sort, and search data

### Security
- **Rate Limiting** - Prevent API abuse
- **CORS** - Control cross-origin requests
- **Environment Variables** - Keep secrets secure

---

## Next Steps to Learn

1. Add CRUD operations for leads (create, update, delete)
2. Add role-based access control (admin vs user)
3. Add input validation (using Joi or express-validator)
4. Add error handling middleware
5. Add logging (using Winston or Morgan)
6. Add unit tests (using Jest)
7. Add API documentation (using Swagger)
8. Deploy to cloud (AWS, Heroku, etc.)

---

## Common Issues & Solutions

### MongoDB Connection Failed
- Check if MongoDB is running
- Verify MONGO_URI in .env file
- Check network/firewall settings

### JWT Token Invalid
- Verify JWT_SECRET matches between sign and verify
- Check token expiration (default: 7 days)
- Ensure token is sent in Authorization header: `Bearer <token>`

### Rate Limiting Issues
- Adjust windowMs and max values
- Use different limiters for different routes
- Whitelist trusted IPs if needed

### Pagination Not Working
- Ensure page and limit are integers
- Check skip calculation: `(page - 1) * limit`
- Verify total count matches expected

---

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT.io](https://jwt.io/)
- [bcryptjs](https://www.npmjs.com/package/bcryptjs)

---

**Happy Learning! 🚀**
