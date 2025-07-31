const mongoose = require("mongoose");
const { initRedis } = require("../services/redis.service");

let initialized = false;

const initGatekit = async ({ mongoURI, useRedis = true }) => {
  if (initialized) return;
  
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
    initRedis();
  }
  
  initialized = true;
};

module.exports = { initGatekit };
