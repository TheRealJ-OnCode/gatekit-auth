# Gatekit Auth Demo - Kapsamlı Test Rehberi

Bu rehber, `gatekit-auth-demo` modülünün tüm özelliklerini test etmek için adım adım talimatlar içerir.

## Ön Gereksinimler

### 1. Sistemde Kurulu Olması Gerekenler
```bash
# Node.js (v14 veya üzeri)
node --version

# npm
npm --version

# MongoDB (yerel kurulum veya MongoDB Atlas)
mongod --version

# Redis (opsiyonel ama önerilen)
redis-server --version
```

### 2. Gerekli Servisler
```bash
# MongoDB başlatma (yerel kurulum)
mongod

# Redis başlatma (yerel kurulum)
redis-server
```

## Kurulum Adımları

### 1. Yeni Test Projesi Oluşturma
```bash
mkdir gatekit-test-project
cd gatekit-test-project
npm init -y
```

### 2. Bağımlılıkları Yükleme
```bash
npm install gatekit-auth-demo express cors dotenv
npm install --save-dev nodemon
```

### 3. Environment Dosyası Oluşturma
`.env` dosyası oluşturun:
```env
# MongoDB Bağlantısı
MONGO_URI=mongodb://localhost:27017/gatekit-test

# Redis Ayarları (opsiyonel)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Secrets
JWT_ACCESS_SECRET=gatekit-access-secret-change-in-production
JWT_REFRESH_SECRET=gatekit-refresh-secret-change-in-production
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Server
PORT=3000
NODE_ENV=development
```

## Test Server Oluşturma

### `server.js` dosyası oluşturun:
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Gatekit Auth import
const { authRouter, initGatekit, middleware, roleHelpers } = require('gatekit-auth-demo');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Gatekit başlatma
initGatekit({
    mongoURI: process.env.MONGO_URI,
    useRedis: true,
    redisOptions: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD
    }
});

// Auth routes
app.use('/auth', authRouter);

// Test endpoints
app.get('/public', (req, res) => {
    res.json({ message: 'Public endpoint - herkes erişebilir', timestamp: new Date() });
});

app.get('/protected', middleware.authenticate, (req, res) => {
    res.json({ 
        message: 'Protected endpoint - sadece giriş yapmış kullanıcılar',
        user: req.user,
        timestamp: new Date()
    });
});

app.get('/admin-only', middleware.authenticate, middleware.requireRole('admin'), (req, res) => {
    res.json({ 
        message: 'Admin only endpoint',
        user: req.user,
        timestamp: new Date()
    });
});

app.get('/optional-auth', middleware.optionalAuth, (req, res) => {
    res.json({ 
        message: 'Optional auth endpoint',
        user: req.user || 'Anonymous',
        timestamp: new Date()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Test server çalışıyor: http://localhost:${PORT}`);
    console.log(`📖 API Docs: http://localhost:${PORT}/api-docs`);
});
```

### `package.json` scripts'e ekleyin:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

## Kapsamlı Test Senaryoları

### FAZA 1: Temel Kurulum Testi

#### 1.1 Server Başlatma
```bash
npm run dev
```

**Beklenen Sonuç:**
- Server başarıyla başlar
- MongoDB bağlantısı kurulur
- Redis bağlantısı kurulur (varsa)
- Console'da başarı mesajları görünür

#### 1.2 Temel Endpoint Testi
```bash
# Public endpoint
curl http://localhost:3000/public
```

**Beklenen Sonuç:**
```json
{
  "message": "Public endpoint - herkes erişebilir",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### FAZA 2: Kullanıcı Kayıt ve Giriş İşlemleri

#### 2.1 Kullanıcı Kaydı
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "123456"
  }'
```

**Beklenen Sonuç:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id": "64f...",
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
}
```

#### 2.2 Aynı Email ile Kayıt (Hata Testi)
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "email": "test@example.com",
    "password": "123456"
  }'
```

**Beklenen Sonuç:** 409 Conflict hatası

#### 2.3 Geçersiz Email ile Kayıt
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser3",
    "email": "invalid-email",
    "password": "123456"
  }'
```

**Beklenen Sonuç:** Validation hatası

#### 2.4 Başarılı Giriş
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@example.com",
    "password": "123456"
  }'
