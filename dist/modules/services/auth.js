"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const google_auth_library_1 = require("google-auth-library");
const api_result_1 = require("../../utils/api-result");
const model_1 = require("../model");
const config_1 = require("../../config");
class Auth {
    constructor() {
        this.JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
        this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key';
        this.ACCESS_TOKEN_EXPIRY = '15m'; // Short-lived access token
        this.REFRESH_TOKEN_EXPIRY = '7d'; // Long-lived refresh token
    }
    generateTokens(payload) {
        const accessToken = jsonwebtoken_1.default.sign(payload, this.JWT_SECRET, {
            expiresIn: this.ACCESS_TOKEN_EXPIRY
        });
        const refreshToken = jsonwebtoken_1.default.sign(payload, this.JWT_REFRESH_SECRET, {
            expiresIn: this.REFRESH_TOKEN_EXPIRY
        });
        return { accessToken, refreshToken };
    }
    async signIn(data) {
        const { email, password } = data;
        // check Email
        const checkEmail = await config_1.prisma.users.findUnique({
            where: {
                email: email
            }
        });
        if (!checkEmail) {
            return api_result_1.ApiResult.error('Invalid email', 401);
        }
        const user = checkEmail;
        // Check password 
        const hashFromDB = String(user === null || user === void 0 ? void 0 : user.hashPassword).replace(/^\$2y\$/, '$2a$');
        const isMatch = await bcrypt_1.default.compare(password, hashFromDB);
        if (!isMatch) {
            return api_result_1.ApiResult.error('Invalid password', 401);
        }
        // Create JWT tokens
        const tokenPayload = {
            id: user.id,
            email: user.email,
            firstName: user.firstName || '',
            role: user.role,
            organizationId: user.organizationId || undefined
        };
        const { accessToken, refreshToken } = this.generateTokens(tokenPayload);
        return api_result_1.ApiResult.success({
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                profileImg: user.profileImg,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId
            },
            accessToken,
            refreshToken
        }, 'Login successful');
    }
    async signUp(data) {
        const { name, firstName, lastName, phone, email, password, countryId, role = 'ADMIN' } = data;
        // Check if user already exists
        const userExists = await config_1.prisma.users.findUnique({
            where: {
                email: email
            }
        });
        if (userExists) {
            return api_result_1.ApiResult.error('User with this email already exists', 400);
        }
        // Hash password
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        // create new organization
        const newOrganization = await config_1.prisma.organization.create({
            data: {
                name: name,
                email: email,
                phone: phone,
                isActive: true,
                ...(countryId && { countryId: countryId })
            }
        });
        // Create new user
        const newUser = await config_1.prisma.users.create({
            data: {
                organizationId: newOrganization.id,
                firstName: firstName || name.split(' ')[0] || name,
                lastName: lastName || name.split(' ').slice(1).join(' ') || '',
                email: email,
                hashPassword: hashedPassword,
                phone: phone,
                role: role
            }
        });
        // Create JWT tokens
        const tokenPayload = {
            id: newUser.id,
            email: email,
            firstName: firstName,
            role: role,
            organizationId: newOrganization.id
        };
        const { accessToken, refreshToken } = this.generateTokens(tokenPayload);
        return api_result_1.ApiResult.success({
            user: {
                id: newUser.id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                phone: newUser.phone,
                profileImg: newUser.profileImg,
                role: newUser.role,
                organizationId: newOrganization.id
            },
            accessToken,
            refreshToken
        }, 'User registered successfully', 201);
    }
    async signInWithGoogle(idToken) {
        try {
            const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
            if (!GOOGLE_CLIENT_ID) {
                return api_result_1.ApiResult.error('Google OAuth not configured', 500);
            }
            const client = new google_auth_library_1.OAuth2Client(GOOGLE_CLIENT_ID);
            // Verify the ID token
            const ticket = await client.verifyIdToken({
                idToken: idToken,
                audience: GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (!payload) {
                return api_result_1.ApiResult.error('Invalid Google token', 401);
            }
            const { email, given_name, family_name, picture, sub } = payload;
            if (!email) {
                return api_result_1.ApiResult.error('Email not provided by Google', 400);
            }
            // Check if user exists
            let user = await config_1.prisma.users.findUnique({
                where: { email },
                include: { Organization: true }
            });
            if (!user) {
                // Create new user WITHOUT organization - they will set it up later
                const fullName = `${given_name || ''} ${family_name || ''}`.trim() || email.split('@')[0];
                // Create new user without organization
                const createdUser = await config_1.prisma.users.create({
                    data: {
                        organizationId: null, // No organization yet
                        firstName: given_name || fullName,
                        lastName: family_name || '',
                        email: email,
                        hashPassword: '', // No password for Google OAuth users
                        phone: '',
                        role: model_1.UserRole.ADMIN,
                        profileImg: picture || null
                    }
                });
                // Fetch user (without organization)
                user = await config_1.prisma.users.findUnique({
                    where: { id: createdUser.id },
                    include: { Organization: true }
                });
                if (!user) {
                    return api_result_1.ApiResult.error('Failed to create user', 500);
                }
            }
            if (!user) {
                return api_result_1.ApiResult.error('User not found', 404);
            }
            // Create JWT tokens
            const tokenPayload = {
                id: user.id,
                email: user.email,
                firstName: user.firstName || '',
                role: user.role,
                organizationId: user.organizationId || undefined
            };
            const { accessToken, refreshToken } = this.generateTokens(tokenPayload);
            return api_result_1.ApiResult.success({
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    profileImg: user.profileImg,
                    email: user.email,
                    role: user.role,
                    organizationId: user.organizationId
                },
                accessToken,
                refreshToken
            }, 'Google sign-in successful');
        }
        catch (error) {
            console.error('Google sign-in error:', error);
            return api_result_1.ApiResult.error(error.message || 'Google authentication failed', 401);
        }
    }
    async refreshToken(refreshToken) {
        try {
            // Verify the refresh token
            const decoded = jsonwebtoken_1.default.verify(refreshToken, this.JWT_REFRESH_SECRET);
            // Generate new tokens
            const tokenPayload = {
                id: decoded.id,
                email: decoded.email,
                firstName: decoded.firstName,
                role: decoded.role,
                organizationId: decoded.organizationId
            };
            const tokens = this.generateTokens(tokenPayload);
            return api_result_1.ApiResult.success({
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            }, 'Token refreshed successfully');
        }
        catch (error) {
            console.error('Token refresh error:', error);
            return api_result_1.ApiResult.error('Invalid or expired refresh token', 401);
        }
    }
    async getMe(userId) {
        try {
            const user = await config_1.prisma.users.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    profileImg: true,
                    role: true,
                    organizationId: true,
                }
            });
            if (!user) {
                return api_result_1.ApiResult.error('User not found', 404);
            }
            return api_result_1.ApiResult.success({
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    profileImg: user.profileImg,
                    role: user.role,
                    organizationId: user.organizationId
                }
            }, 'User retrieved successfully');
        }
        catch (error) {
            console.error('Get me error:', error);
            return api_result_1.ApiResult.error('Failed to retrieve user', 500);
        }
    }
    async updateProfile(userId, data) {
        try {
            // Check if user exists
            const user = await config_1.prisma.users.findUnique({
                where: { id: userId }
            });
            if (!user) {
                return api_result_1.ApiResult.error('User not found', 404);
            }
            // Handle fullName split if provided
            let firstName = data.firstName;
            let lastName = data.lastName;
            if (data.fullName) {
                const parts = data.fullName.trim().split(' ');
                firstName = parts[0];
                lastName = parts.slice(1).join(' ');
            }
            // Check if email is being updated and if it's already taken
            if (data.email && data.email !== user.email) {
                const emailExists = await config_1.prisma.users.findUnique({
                    where: { email: data.email }
                });
                if (emailExists) {
                    return api_result_1.ApiResult.error('Email already in use', 400);
                }
            }
            // Update user
            const updatedUser = await config_1.prisma.users.update({
                where: { id: userId },
                data: {
                    firstName: firstName !== undefined ? firstName : user.firstName,
                    lastName: lastName !== undefined ? lastName : user.lastName,
                    phone: data.phone !== undefined ? data.phone : user.phone,
                    email: data.email || user.email,
                    profileImg: data.profileImg !== undefined ? data.profileImg : user.profileImg,
                }
            });
            return api_result_1.ApiResult.success({
                user: {
                    id: updatedUser.id,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                    profileImg: updatedUser.profileImg,
                    role: updatedUser.role,
                    organizationId: updatedUser.organizationId
                }
            }, 'Profile updated successfully');
        }
        catch (error) {
            console.error('Update profile error:', error);
            return api_result_1.ApiResult.error('Failed to update profile', 500);
        }
    }
    async signOut() {
        // For JWT tokens, signout is typically handled client-side by removing the token
        // This endpoint exists for consistency and can be extended to handle token blacklisting if needed
        return api_result_1.ApiResult.success(null, 'Signed out successfully');
    }
}
exports.Auth = Auth;
