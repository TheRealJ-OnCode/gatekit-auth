const Redis = require("ioredis");

let redisClient = null;
let redisAvailable = false;

const initRedis = async (config = {}) => {
  if (redisClient) return redisClient;

  const redisConfig = {
    host: config.host || process.env.REDIS_HOST || "localhost",
    port: config.port || process.env.REDIS_PORT || 6379,
    password: config.password || process.env.REDIS_PASSWORD || undefined,
    db: config.db || process.env.REDIS_DB || 0,
    lazyConnect: true,
    retryStrategy: (times) => {
      if (times > 3) return null; // Stop retrying after 3 attempts
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100
  };

  redisClient = new Redis(redisConfig);

  redisClient.on("connect", () => {
    console.log("Redis connected successfully");
    redisAvailable = true;
  });

  redisClient.on("error", (err) => {
    console.error("Redis connection error:", err.message);
    redisAvailable = false;
  });

  redisClient.on("close", () => {
    console.warn("Redis connection closed");
    redisAvailable = false;
  });

  try {
    await redisClient.connect();
    redisAvailable = true;
    return redisClient;
  } catch (error) {
    console.error("Failed to connect to Redis:", error.message);
    redisAvailable = false;
    redisClient = null;
    throw error;
  }
};

const getRedisClient = () => {
  return redisClient;
};

const isRedisAvailable = () => {
  return redisAvailable && redisClient && redisClient.status === 'ready';
};

const setRefreshToken = async (userId, refreshToken, expiresIn = 604800) => {
  if (!isRedisAvailable()) {
    console.warn("Redis not available, refresh token will not be stored");
    return;
  }
  try {
    const key = `refresh_token:${userId}`;
    await redisClient.setex(key, expiresIn, refreshToken);
  } catch (error) {
    console.error("Redis setRefreshToken error:", error.message);
  }
};

const getRefreshToken = async (userId) => {
  if (!isRedisAvailable()) {
    console.warn("Redis not available, cannot retrieve refresh token");
    return null;
  }
  try {
    const key = `refresh_token:${userId}`;
    return await redisClient.get(key);
  } catch (error) {
    console.error("Redis getRefreshToken error:", error.message);
    return null;
  }
};

const deleteRefreshToken = async (userId) => {
  if (!isRedisAvailable()) {
    console.warn("Redis not available, cannot delete refresh token");
    return;
  }
  try {
    const key = `refresh_token:${userId}`;
    await redisClient.del(key);
  } catch (error) {
    console.error("Redis deleteRefreshToken error:", error.message);
  }
};

const blacklistToken = async (token, expiresIn = 86400) => {
  if (!isRedisAvailable()) {
    console.warn("Redis not available, token cannot be blacklisted");
    return;
  }
  try {
    const key = `blacklist:${token}`;
    await redisClient.setex(key, expiresIn, "1");
  } catch (error) {
    console.error("Redis blacklistToken error:", error.message);
  }
};

const isTokenBlacklisted = async (token) => {
  if (!isRedisAvailable()) {
    console.warn("Redis not available, cannot check token blacklist");
    return false;
  }
  try {
    const key = `blacklist:${token}`;
    const result = await redisClient.get(key);
    return result === "1";
  } catch (error) {
    console.error("Redis isTokenBlacklisted error:", error.message);
    return false;
  }
};

const deleteUserSessions = async (userId) => {
  if (!isRedisAvailable()) {
    console.warn("Redis not available, cannot delete user sessions");
    return;
  }
  try {
    const refreshKey = `refresh_token:${userId}`;
    await redisClient.del(refreshKey);
  } catch (error) {
    console.error("Redis deleteUserSessions error:", error.message);
  }
};

module.exports = {
  initRedis,
  getRedisClient,
  isRedisAvailable,
  setRefreshToken,
  getRefreshToken,
  deleteRefreshToken,
  blacklistToken,
  isTokenBlacklisted,
  deleteUserSessions
};