```

**Beklenen Sonuç:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "64f...",
      "username": "testuser",
      "email": "test@example.com"
    },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ..."
    }
  }
}
```

**ÖNEMLİ:** Bu tokenleri kaydedin, sonraki testlerde kullanacağız!

#### 2.5 Yanlış Şifre ile Giriş
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@example.com",
    "password": "wrongpassword"
  }'
```

**Beklenen Sonuç:** 401 Unauthorized

### FAZA 3: Token Doğrulama ve Korumalı Endpoint Testleri

#### 3.1 Token ile Korumalı Endpoint Erişimi
```bash
# ACCESS_TOKEN'ı yukarıdaki login'den aldığınız token ile değiştirin
curl -X GET http://localhost:3000/protected \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

**Beklenen Sonuç:**
```json
{
  "message": "Protected endpoint - sadece giriş yapmış kullanıcılar",
  "user": {
    "id": "64f...",
    "username": "testuser",
    "email": "test@example.com",
    "roles": []
  },
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

#### 3.2 Token Olmadan Korumalı Endpoint
```bash
curl -X GET http://localhost:3000/protected
```

**Beklenen Sonuç:** 401 Unauthorized

#### 3.3 Geçersiz Token ile Erişim
```bash
curl -X GET http://localhost:3000/protected \
  -H "Authorization: Bearer invalid-token"
```

**Beklenen Sonuç:** 401 Unauthorized

#### 3.4 Token Doğrulama Endpoint'i
```bash
curl -X GET http://localhost:3000/auth/validate \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

**Beklenen Sonuç:**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "id": "64f...",
    "username": "testuser",
    "email": "test@example.com",
    "roles": [],
    "metadata": {}
  }
}
```

### FAZA 4: Token Yenileme İşlemleri

#### 4.1 Refresh Token ile Yeni Access Token Alma
```bash
# REFRESH_TOKEN'ı login'den aldığınız refresh token ile değiştirin
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "REFRESH_TOKEN"
  }'
```

**Beklenen Sonuç:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

#### 4.2 Geçersiz Refresh Token
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "invalid-refresh-token"
  }'
```

**Beklenen Sonuç:** 401 Unauthorized

### FAZA 5: Çıkış İşlemi ve Token Blacklisting

#### 5.1 Başarılı Çıkış
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "REFRESH_TOKEN"
  }'
```

**Beklenen Sonuç:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### 5.2 Çıkış Sonrası Token Kullanımı
```bash
# Yukarıda çıkış yapılan token ile test
curl -X GET http://localhost:3000/protected \
  -H "Authorization: Bearer OLD_ACCESS_TOKEN"
```

**Beklenen Sonuç:** 401 Unauthorized (token blacklisted)

### FAZA 6: Rol Tabanlı Erişim Kontrol (RBAC) Testleri

#### 6.1 Yeni Admin Kullanıcısı Oluşturma
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "adminuser",
    "email": "admin@example.com",
    "password": "123456"
  }'
```

#### 6.2 Admin Kullanıcısı Girişi
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@example.com",
    "password": "123456"
  }'
```

**Not:** Bu işlemden gelen access token'ı `ADMIN_ACCESS_TOKEN` olarak kaydedin.

#### 6.3 Role Helpers ile Admin Rolü Atama

**MongoDB'de manuel olarak admin rolü oluşturun:**
```javascript
// MongoDB shell veya Compass kullanarak
db.roles.insertOne({
  name: "admin",
  permissions: ["read", "write", "delete", "manage_users"],
  createdAt: new Date(),
  updatedAt: new Date()
});
```

**Kullanıcıya admin rolü atayın:**
```javascript
// User ID'yi admin kullanıcısının gerçek ID'si ile değiştirin
// Role ID'yi yukarıda oluşturduğunuz role'ün ID'si ile değiştirin
db.users.updateOne(
  { email: "admin@example.com" },
  { $push: { roles: ObjectId("ROLE_ID") } }
);
```

#### 6.4 Admin-Only Endpoint Testi
```bash
# Admin kullanıcısı ile
curl -X GET http://localhost:3000/admin-only \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

