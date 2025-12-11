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
    async signIn(data) {
        const { email, password } = data;
        // check Email
        const checkEmail = await config_1.prisma.user.findUnique({
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
        // Create JWT token with user category
        const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            role: user.role,
            organizationId: user.organizationId
        }, JWT_SECRET, { expiresIn: '1h' });
        return api_result_1.ApiResult.success({
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId
            },
            token
        }, 'Login successful');
    }
    async signUp(data) {
        const { name, firstName, lastName, phone, email, password, countryId, role = 'ADMIN' } = data;
        // Check if user already exists
        const userExists = await config_1.prisma.user.findUnique({
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
                countryId: countryId
            }
        });
        // Create new user
        const newUser = await config_1.prisma.user.create({
            data: {
                organizationId: newOrganization.id,
                firstName: firstName,
                lastName: lastName,
                email: email,
                hashPassword: hashedPassword,
                phone: phone,
                role: role
            }
        });
        // Create JWT token with user category
        const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
        const token = jsonwebtoken_1.default.sign({
            id: newUser.id,
            email: email,
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            role: role
        }, JWT_SECRET, { expiresIn: '1h' });
        return api_result_1.ApiResult.success({
            user: {
                id: newUser.id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role
            },
            token
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
            let user = await config_1.prisma.user.findUnique({
                where: { email },
                include: { organization: true }
            });
            if (!user) {
                // Create new user and organization
                const fullName = `${given_name || ''} ${family_name || ''}`.trim() || email.split('@')[0];
                // Get the first active country, or create a default one if none exists
                let country = await config_1.prisma.country.findFirst({
                    where: { isActive: true },
                    orderBy: { id: 'asc' }
                });
                if (!country) {
                    // Create a default country if none exists
                    country = await config_1.prisma.country.create({
                        data: {
                            name: 'Default',
                            currency: 'USD',
                            isActive: true
                        }
                    });
                }
                // Create new organization
                const newOrganization = await config_1.prisma.organization.create({
                    data: {
                        name: fullName,
                        email: email,
                        phone: '',
                        isActive: true,
                        countryId: country.id
                    }
                });
                // Create new user
                user = await config_1.prisma.user.create({
                    data: {
                        organizationId: newOrganization.id,
                        firstName: given_name || fullName,
                        lastName: family_name || '',
                        email: email,
                        hashPassword: '', // No password for Google OAuth users
                        phone: '',
                        role: model_1.UserRole.ADMIN
                    },
                    include: { organization: true }
                });
            }
            // Create JWT token
            const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
            const token = jsonwebtoken_1.default.sign({
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                role: user.role,
                organizationId: user.organizationId
            }, JWT_SECRET, { expiresIn: '1h' });
            return api_result_1.ApiResult.success({
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    email: user.email,
                    role: user.role,
                    organizationId: user.organizationId
                },
                token
            }, 'Google sign-in successful');
        }
        catch (error) {
            console.error('Google sign-in error:', error);
            return api_result_1.ApiResult.error(error.message || 'Google authentication failed', 401);
        }
    }
    async signOut() {
        // For JWT tokens, signout is typically handled client-side by removing the token
        // This endpoint exists for consistency and can be extended to handle token blacklisting if needed
        return api_result_1.ApiResult.success(null, 'Signed out successfully');
    }
}
exports.Auth = Auth;
