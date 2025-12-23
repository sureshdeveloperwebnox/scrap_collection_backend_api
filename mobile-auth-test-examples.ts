/**
 * Mobile Authentication API Test Examples
 * 
 * This file contains example requests for testing the Mobile Authentication API
 * You can use these examples with tools like Postman, Insomnia, or cURL
 */

// ============================================
// 1. MOBILE LOGIN - Email
// ============================================

/**
 * POST http://localhost:9645/mobile/auth/login
 * Content-Type: application/json
 */
const loginWithEmail = {
    identifier: "collector@example.com",
    password: "password123"
};

// Expected Response:
const loginSuccessResponse = {
    success: true,
    message: "Login successful",
    data: {
        collector: {
            id: "uuid-here",
            fullName: "John Doe",
            email: "collector@example.com",
            phone: "+1234567890",
            role: {
                id: 1,
                name: "Collector"
            },
            profilePhoto: "https://example.com/photo.jpg",
            rating: 4.5,
            completedPickups: 150,
            scrapYard: {
                id: "yard-uuid",
                yardName: "Main Scrap Yard"
            },
            crew: {
                id: "crew-uuid",
                name: "Team Alpha"
            }
        },
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
};

// ============================================
// 2. MOBILE LOGIN - Phone Number
// ============================================

/**
 * POST http://localhost:9645/mobile/auth/login
 * Content-Type: application/json
 */
const loginWithPhone = {
    identifier: "+1234567890",
    password: "password123"
};

// ============================================
// 3. REFRESH TOKEN
// ============================================

/**
 * POST http://localhost:9645/mobile/auth/refresh
 * Content-Type: application/json
 */
const refreshTokenRequest = {
    refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
};

// Expected Response:
const refreshTokenResponse = {
    success: true,
    message: "Token refreshed successfully",
    data: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
};

// ============================================
// 4. LOGOUT
// ============================================

/**
 * POST http://localhost:9645/mobile/auth/logout
 * Content-Type: application/json
 */
// No request body needed

// Expected Response:
const logoutResponse = {
    success: true,
    message: "Logged out successfully",
    data: null
};

// ============================================
// 5. PROTECTED API CALL EXAMPLE
// ============================================

/**
 * GET http://localhost:9645/mobile/orders
 * Authorization: Bearer YOUR_ACCESS_TOKEN
 * Content-Type: application/json
 */

// ============================================
// CURL EXAMPLES
// ============================================

// Login with Email
const curlLoginEmail = `
curl -X POST http://localhost:9645/mobile/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "identifier": "collector@example.com",
    "password": "password123"
  }'
`;

// Login with Phone
const curlLoginPhone = `
curl -X POST http://localhost:9645/mobile/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "identifier": "+1234567890",
    "password": "password123"
  }'
`;

// Refresh Token
const curlRefreshToken = `
curl -X POST http://localhost:9645/mobile/auth/refresh \\
  -H "Content-Type: application/json" \\
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
`;

// Logout
const curlLogout = `
curl -X POST http://localhost:9645/mobile/auth/logout \\
  -H "Content-Type: application/json"
`;

// Protected API Call
const curlProtectedCall = `
curl -X GET http://localhost:9645/mobile/orders \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json"
`;

// ============================================
// ERROR RESPONSE EXAMPLES
// ============================================

// Invalid Credentials
const errorInvalidCredentials = {
    success: false,
    message: "Invalid credentials",
    data: null
};

// Not a Collector
const errorNotCollector = {
    success: false,
    message: "Access denied. Only collectors can login to mobile app",
    data: null
};

// Inactive Account
const errorInactiveAccount = {
    success: false,
    message: "Your account is inactive. Please contact administrator",
    data: null
};

// Validation Error
const errorValidation = {
    success: false,
    message: "Validation failed",
    data: {
        errors: [
            {
                field: "identifier",
                message: "Email or phone number is required"
            },
            {
                field: "password",
                message: "Password must be at least 6 characters long"
            }
        ]
    }
};

// Expired Token
const errorExpiredToken = {
    success: false,
    message: "Refresh token expired. Please login again",
    data: null
};

// Invalid Token
const errorInvalidToken = {
    success: false,
    message: "Invalid refresh token",
    data: null
};

// ============================================
// POSTMAN COLLECTION FORMAT
// ============================================

const postmanCollection = {
    info: {
        name: "Mobile Authentication API",
        description: "API endpoints for mobile collector authentication",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    item: [
        {
            name: "Login with Email",
            request: {
                method: "POST",
                header: [
                    {
                        key: "Content-Type",
                        value: "application/json"
                    }
                ],
                body: {
                    mode: "raw",
                    raw: JSON.stringify(loginWithEmail, null, 2)
                },
                url: {
                    raw: "http://localhost:9645/mobile/auth/login",
                    protocol: "http",
                    host: ["localhost"],
                    port: "9645",
                    path: ["mobile", "auth", "login"]
                }
            }
        },
        {
            name: "Login with Phone",
            request: {
                method: "POST",
                header: [
                    {
                        key: "Content-Type",
                        value: "application/json"
                    }
                ],
                body: {
                    mode: "raw",
                    raw: JSON.stringify(loginWithPhone, null, 2)
                },
                url: {
                    raw: "http://localhost:9645/mobile/auth/login",
                    protocol: "http",
                    host: ["localhost"],
                    port: "9645",
                    path: ["mobile", "auth", "login"]
                }
            }
        },
        {
            name: "Refresh Token",
            request: {
                method: "POST",
                header: [
                    {
                        key: "Content-Type",
                        value: "application/json"
                    }
                ],
                body: {
                    mode: "raw",
                    raw: JSON.stringify(refreshTokenRequest, null, 2)
                },
                url: {
                    raw: "http://localhost:9645/mobile/auth/refresh",
                    protocol: "http",
                    host: ["localhost"],
                    port: "9645",
                    path: ["mobile", "auth", "refresh"]
                }
            }
        },
        {
            name: "Logout",
            request: {
                method: "POST",
                header: [
                    {
                        key: "Content-Type",
                        value: "application/json"
                    }
                ],
                url: {
                    raw: "http://localhost:9645/mobile/auth/logout",
                    protocol: "http",
                    host: ["localhost"],
                    port: "9645",
                    path: ["mobile", "auth", "logout"]
                }
            }
        }
    ]
};

// ============================================
// JAVASCRIPT/TYPESCRIPT USAGE EXAMPLES
// ============================================

// Login Function
async function login(identifier: string, password: string) {
    try {
        const response = await fetch('http://localhost:9645/mobile/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ identifier, password })
        });

        const data = await response.json();

        if (data.success) {
            // Store tokens securely
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            localStorage.setItem('collector', JSON.stringify(data.data.collector));

            return data.data;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
}

// Refresh Token Function
async function refreshAccessToken() {
    try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
            throw new Error('No refresh token found');
        }

        const response = await fetch('http://localhost:9645/mobile/auth/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken })
        });

        const data = await response.json();

        if (data.success) {
            // Update tokens
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);

            return data.data;
        } else {
            // Refresh token expired, clear storage and redirect to login
            localStorage.clear();
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Token refresh failed:', error);
        throw error;
    }
}

