# 🚀 Mobile Authentication API - Quick Setup Guide

## Overview

This is a complete mobile authentication backend for the Scrap Collection app with JWT-based authentication, role-based access control, and comprehensive security features.

---

## ✅ What's Included

- ✅ Login with email or phone number
- ✅ Password authentication with bcrypt
- ✅ Role-based access (Collectors only)
- ✅ Status verification (Active collectors only)
- ✅ Access tokens (1 hour expiry)
- ✅ Refresh tokens (7 days expiry)
- ✅ Token verification middleware
- ✅ Comprehensive error handling
- ✅ Full documentation

---

## 🏗️ Files Created

### Core Implementation
```
src/
├── modules/
│   ├── model/
│   │   └── mobile-auth.model.ts          # TypeScript interfaces
│   ├── rules/
│   │   └── mobile-auth.rules.ts          # Joi validation schemas
│   ├── services/
│   │   └── mobile-auth.ts                # Authentication logic
│   └── controllers/
│       └── mobile-auth.controller.ts     # API endpoints
└── middlewares/
    └── mobile-auth.middleware.ts         # Token verification
```

### Documentation
```
MOBILE_AUTH_API_DOCUMENTATION.md          # Complete API reference
MOBILE_AUTH_QUICK_REFERENCE.md            # Quick reference guide
MOBILE_AUTH_IMPLEMENTATION_SUMMARY.md     # Implementation details
MOBILE_AUTH_FLOW_DIAGRAM.txt              # Visual flow diagrams
mobile-auth-test-examples.ts              # Code examples
```

---

## 🚀 Quick Start

### 1. Environment Setup

Make sure your `.env` file has:
```env
JWT_SECRET=your_secret_key_here
PORT=9645
DATABASE_URL=postgresql://user:pass@localhost:5432/db
```

### 2. Database Setup

Ensure you have a collector in your database:

```sql
-- 1. Create a user with EMPLOYEE role
INSERT INTO users (id, email, phone, "hashPassword", role, "isActive")
VALUES (
  'uuid-here',
  'collector@example.com',
  '+1234567890',
  '$2a$10$hashedpasswordhere',  -- bcrypt hash of 'password123'
  'EMPLOYEE',
  true
);

-- 2. Create a role named "Collector"
INSERT INTO roles (id, name, description, "isActive")
VALUES (1, 'Collector', 'Scrap collector role', true);

-- 3. Create an employee record
INSERT INTO employees (
  id, "fullName", email, phone, "roleId", 
  "isActive", "organizationId", "userId"
)
VALUES (
  'employee-uuid',
  'John Doe',
  'collector@example.com',
  '+1234567890',
  1,  -- roleId for Collector
  true,
  1,  -- your organizationId
  'uuid-here'  -- userId from step 1
);
```

### 3. Build and Run

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start server
npm run dev
```

Server will start on `http://localhost:9645`

---

## 🧪 Test the API

### Test Login
```bash
curl -X POST http://localhost:9645/mobile/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "collector@example.com",
    "password": "password123"
  }'
```

### Expected Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "collector": {
      "id": "uuid",
      "fullName": "John Doe",
      "email": "collector@example.com",
      "phone": "+1234567890",
      "role": {
        "id": 1,
        "name": "Collector"
      },
      "rating": 0,
      "completedPickups": 0
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

---

## 📱 Mobile App Integration

### Login Function
```javascript
async function login(identifier, password) {
  const response = await fetch('http://api.example.com/mobile/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store tokens
    await AsyncStorage.setItem('accessToken', data.data.accessToken);
    await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
    return data.data.collector;
  }
  
  throw new Error(data.message);
}
```

### Protected API Call
```javascript
async function makeRequest(url, options = {}) {
  const token = await AsyncStorage.getItem('accessToken');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  // Handle token expiry
  if (response.status === 401) {
    await refreshToken();
    return makeRequest(url, options);
  }
  
  return response.json();
}
```

---

## 🔐 Security Checklist

### ✅ Implemented
- [x] Password hashing with bcrypt
- [x] JWT token signing
- [x] Role-based access control
- [x] Status verification
- [x] Input validation
- [x] Token expiration
- [x] Secure error messages

### 🔄 Recommended Enhancements
- [ ] Rate limiting on login endpoint
- [ ] Token blacklisting (Redis)
- [ ] Two-factor authentication
- [ ] Device management
- [ ] Audit logging
- [ ] Password reset flow

---

## 📊 API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/mobile/auth/login` | POST | No | Login with email/phone |
| `/mobile/auth/refresh` | POST | No | Refresh access token |
| `/mobile/auth/logout` | POST | No | Logout |
| `/mobile/*` (others) | * | Yes | Protected routes |

---

## 🐛 Troubleshooting

### Login fails with "Invalid credentials"
- Check if user exists in database
- Verify password is correct
- Check if password hash is valid bcrypt format

### Login fails with "Access denied"
- Verify user role is 'EMPLOYEE'
- Check if employee role name is 'Collector'
- Ensure role name is exact match (case-sensitive)

### Login fails with "Account inactive"
- Check `users.isActive = true`
- Check `employees.isActive = true`

### Token verification fails
- Verify JWT_SECRET matches in .env
- Check token hasn't expired
- Ensure token format is correct

---

## 📚 Documentation

For detailed information, see:

1. **MOBILE_AUTH_API_DOCUMENTATION.md** - Complete API reference with examples
2. **MOBILE_AUTH_QUICK_REFERENCE.md** - Quick reference for common tasks
3. **MOBILE_AUTH_IMPLEMENTATION_SUMMARY.md** - Technical implementation details
4. **MOBILE_AUTH_FLOW_DIAGRAM.txt** - Visual authentication flows
5. **mobile-auth-test-examples.ts** - Code examples and test cases

---

## 🎯 Next Steps

1. **Test the API** - Use Postman or cURL to test all endpoints
2. **Integrate with Mobile App** - Use the provided code examples
3. **Add More Features** - Implement additional mobile endpoints
4. **Enhance Security** - Add rate limiting, 2FA, etc.
5. **Deploy** - Set up production environment with HTTPS

---

## 📞 Support

For questions or issues:
- Review the documentation files
- Check the test examples
- Contact the development team

---

## ✨ Features Summary

### Authentication
- ✅ Email/phone login
- ✅ Password verification
- ✅ JWT tokens
- ✅ Token refresh
- ✅ Logout

### Authorization
- ✅ Role verification
- ✅ Status checking
- ✅ Token middleware
- ✅ Request protection

### Security
- ✅ Bcrypt hashing
- ✅ JWT signing
- ✅ Input validation
- ✅ Error handling

### Documentation
- ✅ API reference
- ✅ Quick guide
- ✅ Code examples
- ✅ Flow diagrams

---

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** December 2025

---

## 🎉 You're All Set!

The mobile authentication backend is ready to use. Start testing with the provided examples and integrate with your mobile app!
