const Redis = require("ioredis");

let redisClient = null;

const initRedis = () => {
  if (redisClient) return redisClient;

  redisClient = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: process.env.REDIS_DB || 0,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    }
  });

  redisClient.on("connect", () => {
    console.log("Redis connected successfully");
  });

  redisClient.on("error", (err) => {
    console.error("Redis connection error:", err);
  });

  return redisClient;
};

const getRedisClient = () => {
  if (!redisClient) {
    return initRedis();
  }
  return redisClient;
};

const setRefreshToken = async (userId, refreshToken, expiresIn = 604800) => {
  const client = getRedisClient();
  const key = `refresh_token:${userId}`;
  await client.setex(key, expiresIn, refreshToken);
};

const getRefreshToken = async (userId) => {
  const client = getRedisClient();
  const key = `refresh_token:${userId}`;
  return await client.get(key);
};

const deleteRefreshToken = async (userId) => {
  const client = getRedisClient();
  const key = `refresh_token:${userId}`;
  await client.del(key);
};

const blacklistToken = async (token, expiresIn = 86400) => {
  const client = getRedisClient();
  const key = `blacklist:${token}`;
  await client.setex(key, expiresIn, "1");
};

const isTokenBlacklisted = async (token) => {
  const client = getRedisClient();
  const key = `blacklist:${token}`;
  const result = await client.get(key);
  return result === "1";
};

const deleteUserSessions = async (userId) => {
  const client = getRedisClient();
  const refreshKey = `refresh_token:${userId}`;
  await client.del(refreshKey);
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