// Protected API Call Function
async function makeProtectedRequest(url: string, options: RequestInit = {}) {
    try {
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
            throw new Error('No access token found');
        }

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
            await refreshAccessToken();
            // Retry the request with new token
            return makeProtectedRequest(url, options);
        }

        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Logout Function
async function logout() {
    try {
        await fetch('http://localhost:9645/mobile/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // Clear local storage
        localStorage.clear();

        // Redirect to login page
        window.location.href = '/login';
    } catch (error) {
        console.error('Logout failed:', error);
        // Clear storage anyway
        localStorage.clear();
    }
}

// ============================================
// REACT NATIVE EXAMPLE
// ============================================

// Using AsyncStorage in React Native
import AsyncStorage from '@react-native-async-storage/async-storage';

async function loginReactNative(identifier: string, password: string) {
    try {
        const response = await fetch('http://localhost:9645/mobile/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ identifier, password })
        });

        const data = await response.json();

        if (data.success) {
            // Store tokens securely
            await AsyncStorage.setItem('accessToken', data.data.accessToken);
            await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
            await AsyncStorage.setItem('collector', JSON.stringify(data.data.collector));

            return data.data;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
}

export {
    login,
    refreshAccessToken,
    makeProtectedRequest,
    logout,
    loginReactNative,
    // Example data
    loginWithEmail,
    loginWithPhone,
    refreshTokenRequest,
    // CURL examples
    curlLoginEmail,
    curlLoginPhone,
    curlRefreshToken,
    curlLogout,
    curlProtectedCall,
    // Postman collection
    postmanCollection
};
