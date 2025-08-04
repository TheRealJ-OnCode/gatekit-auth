# Gatekit-Auth Module Integration Guide

This guide explains how to set up a backend authentication system for a website using the **gatekit-auth** module.

## 📦 About the Module

**gatekit-auth** (v1.2.0) - A comprehensive authentication and authorization system with role-based access control, developed by Jamil Aghazada & Murad Eyvazli.

### 🔧 Technologies

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Cache/Session**: Redis (IORedis)
- **Security**: JWT (jsonwebtoken), bcryptjs
- **CORS**: Cross-domain support with Cors middleware

---

## 🚀 Quick Start

### 1. Project Setup

```bash
# Create new project
mkdir my-auth-project
cd my-auth-project

# Install gatekit-auth module
npm install gatekit-auth

# Install required dependencies (if not present)
npm install express mongoose ioredis dotenv cors
```
### 2. Basic Server Setup

```javascript
// server.js
const express = require("express");
require("dotenv").config();

const { authRouter, initGatekit } = require("gatekit-auth");

const app = express();
const PORT = process.env.PORT || 3000;

(async () => {
  app.use(express.json());

  await initGatekit({
    mongoURI: process.env.MONGODB_URI,
    useRedis: true,
    redisOptions: {
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
    }, 
  });

  app.use("/auth", authRouter);
   // Protected route example
  app.get("/profile", middleware.authenticate, (req, res) => {
    res.json({
      message: "Profile information",
      user: req.user,
    });
  });


  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
})();
```
---

### 📦 Gatekit Module Exports Explained

The following exports are available from the `gatekit-auth` module and used throughout your project:

- **`authRouter`**  
  Adds built-in authentication routes such as `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/refresh`, and `/auth/validate`.

- **`initGatekit`**  
  Initializes the Gatekit system, connects to MongoDB/Redis, and prepares internal models and services.

- **`middleware`**  
  Contains helpful access control middleware functions:

  - `authenticate` – Ensures the user is logged in via JWT
  - `requireRole(role)` – Restricts access to users with a specific role
  - `requirePermission(permission)` – Restricts access based on permission value
  - `optionalAuth` – Makes authentication optional, adds `req.user` if token exists

- **`registerCallback(eventName, fn)`**  
  Hook into the lifecycle of auth events like registration, login, logout, token refresh, or validation.

### 3. Environment Variables (.env)

```env
# Database
MONGO_URI=mongodb://localhost:27017/myapp

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Server
PORT=3000
```

---

## 🔐 API Endpoints

### Authentication Endpoints

#### 1. User Registration

```http
POST /auth/register
Content-Type: application/json

{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "123456",
    "metadata": {
        "firstName": "John",
        "lastName": "Doe",
        "phoneNumber": "+1234567890"
    }
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 2. Login

```http
POST /auth/login
Content-Type: application/json

