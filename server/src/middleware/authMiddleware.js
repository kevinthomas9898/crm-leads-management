const jwt = require("jsonwebtoken");
const { expandPermissions } = require("../config/permissions");

const protect = (
  req,
  res,
  next
) => {
  const authHeader =
    req.headers.authorization;

  if (
    !authHeader ||
    !authHeader.startsWith(
      "Bearer"
    )
  ) {
    return res
      .status(401)
      .json({
        message:
          "Not authorized",
      });
  }

  try {
    const token =
      authHeader.split(" ")[1];

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      message:
        "Invalid token",
    });
  }
};

const authorize = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authorized, no user found"
      });
    }

    // Expand user permissions (e.g., manage_users -> create_user, read_user, etc.)
    const userPermissions = expandPermissions(req.user.permissions || []);
    
    // Check if user has the required permissions
    const hasPermission = permissions.every(perm => userPermissions.includes(perm));

    if (!hasPermission) {
      return res.status(403).json({
        message: "Not authorized to access this resource"
      });
    }

    next();
  };
};

module.exports = { protect, authorize };