const mongoose = require("mongoose");
const getModels = () => {
  if (!mongoose.models.User || !mongoose.models.Role) {
    throw new Error(
      "[Gatekit] Models are not initialized. Call initGatekit({ mongoURI }) before accessing models."
    );
  }
  return {
    User: mongoose.models.User,
    Role: mongoose.models.Role,
  };
};

module.exports = getModels;