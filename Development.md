# Gatekit-Auth (In Development)

Gatekit is a Node.js-based **authentication and role management module**. The goal is to provide an out-of-the-box solution for login and register operations without writing extra backend code, along with a flexible role/permission-based middleware system.

> **Note:** This project is still in *development*. Currently, only basic login/register functions work. Token-based features (access token, refresh token, blacklist) will be added later.

---

## Current Features

- Automatically provides `POST /auth/login` and `POST /auth/register` routes.
- Uses `User.js` model with:
  - `username` (required)
  - `password` (required, hashed with `bcrypt`)
  - `metadata` (optional JSON data – e.g., `location`, `phoneNumber`, `zipcode`)
- Developers don’t need to write extra code for basic auth.

### Usage Example
```js
const gatekit = require("gatekit-auth");

app.use("/auth", gatekit.auth);
```

---

## Role & Permission System (Planned / Beta)

Gatekit allows users to perform actions based on roles and permissions.  
Example scenario: On a blog site, you may want roles with permissions like:

- `canWrite`
- `canRead`
- `boss` (both read and write)

### Why Use a Role Model?
Instead of storing individual permissions for every user, we define roles (e.g., `admin`, `editor`) and assign permissions to them. This way, instead of storing 50 separate permission sets for 50 users, we just store one per role – improving scalability.

### Planned Features
- Support for loading roles from a `roles.json` file directly into the DB.
- Helper functions to add/remove roles, assign/remove roles from users.

---

## Middleware Example

Gatekit provides a simple way to protect routes based on permissions:

```js
const { middleware } = require("gatekit");

app.post("/new-document", middleware("canWrite", (req, res) => {
  res.status(403).json({ message: "You don’t have permission for this action" });
}), (req, res) => {
  // Action for authorized users
  res.send("Document created");
});
```

The callback allows custom error responses in different languages or formats (JSON, HTML, etc.).

---

## Roadmap
- [ ] Basic login & register routes (no tokens)
- [ ] JWT-based access & refresh tokens
- [ ] Token blacklist support
- [ ] JSON-based role definitions
- [ ] Detailed documentation and tests

---

## Contributing
This project is currently under active development. Code may change significantly.  
For contributions or suggestions, feel free to open an issue or pull request.
###### [!] Coding by J. and Murad