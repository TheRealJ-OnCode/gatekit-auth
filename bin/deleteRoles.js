module.exports = async function (args) {
  const mongoose = require("mongoose");
  require("dotenv").config();
  const Role = require("../models/Role");
  const User = require("../models/User");

  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.error("MONGODB_URI not set in .env");
    process.exit(1);
  }

  await mongoose.connect(mongoURI);

  if (args[0] === "--name" && args[1]) {
    const name = args[1];
    const role = await Role.findOne({ name });
    if (!role) {
      console.log(`Role '${name}' not found`);
      process.exit(1);
    }
    await User.updateMany({}, { $pull: { roles: role._id } });
    await Role.deleteOne({ _id: role._id });
    console.log(`Role '${name}' deleted`);
    process.exit(0);
  }

  if (args[0] === "--all") {
    const allRoles = await Role.find({});
    await User.updateMany({}, { $set: { roles: [] } });
    const result = await Role.deleteMany({});
    console.log(`Cleared all roles (${result.deletedCount})`);
    process.exit(0);
  }

  console.log("❓ Usage:");
  console.log("   npx gatekit-auth roles:delete --name admin");
  console.log("   npx gatekit-auth roles:clear");
  process.exit(1);
};
