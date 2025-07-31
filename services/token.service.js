const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const generateTokens = (userId) => {
  const payload = {
    userId,
    type: "access"
  };
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET || "gatekit-access-secret-key",
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || "15m" }
  );
  const refreshPayload = {
    userId,
    type: "refresh",
    tokenId: crypto.randomBytes(16).toString("hex")
  };
  const refreshToken = jwt.sign(
    refreshPayload,
    process.env.JWT_REFRESH_SECRET || "gatekit-refresh-secret-key",
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d" }
  );
  return {
    accessToken,
    refreshToken
  };
};

const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || "gatekit-access-secret-key"
    );
    if (decoded.type !== "access") {
      throw new Error("Invalid token type");
    }
    return decoded;
  } catch (error) {
    throw error;
  }
};
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || "gatekit-refresh-secret-key"
    );
    if (decoded.type !== "refresh") {
      throw new Error("Invalid token type");
    }
    return decoded;
  } catch (error) {
    throw error;
  }
};

const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken
};