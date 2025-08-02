const mongoose = require("mongoose");
const { initRedis } = require("../services/redis.service");
const { GatekitError } = require("../utils/ErrorHandler");

let initialized = false;

const initGatekit = async ({ mongoURI, redisConfig, useRedis = true }) => {
  if (initialized) return;
  
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(mongoURI);
    }
    
    if (!mongoose.models.User) {
      require("../models/User");
    }
    
    if (!mongoose.models.Role) {
      require("../models/Role");
    }
    
    if (useRedis) {
      // Initialize Redis asynchronously to avoid blocking startup
      try {
        await initRedis(redisConfig);
      } catch (redisError) {
        console.warn("Redis initialization failed:", redisError.message);
        console.warn("Continuing without Redis. Some features may be limited.");
      }
    }
    
    initialized = true;
  } catch (error) {
    throw new GatekitError(`Failed to initialize Gatekit: ${error.message}`, 500);
  }
};

module.exports = { initGatekit };