{
    "username": "johndoe", // or email
    "password": "123456"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "username": "johndoe",
      "email": "john@example.com"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

#### 3. Token Refresh

```http
POST /auth/refresh
Content-Type: application/json

{
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 4. Logout

```http
POST /auth/logout
Authorization: Bearer your-access-token
Content-Type: application/json

{
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 5. Token Validation

```http
GET /auth/validate
Authorization: Bearer your-access-token
```

---

## 🛡️ Middleware Usage

### 1. Basic Authentication

```javascript
const { middleware } = require("gatekit-auth");

// Only logged-in users can access
app.get("/dashboard", middleware.authenticate, (req, res) => {
  res.json({
    message: "Dashboard data",
    user: req.user,
  });
});
```

### 2. Role-Based Access

```javascript
// Only users with 'admin' role can access
app.get(
  "/admin-panel",
  middleware.authenticate,
  middleware.requireRole("admin"),
  (req, res) => {
    res.json({ message: "Admin panel data" });
  }
);
```

### 3. Permission-Based Access

```javascript
// Users with 'user:delete' permission can access
app.delete(
  "/users/:id",
  middleware.authenticate,
  middleware.requirePermission("user:delete"),
  (req, res) => {
    res.json({ message: "User deleted" });
  }
);
```

### 4. Optional Authentication

```javascript
// Adds user info if token exists, continues otherwise
app.get("/public-content", middleware.optionalAuth, (req, res) => {
  if (req.user) {
    res.json({
      message: "Personalized content",
      user: req.user,
    });
  } else {
    res.json({ message: "General content" });
  }
});
```

---

## ⚙️ Callback Usage

The `gatekit-auth` module provides **callback support**, allowing you to run custom logic after specific user actions such as registration, login, logout, token refresh, or validation.

### 🔧 Basic Usage

```js
const { registerCallback } = require("gatekit-auth");

registerCallback("onRegister", async (user, req, res) => {
  console.log("New user registered:", user.email);
});
```
### 🧩 Example: Assign Role to User on Registration
You can assign roles to users programmatically during or after registration using the built-in roleHelpers utility:
```js
const { registerCallback, roleHelpers } = require("gatekit-auth");

registerCallback("onRegister", async (user, req, res) => {
  // Assign the "editor" role to new users
  await roleHelpers.assignRole(user._id, "editor");
  console.log("Editor role assigned to", user.username);
});
```
You can also use other helpers like:

```js
await roleHelpers.removeRole(userId, "editor");
const roles = await roleHelpers.getUserRoles(userId);
```
### 🪝 Available Callback Events

- **`onRegister`** – Triggered after user registration  
- **`onLogin`** – Triggered after user login  
- **`onRefresh`** – Triggered after token refresh  
- **`onLogout`** – Triggered after user logout  
- **`onValidate`** – Triggered when token is validated

## 👥 Role and Permission Management

### CLI Commands

```bash
# Seed roles
npx gatekit-auth roles:seed

# Seed roles from a JSON or JS config file
npx gatekit-auth roles:seed --config ./my-roles.json

#or
npx gatekit-auth roles:seed --config ./my-roles.js

# Delete a specific role by name
npx gatekit-auth roles:delete --name admin

# Clear all roles from the database
npx gatekit-auth roles:clear
```

### 🗂️ Config File Formats for Seeding Roles

#### JSON Format (`my-roles.json`)

```json
[
  {
    "name": "admin",
    "permissions": ["user:create", "user:delete"]
  },
  {
    "name": "editor",
    "permissions": ["article:write", "article:edit"]
  }
]
```

#### JS Format (`my-roles.js`)

```js
module.exports = [
  {
    name: "admin",
    permissions: ["user:create", "user:delete"],
  },
  {
    name: "editor",
    permissions: ["article:write", "article:edit"],
  },
];
```

### Programmatic Role Management

```javascript
const { roleHelpers } = require("gatekit-auth");

// Create new role
await roleHelpers.registerRole({
  name: "editor",
  permissions: ["article:read", "article:write", "article:edit"],
});

// Assign role to user
await roleHelpers.assignRole(userId, "editor");

// Remove role from user
await roleHelpers.removeRole(userId, "editor");

// Get user roles
const userRoles = await roleHelpers.getUserRoles(userId);
```

---

## 🌐 Frontend Integration

### JavaScript/Fetch API Example

```javascript
class AuthService {
  constructor(baseURL = "http://localhost:3000") {
    this.baseURL = baseURL;
    this.token = localStorage.getItem("accessToken");
  }

  // Register
  async register(userData) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  }

  // Login
  async login(credentials) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const result = await response.json();
    if (result.success) {
      this.token = result.data.tokens.accessToken;
      localStorage.setItem("accessToken", this.token);
      localStorage.setItem("refreshToken", result.data.tokens.refreshToken);
    }
    return result;
  }

  // Protected request
  async protectedRequest(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    return response.json();
  }

  // Logout
  async logout() {
    const refreshToken = localStorage.getItem("refreshToken");
    await fetch(`${this.baseURL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    this.token = null;
  }
}

// Usage
const auth = new AuthService();

// Login
auth
  .login({
    username: "johndoe",
    password: "123456",
  })
  .then((result) => {
    if (result.success) {
      console.log("Login successful!");
    }
  });
```

### React Hook Example

```javascript
import { useState, useEffect, createContext, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await fetch("/auth/validate", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        setUser(result.data);
      } else {
        localStorage.removeItem("accessToken");
      }
    } catch (error) {
      console.error("Token validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const result = await response.json();
    if (result.success) {
      localStorage.setItem("accessToken", result.data.tokens.accessToken);
      setUser(result.data.user);
    }
    return result;
  };

  const logout = async () => {
    const token = localStorage.getItem("accessToken");
    await fetch("/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    localStorage.removeItem("accessToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

## 🔧 Advanced Configuration

### Custom User Model Extension

```javascript
// Existing User model can be extended with metadata field
const userData = {
  username: "johndoe",
  email: "john@example.com",
  password: "123456",
  metadata: {
    firstName: "John",
    lastName: "Doe",
    phoneNumber: "+1234567890",
    address: {
      street: "123 Main St",
      city: "New York",
      country: "USA",
    },
    preferences: {
      language: "en",
      theme: "dark",
    },
  },
};
```

### Redis Configuration

```javascript
const redisConfig = {
  host: "localhost",
  port: 6379,
  password: "your-redis-password",
  db: 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
};
```

---

## 🚨 Security Features

1. **Password Hashing**: SHA-256 encryption with bcryptjs
2. **JWT Token Security**: Access token (15min) and Refresh token (7 days)
3. **Token Blacklisting**: Logged out tokens are blacklisted in Redis
4. **User Ban System**: User banning with isBanned field
5. **CORS Protection**: Cross-domain security
6. **Input Validation**: Mongoose schema validation

---

## 📱 Test Scenarios

### Postman Collection Example

```json
{
  "info": {
    "name": "Gatekit Auth API",
    "description": "Gatekit authentication endpoints"
  },
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "url": "{{base_url}}/auth/register",
        "body": {
          "raw": "{\n    \"username\": \"testuser\",\n    \"email\": \"test@example.com\",\n    \"password\": \"123456\"\n}"
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "url": "{{base_url}}/auth/login",
        "body": {
          "raw": "{\n    \"username\": \"testuser\",\n    \"password\": \"123456\"\n}"
        }
      }
    }
  ]
}
```

---

## 🏗️ Production Environment Setup

### PM2 Deployment

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "my-auth-app",
      script: "./server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
```

### Docker Configuration

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```
---
## 🧠 How It Works Internally

This section explains the internal design of `gatekit-auth` for advanced users who want to understand how the system works behind the scenes:

- 🔐 **Token-Based Authentication**  
  Access and refresh tokens are generated using JWT (HMAC SHA-256). Access tokens are short-lived (`15m`), while refresh tokens live longer (`7d`).

- 🧱 **MongoDB + Mongoose**  
  User and Role schemas are managed via Mongoose. Roles are stored as ObjectId references and populated dynamically during authentication.

- 🗃️ **Redis Blacklisting (Optional)**  
  When Redis is enabled, refresh tokens are stored and blacklisted on logout. Expired or revoked access tokens are also tracked if needed.

- 🔄 **Callbacks**  
  Internal lifecycle events (register, login, logout, refresh, validate) trigger callbacks for custom logic.

- ⚙️ **Role and Permission System**  
  Role-based access is enforced by middleware. Permissions are simple strings and can include wildcards like `"*"`.

- 🧩 **Modular Middleware**  
  Middleware functions like `authenticate`, `requireRole`, `requirePermission`, and `optionalAuth` are plug-and-play.

- 📁 **Separation of Concerns**  
  Auth logic, token services, Redis integration, models, and CLI are decoupled into clean, testable modules.

---

## 📋 Important Notes

1. **MongoDB** and **Redis** servers must be running
2. Use **strong JWT secrets** in production environment
3. **HTTPS** usage is recommended
4. **express-rate-limit** can be added for rate limiting
5. **winston** or **morgan** can be used for log management

---

## 🤝 Support and Development

**Developers**: Jamil Aghazada & Murad Eyvazli  
**Version**: 1.0.0  
**License**: MIT

✅ This is the first stable version of the module.
While the core features are fully functional, we welcome feedback and will continue to improve it based on real-world usage and reported issues.