**Beklenen Sonuç:** Başarılı erişim

```bash
# Normal kullanıcı ile (önceki testlerden bir token)
curl -X GET http://localhost:3000/admin-only \
  -H "Authorization: Bearer NORMAL_USER_TOKEN"
```

**Beklenen Sonuç:** 403 Forbidden

### FAZA 7: Permission Tabanlı Erişim Testleri

#### 7.1 Permission Gerektiren Endpoint Testi
```bash
# Admin kullanıcısı ile (manage_users permission'ına sahip)
curl -X GET http://localhost:3000/permission-test \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

**Beklenen Sonuç:** Başarılı erişim

```bash
# Normal kullanıcı ile
curl -X GET http://localhost:3000/permission-test \
  -H "Authorization: Bearer NORMAL_USER_TOKEN"
```

**Beklenen Sonuç:** 403 Forbidden

### FAZA 8: Optional Auth Testi

#### 8.1 Token ile Optional Auth
```bash
curl -X GET http://localhost:3000/optional-auth \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

**Beklenen Sonuç:** User bilgileri ile birlikte response

#### 8.2 Token olmadan Optional Auth
```bash
curl -X GET http://localhost:3000/optional-auth
```

**Beklenen Sonuç:** Anonymous user olarak response

### FAZA 9: Hata Durumları ve Edge Case Testleri

#### 9.1 Eksik JSON Body
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json"
```

#### 9.2 Malformed JSON
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test@example.com", "password"}'
```

#### 9.3 SQL Injection Attempt
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@example.com'\'' OR 1=1 --",
    "password": "anything"
  }'
```

**Beklenen Sonuç:** Güvenli şekilde reddedilmeli

#### 9.4 XSS Attempt
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "<script>alert('xss')</script>",
    "email": "xss@test.com",
    "password": "123456"
  }'
```

### FAZA 10: Performance ve Stress Testleri

#### 10.1 Çoklu Eşzamanlı İstek Testi
```bash
# 10 eşzamanlı login isteği
for i in {1..10}; do
  curl -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "username": "test@example.com",
      "password": "123456"
    }' &
done
wait
```

#### 10.2 Token Validation Performance
```bash
# 50 eşzamanlı token validation
for i in {1..50}; do
  curl -X GET http://localhost:3000/auth/validate \
    -H "Authorization: Bearer ACCESS_TOKEN" &
done
wait
```

## Test Sonuçlarını Değerlendirme

### Başarı Kriterleri

#### ✅ Temel Fonksiyonalite
- [x] Kullanıcı kaydı çalışıyor
- [x] Kullanıcı girişi çalışıyor
- [x] Token oluşturma çalışıyor
- [x] Token doğrulama çalışıyor
- [x] Çıkış işlemi çalışıyor

#### ✅ Güvenlik
- [x] Şifre hashleme çalışıyor
- [x] JWT token güvenliği sağlanıyor
- [x] Token blacklisting çalışıyor
- [x] Rol tabanlı erişim kontrol çalışıyor
- [x] Permission tabanlı erişim kontrol çalışıyor

#### ✅ Hata Yönetimi
- [x] Geçersiz girişler uygun şekilde reddediliyor
- [x] Error response'lar doğru format'ta
- [x] Security attack'lar engelleniyor

#### ✅ Database İşlemleri
- [x] MongoDB bağlantısı çalışıyor
- [x] User model'i doğru çalışıyor
- [x] Role model'i doğru çalışıyor
- [x] İlişkiler (relationships) doğru çalışıyor

#### ✅ Redis İşlemleri (Opsiyonel)
- [x] Redis bağlantısı çalışıyor
- [x] Token caching çalışıyor
- [x] Session yönetimi çalışıyor

## Troubleshooting

### Yaygın Problemler ve Çözümleri

#### 1. MongoDB Bağlantı Hatası
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Çözüm:**
- MongoDB servisinin çalıştığından emin olun
- Connection string'i kontrol edin
- Firewall ayarlarını kontrol edin

