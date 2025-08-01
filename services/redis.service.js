const Redis = require("ioredis");

let redisClient = null;

const initRedis = async (options = {}) => {
  if (redisClient) return redisClient;

  try {
    if (process.env.REDIS_URL) {
      redisClient = new Redis(process.env.REDIS_URL);
    } else {
      redisClient = new Redis({
        host: process.env.REDIS_HOST || options.host || "localhost",
        port: process.env.REDIS_PORT || options.port || 6379,
        password: process.env.REDIS_PASSWORD || options.password,
        db: process.env.REDIS_DB || options.db || 0,
        retryStrategy: options.retryStrategy || ((times) => Math.min(times * 50, 2000)),
      });
    }

    await redisClient.ping();
    console.log("Redis connection succesfull");
  } catch (err) {
    console.error("Redis connection error", err.message);
    if (redisClient) {
      redisClient.disconnect();
    }
    redisClient = null;
  }

  return redisClient;
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error("Redis client not initialized. Enable useRedis in initGatekit.");
  }
  return redisClient;
};

const setRefreshToken = async (userId, refreshToken, expiresIn = 604800) => {
  try {
    const client = getRedisClient();
    const key = `refresh_token:${userId}`;
    await client.setex(key, expiresIn, refreshToken);
  } catch (err) {
    console.warn("Redis is inactive. setRefreshToken was skipped:", err.message);
  }
};

const getRefreshToken = async (userId) => {
  try {
    const client = getRedisClient();
    const key = `refresh_token:${userId}`;
    return await client.get(key);
  } catch (err) {
    console.warn("Redis is inactive. getRefreshToken was skipped:", err.message);
    return null;
  }
};

const deleteRefreshToken = async (userId) => {
  try {
    const client = getRedisClient();
    const key = `refresh_token:${userId}`;
    await client.del(key);
  } catch (err) {
    console.warn("Redis is inactive. deleteRefreshToken was skipped:", err.message);
  }
};

const blacklistToken = async (token, expiresIn = 86400) => {
  try {
    const client = getRedisClient();
    const key = `blacklist:${token}`;
    await client.setex(key, expiresIn, "1");
  } catch (err) {
    console.warn("Redis is inactive. blacklistToken was skipped.:", err.message);
  }
};

const isTokenBlacklisted = async (token) => {
  try {
    const client = getRedisClient();
    const key = `blacklist:${token}`;
    const result = await client.get(key);
    return result === "1";
  } catch (err) {
    console.warn("Redis is inactive. isTokenBlacklisted was skipped:", err.message);
    return false;
  }
};

const deleteUserSessions = async (userId) => {
  try {
    const client = getRedisClient();
    const refreshKey = `refresh_token:${userId}`;
    await client.del(refreshKey);
  } catch (err) {
    console.warn("Redis is inactive. deleteUserSessions was skipped:", err.message);
  }
};

module.exports = {
  initRedis,
  getRedisClient,
  setRefreshToken,
  getRefreshToken,
  deleteRefreshToken,
  blacklistToken,
  isTokenBlacklisted,
  deleteUserSessions
};
