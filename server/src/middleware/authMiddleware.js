const jwt = require("jsonwebtoken");

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

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authorized, no user found"
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Not authorized to access this resource"
      });
    }

    next();
  };
};

module.exports = { protect, authorize };