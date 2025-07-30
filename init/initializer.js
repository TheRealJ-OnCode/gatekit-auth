const mongoose = require("mongoose");

let initialized = false;

const initGatekit = async ({ mongoURI }) => {
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
  initialized = true;
};

module.exports = { initGatekit };
