# Mobile Authentication API - Quick Reference

## 🚀 Quick Start

### 1. Login
```bash
POST /mobile/auth/login
{
  "identifier": "email@example.com",  # or phone number
  "password": "password123"
}
```

### 2. Use Access Token
```bash
GET /mobile/any-endpoint
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 3. Refresh Token (when access token expires)
```bash
POST /mobile/auth/refresh
{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

---

## 📋 Checklist for Login

The system checks these conditions before allowing login:

- ✅ Valid email or phone number
- ✅ Correct password
- ✅ User role = EMPLOYEE
- ✅ Employee role name = "Collector"
- ✅ Employee status = Active (isActive = true)
- ✅ User status = Active (isActive = true)

---

## 🔑 Token Information

| Token Type | Expiry | Purpose |
|------------|--------|---------|
| Access Token | 1 hour | API authentication |
| Refresh Token | 7 days | Get new access token |

---

## 📱 Mobile App Integration

### Store Tokens
```javascript
// After successful login
localStorage.setItem('accessToken', data.accessToken);
localStorage.setItem('refreshToken', data.refreshToken);
```

### Use in API Calls
```javascript
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

### Handle Token Expiry
```javascript
// If API returns 401
if (response.status === 401) {
  // Refresh token
  await refreshAccessToken();
  // Retry request
}
```

---

## 🔒 Security Features

1. **Password Hashing**: bcrypt with salt
2. **JWT Tokens**: Signed with secret key
3. **Role Verification**: Only collectors allowed
4. **Status Check**: Only active accounts
5. **Token Expiry**: Automatic timeout
6. **Secure Headers**: Authorization Bearer token

---

## ⚠️ Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Invalid credentials | Wrong password | Check password |
| 403 Access denied | Not a collector | Use collector account |
| 403 Account inactive | Account disabled | Contact admin |
| 401 Token expired | Token too old | Refresh token |
| 401 Invalid token | Malformed token | Login again |

---

## 🧪 Testing

### Test with cURL
```bash
# Login
curl -X POST http://localhost:9645/mobile/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"collector@example.com","password":"password123"}'

# Refresh
curl -X POST http://localhost:9645/mobile/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_TOKEN"}'
```

### Test with Postman
1. Create new request
2. Set method to POST
3. URL: `http://localhost:9645/mobile/auth/login`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "identifier": "collector@example.com",
  "password": "password123"
}
```

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message here",
  "data": null
}
```

---

## 🔄 Token Refresh Flow

```
1. Access token expires (after 1 hour)
2. API returns 401 Unauthorized
3. App sends refresh token to /mobile/auth/refresh
4. Server validates refresh token
5. Server returns new access token + refresh token
6. App stores new tokens
7. App retries original request with new access token
```

---

## 📝 Environment Setup

Required in `.env`:
```env
JWT_SECRET=your_secret_key_here
PORT=9645
DATABASE_URL=your_database_url
```

---

## 🎯 Endpoints Summary

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/mobile/auth/login` | POST | No | Login |
| `/mobile/auth/refresh` | POST | No | Refresh token |
| `/mobile/auth/logout` | POST | No | Logout |
| `/mobile/*` (other) | * | Yes | Protected routes |

---

## 💡 Best Practices

1. **Store tokens securely** (use secure storage on mobile)
2. **Never log tokens** in production
3. **Always use HTTPS** in production
4. **Implement token refresh** before expiry
5. **Clear tokens on logout**
6. **Handle errors gracefully**
7. **Validate input** on client-side too
8. **Use environment variables** for sensitive data

---

## 🐛 Debugging

### Check if collector exists
```sql
SELECT u.*, e.*, r.name as role_name 
FROM users u
JOIN employees e ON e.userId = u.id
JOIN roles r ON r.id = e.roleId
WHERE u.email = 'collector@example.com'
AND u.role = 'EMPLOYEE'
AND r.name = 'Collector'
AND e.isActive = true;
```

### Verify token payload
Use [jwt.io](https://jwt.io) to decode and inspect token contents.

---

## 📞 Support

For issues or questions:
- Check the full documentation: `MOBILE_AUTH_API_DOCUMENTATION.md`
- Review test examples: `mobile-auth-test-examples.ts`
- Contact development team

---

**Version:** 1.0.0  
**Last Updated:** December 2025
