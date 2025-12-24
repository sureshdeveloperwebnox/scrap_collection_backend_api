# Mobile Authentication API Documentation

This document provides comprehensive information about the Mobile Authentication API endpoints for the Scrap Collection mobile application.

## Base URL
```
http://localhost:9645/mobile/auth
```

## Overview

The Mobile Authentication API provides secure authentication for collectors using the mobile app. It implements JWT-based authentication with access tokens and refresh tokens.

### Key Features
- ✅ Login with email or phone number
- ✅ Role-based access control (Collectors only)
- ✅ Status verification (Active collectors only)
- ✅ Access token (1 hour expiry)
- ✅ Refresh token (7 days expiry)
- ✅ Secure password hashing with bcrypt
- ✅ Comprehensive error handling

---

## Authentication Flow

1. **Login**: Collector provides email/phone + password
2. **Validation**: System checks role (EMPLOYEE) and collector status (active)
3. **Token Generation**: System generates access token and refresh token
4. **API Access**: Use access token in Authorization header for protected routes
5. **Token Refresh**: When access token expires, use refresh token to get new tokens

---

## Endpoints

### 1. Mobile Login

**Endpoint:** `POST /mobile/auth/login`

**Description:** Authenticates a collector and returns access and refresh tokens.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "identifier": "collector@example.com",  // Email or phone number
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "collector": {
      "id": "uuid-here",
      "fullName": "John Doe",
      "email": "collector@example.com",
      "phone": "+1234567890",
      "role": {
        "id": 1,
        "name": "Collector"
      },
      "profilePhoto": "https://example.com/photo.jpg",
      "rating": 4.5,
      "completedPickups": 150,
      "scrapYard": {
        "id": "yard-uuid",
        "yardName": "Main Scrap Yard"
      },
      "crew": {
        "id": "crew-uuid",
        "name": "Team Alpha"
      }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

**401 Unauthorized - Invalid Credentials:**
```json
{
  "success": false,
  "message": "Invalid credentials",
  "data": null
}
```

**403 Forbidden - Not a Collector:**
```json
{
  "success": false,
  "message": "Access denied. Only collectors can login to mobile app",
  "data": null
}
```

**403 Forbidden - Inactive Account:**
```json
{
  "success": false,
  "message": "Your account is inactive. Please contact administrator",
  "data": null
}
```

**404 Not Found - Employee Record Not Found:**
```json
{
  "success": false,
  "message": "Employee record not found",
  "data": null
}
```

**Validation Errors (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "errors": [
      {
        "field": "identifier",
        "message": "Email or phone number is required"
      },
      {
        "field": "password",
        "message": "Password must be at least 6 characters long"
      }
    ]
  }
}
```

---

### 2. Refresh Token

**Endpoint:** `POST /mobile/auth/refresh`

**Description:** Generates new access and refresh tokens using a valid refresh token.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

**401 Unauthorized - Invalid Token:**
```json
{
  "success": false,
  "message": "Invalid refresh token",
  "data": null
}
```

**401 Unauthorized - Expired Token:**
```json
{
  "success": false,
  "message": "Refresh token expired. Please login again",
  "data": null
}
```

**403 Forbidden - Inactive Account:**
```json
{
  "success": false,
  "message": "Your account is inactive. Please contact administrator",
  "data": null
}
```

**404 Not Found - Employee Not Found:**
```json
{
  "success": false,
  "message": "Employee not found",
  "data": null
}
```

---

### 3. Logout

**Endpoint:** `POST /mobile/auth/logout`

**Description:** Logs out the collector (client-side token removal).

**Request Headers:**
```
Content-Type: application/json
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

**Note:** For JWT-based authentication, logout is primarily handled on the client-side by removing the stored tokens. This endpoint exists for consistency and can be extended for token blacklisting in the future.

---

## Using Access Tokens

### Protected Routes

All mobile API endpoints (except authentication endpoints) require a valid access token.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Example Protected Request

