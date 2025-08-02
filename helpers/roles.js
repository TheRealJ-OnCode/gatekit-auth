const Role = require("../models/Role");
const User = require("../models/User");
const { GatekitError } = require("../utils/ErrorHandler");

async function registerRole(name, permissions = []) {
  try {
    const existing = await Role.findOne({ name });
    if (existing) return existing;
    const newRole = await Role.create({ name, permissions });
    return newRole;
  } catch (error) {
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      throw new GatekitError("Role with this name already exists", 409);
    }
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      throw new GatekitError(`Validation error: ${messages.join(', ')}`, 400);
    }
    
    // Handle other database errors
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      throw new GatekitError(`Database error: ${error.message}`, 500);
    }
    
    throw new GatekitError(`Failed to register role: ${error.message}`, 500);
  }
}

async function deleteRole(name) {
  try {
    const role = await Role.findOne({ name });
    if (!role) {
      throw new GatekitError("Role not found", 404);
    }
    
    await User.updateMany(
      { roles: role._id },
      { $pull: { roles: role._id } }
    );
    await Role.deleteOne({ name });
    return { success: true, message: "Role deleted successfully" };
  } catch (error) {
    // If it's already a GatekitError, re-throw
    if (error instanceof GatekitError) {
      throw error;
    }
    
    // Handle other database errors
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      throw new GatekitError(`Database error: ${error.message}`, 500);
    }
    
    throw new GatekitError(`Failed to delete role: ${error.message}`, 500);
  }
}

async function assignRole(userId, roleName) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new GatekitError("User not found", 404);
    }
    
    const role = await Role.findOne({ name: roleName });
    if (!role) {
      throw new GatekitError("Role not found", 404);
    }
    
    if (user.roles.includes(role._id)) {
      return { success: false, message: "User already has this role" };
    }
    user.roles.push(role._id);
    await user.save();
    return { success: true, message: "Role assigned successfully" };
  } catch (error) {
    // If it's already a GatekitError, re-throw
    if (error instanceof GatekitError) {
      throw error;
    }
    
    // Handle cast errors (invalid ObjectId)
    if (error.name === 'CastError') {
      throw new GatekitError("Invalid user ID format", 400);
    }
    
    // Handle other database errors
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      throw new GatekitError(`Database error: ${error.message}`, 500);
    }
    
    throw new GatekitError(`Failed to assign role: ${error.message}`, 500);
  }
}

async function removeRole(userId, roleName) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new GatekitError("User not found", 404);
    }
    const role = await Role.findOne({ name: roleName });
    if (!role) {
      throw new GatekitError("Role not found", 404);
    }
    
    const roleIndex = user.roles.indexOf(role._id);
    if (roleIndex === -1) {
      return { success: false, message: "User does not have this role" };
    }
    user.roles.splice(roleIndex, 1);
    await user.save();
    return { success: true, message: "Role removed successfully" };
  } catch (error) {
    // If it's already a GatekitError, re-throw
    if (error instanceof GatekitError) {
      throw error;
    }
    
    // Handle cast errors (invalid ObjectId)
    if (error.name === 'CastError') {
      throw new GatekitError("Invalid user ID format", 400);
    }
    
    // Handle other database errors
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      throw new GatekitError(`Database error: ${error.message}`, 500);
    }
    
    throw new GatekitError(`Failed to remove role: ${error.message}`, 500);
  }
}

async function getUserRoles(userId) {
  try {
    const user = await User.findById(userId).populate('roles');
    if (!user) {
      throw new GatekitError("User not found", 404);
    }
    return user.roles;
  } catch (error) {
    // If it's already a GatekitError, re-throw
    if (error instanceof GatekitError) {
      throw error;
    }
    
    // Handle cast errors (invalid ObjectId)
    if (error.name === 'CastError') {
      throw new GatekitError("Invalid user ID format", 400);
    }
    
    // Handle other database errors
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      throw new GatekitError(`Database error: ${error.message}`, 500);
    }
    
    throw new GatekitError(`Failed to get user roles: ${error.message}`, 500);
  }
}

module.exports = {
  registerRole,
  deleteRole,
  assignRole,
  removeRole,
  getUserRoles
};