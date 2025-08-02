//register oldu diye 
{
    "username": "testuser",
    "email": "test@example.com",
    "password": "123456"
}

{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id": "688de610672ce21d06f7a789",
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "2025-08-02T10:18:56.533Z"
  }
}
//error test for register 

{
  "success": false,
  "message": "This username or email is already in use",
  "error": null
}
//mail de  @ yoksa yada dogru girilmediyse 
{
  "success": false,
  "message": "An error occurred during the registration process",
  "error": null
}


//login 
{
    "username": "test@example.com",
    "password": "123456"
  }

{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "688de610672ce21d06f7a789",
      "username": "testuser",
      "email": "test@example.com"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODhkZTYxMDY3MmNlMjFkMDZmN2E3ODkiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU0MTMwMTYyLCJleHAiOjE3NTQxMzEwNjJ9.cVGWKD70Whp_FtQS7E2QiwrZi21Zb1E26c5IPnspdSY",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODhkZTYxMDY3MmNlMjFkMDZmN2E3ODkiLCJ0eXBlIjoicmVmcmVzaCIsInRva2VuSWQiOiJlNzY5MWJjNzE5ODViYzdmMjQzMzk5NGVkOTk3NTdkYSIsImlhdCI6MTc1NDEzMDE2MiwiZXhwIjoxNzU0NzM0OTYyfQ.hUPvkCtVoUleTUssOEdvx9pOHyvpuLVRh--WoYy6iQw"
    }
  }
}

//wrong password

{
    "username": "test@example.com",
    "password": "wrongpassword"
  }

  {
  "success": false,
  "message": "Invalid username or password",
  "error": null
}


//GET http://localhost:3000/protected \
  -H "Authorization: Bearer ACCESS_TOKEN"

  sonuc:

{
  "message": "Protected endpoint - sadece giriş yapmış kullanıcılar",
  "user": {
    "_id": "688de610672ce21d06f7a789",
    "username": "testuser",
    "email": "test@example.com",
    "roles": [],
    "isBanned": false,
    "createdAt": "2025-08-02T10:18:56.533Z",
    "updatedAt": "2025-08-02T10:18:56.533Z",
    "__v": 0
  },
  "timestamp": "2025-08-02T10:24:44.185Z"
}
//tokensiz 
{
  "success": false,
  "message": "No token provided",
  "error": null
}



// /auth/validate
with token

{
  "success": true,
  "message": "Token is valid",
  "data": {
    "id": "688de610672ce21d06f7a789",
    "username": "testuser",
    "email": "test@example.com",
    "roles": [],
    "metadata": {}
  }
}



// /auth/refresh 

{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODhkZTYxMDY3MmNlMjFkMDZmN2E3ODkiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU0MTMwNTIzLCJleHAiOjE3NTQxMzE0MjN9.7FA9qYm33qVVX9boOwC04Jir9x-4nsaVboVusW_DAec",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODhkZTYxMDY3MmNlMjFkMDZmN2E3ODkiLCJ0eXBlIjoicmVmcmVzaCIsInRva2VuSWQiOiJiYjBiY2RlOTk0MGJlMmQyNWZhYmU2ODkwOTg2MzkyNyIsImlhdCI6MTc1NDEzMDUyMywiZXhwIjoxNzU0NzM1MzIzfQ.uqsrSJF4dJWSBTnI-HdcaK0jqYXH4Axiw_mJE__un6s"
  }
}

// /auth/logout 

{
  "success": true,
  "message": "Logout successful",
  "data": null
}

Yeni Admin Kullanıcısı Oluşturma
//register admin
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id": "688de927672ce21d06f7a795",
    "username": "adminuser",
    "email": "admin@example.com",
    "createdAt": "2025-08-02T10:32:07.652Z"
  }
}

//login admin
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "688de927672ce21d06f7a795",
      "username": "adminuser",
      "email": "admin@example.com"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODhkZTkyNzY3MmNlMjFkMDZmN2E3OTUiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU0MTMwNzY1LCJleHAiOjE3NTQxMzE2NjV9.29DV-csKHYE_IfXqE138i38GJ6WUvVj7LuTx6FHcHzA",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODhkZTkyNzY3MmNlMjFkMDZmN2E3OTUiLCJ0eXBlIjoicmVmcmVzaCIsInRva2VuSWQiOiIwN2Y1MDQ0MGI1OGI2NmQwYzU1YTFmOTdjNGQ0MzVjMyIsImlhdCI6MTc1NDEzMDc2NSwiZXhwIjoxNzU0NzM1NTY1fQ.F6TmiE2srg3axeb8kZl9G8lvLS19-qVzn3G2blD_ImU"
    }
  }
}

admine admin role u atama basarili 
mongosh mongodb://localhost:27017/gatekit-test --eval 'db.roles.findOne({name: "admin"})'
{
  _id: ObjectId('688de9cc9052fa526c6ef6e5'),
  name: 'admin',
  permissions: [ 'read', 'write', 'delete', 'manage_users' ],
  createdAt: ISODate('2025-08-02T10:34:52.540Z'),
  updatedAt: ISODate('2025-08-02T10:34:52.540Z')
}
(base) murad@Murad-MacBook-Pro gatekit-auth % mongosh mongodb://localhost:27017/gatekit-test --eval 'db.users.updateOne({email:
  "admin@example.com"}, {$push: {roles: ObjectId("688de9cc9052fa526c6ef6e5")}})'
{
  acknowledged: true,
  insertedId: null,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0
}


// /admin-only kismina giris

{
  "message": "Admin only endpoint",
  "user": {
    "_id": "688de927672ce21d06f7a795",
    "username": "adminuser",
    "email": "admin@example.com",
    "roles": [
      {
        "_id": "688de9cc9052fa526c6ef6e5",
        "name": "admin",
        "permissions": [
          "read",
          "write",
          "delete",
          "manage_users"
        ],
        "createdAt": "2025-08-02T10:34:52.540Z",
        "updatedAt": "2025-08-02T10:34:52.540Z"
      }
    ],
    "isBanned": false,
    "createdAt": "2025-08-02T10:32:07.652Z",
    "updatedAt": "2025-08-02T10:32:07.652Z",
    "__v": 0
  },
  "timestamp": "2025-08-02T10:39:30.656Z"
}


//optional-auth test

{
  "message": "Optional auth endpoint",
  "user": {
    "_id": "688de927672ce21d06f7a795",
    "username": "adminuser",
    "email": "admin@example.com",
    "roles": [
      {
        "_id": "688de9cc9052fa526c6ef6e5",
        "name": "admin",
        "permissions": [
          "read",
          "write",
          "delete",
          "manage_users"
        ],
        "createdAt": "2025-08-02T10:34:52.540Z",
        "updatedAt": "2025-08-02T10:34:52.540Z"
      }
    ],
    "isBanned": false,
    "createdAt": "2025-08-02T10:32:07.652Z",
    "updatedAt": "2025-08-02T10:32:07.652Z",
    "__v": 0
  },
  "timestamp": "2025-08-02T10:42:52.372Z"
}

sql injection fail 
{
  "success": false,
  "message": "Invalid username or password",
  "error": null
}

//xss atack mumkun olmadi

POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "<script>alert('xss')</script>",
    "email": "xss@test.com",
    "password": "123456"
  }'