```bash
curl -X GET http://localhost:9645/mobile/orders \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### Token Payload

The access token contains the following information:

```json
{
  "id": "collector-uuid",
  "email": "collector@example.com",
  "phone": "+1234567890",
  "fullName": "John Doe",
  "role": "Collector",
  "roleId": 1,
  "organizationId": 1,
  "scrapYardId": "yard-uuid",
  "crewId": "crew-uuid",
  "type": "access",
  "iat": 1640000000,
  "exp": 1640003600
}
```

---

## Security Checklist

### ✅ Implemented Security Features

1. **Password Security**
   - Passwords are hashed using bcrypt
   - Minimum password length: 6 characters
   - Passwords are never returned in API responses

2. **Token Security**
   - JWT tokens with expiration
   - Access token: 1 hour expiry
   - Refresh token: 7 days expiry
   - Tokens include user role and permissions

3. **Role-Based Access Control**
   - Only EMPLOYEE role users can access
   - Only collectors (role name = "Collector") can login
   - Role verification on every request

4. **Status Verification**
   - Only active employees can login
   - Status checked on login and token refresh
   - Inactive accounts are immediately blocked

5. **Input Validation**
   - All inputs validated using Joi
   - Email/phone format validation
   - Password strength requirements

6. **Error Handling**
   - Generic error messages for security
   - No sensitive information in error responses
   - Detailed logging for debugging

---

## Example Usage

### Login Example (cURL)

```bash
curl -X POST http://localhost:9645/mobile/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "collector@example.com",
    "password": "password123"
  }'
```

### Login Example (JavaScript/Fetch)

```javascript
const login = async (identifier, password) => {
  try {
    const response = await fetch('http://localhost:9645/mobile/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier,
        password
      })
    });

    const data = await response.json();

    if (data.success) {
      // Store tokens securely
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
```

### Refresh Token Example (JavaScript/Fetch)

```javascript
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    const response = await fetch('http://localhost:9645/mobile/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken
      })
    });

    const data = await response.json();

    if (data.success) {
      // Update tokens
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      
      return data.data;
    } else {
      // Refresh token expired, redirect to login
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Redirect to login page
    throw error;
  }
};
```

### Protected API Call Example (JavaScript/Fetch)

```javascript
const makeProtectedRequest = async (url, options = {}) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    // If token expired, try to refresh
    if (response.status === 401) {
      await refreshToken();
      // Retry the request with new token
      return makeProtectedRequest(url, options);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};
```

---

## Testing

### Test Scenarios

1. **Valid Login with Email**
   - Input: Valid email and password
   - Expected: 200 OK with tokens

2. **Valid Login with Phone**
   - Input: Valid phone and password
   - Expected: 200 OK with tokens

3. **Invalid Credentials**
   - Input: Wrong password
   - Expected: 401 Unauthorized

4. **Non-Collector User**
   - Input: Admin user credentials
   - Expected: 403 Forbidden

5. **Inactive Collector**
   - Input: Inactive collector credentials
   - Expected: 403 Forbidden

6. **Token Refresh**
   - Input: Valid refresh token
   - Expected: 200 OK with new tokens

7. **Expired Refresh Token**
   - Input: Expired refresh token
   - Expected: 401 Unauthorized

8. **Invalid Token Format**
   - Input: Malformed token
   - Expected: 401 Unauthorized

---

## Database Requirements

### Required Tables
- `users` - User authentication data
- `employees` - Employee details
- `roles` - Role definitions

### Required Data
1. At least one active collector in the database
2. Collector must have:
   - User record with EMPLOYEE role
   - Employee record linked to user
   - Role record with name "Collector"
   - isActive = true for both user and employee

---

## Environment Variables

```env
JWT_SECRET=your_jwt_secret_key_here
PORT=9645
DATABASE_URL=your_database_url_here
```

---

## Error Codes Reference

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request (Validation Error) |
| 401 | Unauthorized (Invalid Credentials/Token) |
| 403 | Forbidden (Access Denied) |
| 404 | Not Found (Resource Not Found) |
| 500 | Internal Server Error |

---

## Support

For issues or questions, please contact the development team.

**Version:** 1.0.0  
**Last Updated:** December 2025