#### 2. Redis Bağlantı Hatası
```
Redis connection error
```
**Çözüm:**
- Redis servisinin çalıştığından emin olun
- Redis ayarlarını kontrol edin
- Redis'siz çalışmak isterseniz `useRedis: false` yapın

#### 3. JWT Secret Hatası
```
Error: secretOrPrivateKey required
```
**Çözüm:**
- .env dosyasında JWT_ACCESS_SECRET ve JWT_REFRESH_SECRET tanımlayın

#### 4. Port Çakışması
```
Error: listen EADDRINUSE :::3000
```
**Çözüm:**
- Farklı port kullanın: `PORT=3001 npm run dev`
- Çakışan process'i kapatın

## Gelişmiş Test Senaryoları

### API Rate Limiting Testi
```bash
# 100 istek/saniye testi
for i in {1..100}; do
  curl http://localhost:3000/public &
done
```

### Concurrency Testi
```bash
# Aynı anda 20 kullanıcı kaydı
for i in {1..20}; do
  curl -X POST http://localhost:3000/auth/register \
    -H "Content-Type: application/json" \
    -d "{
      \"username\": \"user$i\",
      \"email\": \"user$i@test.com\",
      \"password\": \"123456\"
    }" &
done
```

### Memory Leak Testi
```bash
# 1000 istek ile memory kullanımını izleyin
for i in {1..1000}; do
  curl -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "username": "test@example.com",
      "password": "123456"
    }' > /dev/null 2>&1
done
```

## Postman Collection

### Postman ile Test Etmek İçin

1. Postman'i açın
2. New Collection oluşturun
3. Aşağıdaki endpoint'leri ekleyin:

```json
{
  "info": {
    "name": "Gatekit Auth Demo Tests"
  },
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "raw": "{\n  \"username\": \"testuser\",\n  \"email\": \"test@example.com\",\n  \"password\": \"123456\"\n}"
        },
        "url": "{{BASE_URL}}/auth/register"
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "raw": "{\n  \"username\": \"test@example.com\",\n  \"password\": \"123456\"\n}"
        },
        "url": "{{BASE_URL}}/auth/login"
      }
    }
  ],
  "variable": [
    {
      "key": "BASE_URL",
      "value": "http://localhost:3000"
    }
  ]
}
```

## Son Kontrol Listesi

### ✅ Tüm Fonksiyonların Çalışma Durumu

- [ ] **Kullanıcı Yönetimi**
  - [ ] Kayıt ✅/❌
  - [ ] Giriş ✅/❌
  - [ ] Çıkış ✅/❌
  - [ ] Token yenileme ✅/❌

- [ ] **Güvenlik**
  - [ ] Şifre hashleme ✅/❌
  - [ ] JWT token'lar ✅/❌
  - [ ] Token blacklisting ✅/❌
  - [ ] Input validation ✅/❌

- [ ] **RBAC (Role-Based Access Control)**
  - [ ] Rol oluşturma ✅/❌
  - [ ] Rol atama ✅/❌
  - [ ] Rol kontrolü ✅/❌
  - [ ] Permission kontrolü ✅/❌

- [ ] **Database**
  - [ ] MongoDB bağlantı ✅/❌
  - [ ] User model ✅/❌
  - [ ] Role model ✅/❌
  - [ ] İlişkiler ✅/❌

- [ ] **Redis (Opsiyonel)**
  - [ ] Redis bağlantı ✅/❌
  - [ ] Session yönetimi ✅/❌
  - [ ] Token caching ✅/❌

### 🚀 Production Readiness

- [ ] **Environment Variables**: Tüm gerekli env var'lar tanımlı
- [ ] **Error Handling**: Tüm error case'ler handle ediliyor
- [ ] **Security**: Input validation ve sanitization çalışıyor
- [ ] **Performance**: Acceptable response times
- [ ] **Logging**: Proper logging implementedi

Bu test rehberini tamamladıktan sonra, `gatekit-auth-demo` modülünün production'da kullanıma hazır olup olmadığını değerlendirebilirsiniz.