const { verifyAccessToken } = require("../services/token.service");
const { isTokenBlacklisted } = require("../services/redis.service");
const User = require("../models/User");
const ResponseHandler = require("../utils/ResponseHandler");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ResponseHandler.unauthorized(res, "No token provided");
    }
    const token = authHeader.split(" ")[1];
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return ResponseHandler.unauthorized(res, "Token has been revoked");
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select("-password").populate("roles");
    if (!user) {
      return ResponseHandler.unauthorized(res, "User not found");
    }
    if (user.isBanned) {
      return ResponseHandler.forbidden(res, "Your account has been banned");
    }

    req.user = user;
    req.userId = user._id;
    req.token = token;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    if (error.name === "JsonWebTokenError") {
      return ResponseHandler.unauthorized(res, "Invalid token");
    }
    if (error.name === "TokenExpiredError") {
      return ResponseHandler.unauthorized(res, "Token expired");
    }
    return ResponseHandler.serverError(res, "Authentication failed");
  }
};

const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return ResponseHandler.unauthorized(res, "Authentication required");
      }

      const userPermissions = [];
      
      if (req.user.roles && req.user.roles.length > 0) {
        req.user.roles.forEach(role => {
          if (role.permissions) {
            userPermissions.push(...role.permissions);
          }
        });
      }
      const hasWildcard = userPermissions.includes("*");
      const hasPermission = hasWildcard || userPermissions.includes(permission);

      if (!hasPermission) {
        return ResponseHandler.forbidden(res, `Permission '${permission}' required`);
      }

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return ResponseHandler.serverError(res, "Permission check failed");
    }
  };
};

const requireRole = (roleName) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return ResponseHandler.unauthorized(res, "Authentication required");
      }

      const hasRole = req.user.roles && req.user.roles.some(role => role.name === roleName);

      if (!hasRole) {
        return ResponseHandler.forbidden(res, `Role '${roleName}' required`);
      }
      next();
    } catch (error) {
      console.error("Role check error:", error);
      return ResponseHandler.serverError(res, "Role check failed");
    }
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];

    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return next();
    }

    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select("-password").populate("roles");
      
      if (user && !user.isBanned) {
        req.user = user;
        req.userId = user._id;
        req.token = token;
      }
    } catch (error) {
      console.log("Optional auth token invalid:", error.message);
    }

    next();
  } catch (error) {
    console.error("Optional auth error:", error);
    next();
  }
};

module.exports = {
  authenticate,
  requirePermission,
  requireRole,
  optionalAuth
};