const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Role = require("../models/Role");


// ==============================
// REGISTER USER
// ==============================
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

        // Get default role (user)
        const defaultRole = await Role.findOne({ name: "user" });

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: defaultRole ? defaultRole._id : null,
        });

        // Send response
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


// ==============================
// LOGIN USER
// ==============================
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user and populate role
        const user = await User.findOne({ email }).populate("role");

        if (!user) {
            return res.status(400).json({
                message: "Invalid credentials",
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials",
            });
        }

        // Get role permissions
        const permissions = user.role && typeof user.role === 'object' ? user.role.permissions : [];

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role && typeof user.role === 'object' ? user.role.name : user.role,
                permissions: permissions,
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "7d",
            }
        );

        // Send response
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