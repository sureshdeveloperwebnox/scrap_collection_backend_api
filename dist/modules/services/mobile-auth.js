"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobileAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const api_result_1 = require("../../utils/api-result");
const config_1 = require("../../config");
class MobileAuth {
    constructor() {
        this.JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
        this.ACCESS_TOKEN_EXPIRY = '1h'; // 1 hour
        this.REFRESH_TOKEN_EXPIRY = '7d'; // 7 days
    }
    /**
     * Mobile Login for Collectors
     * - Accepts email or phone number
     * - Validates password
     * - Checks if user is an EMPLOYEE with collector role
     * - Checks if collector is active
     * - Returns access token and refresh token
     */
    async mobileLogin(data) {
        const { identifier, password } = data;
        try {
            // Check if identifier is email or phone
            const isEmail = identifier.includes('@');
            // Find user by email or phone
            const user = await config_1.prisma.user.findFirst({
                where: isEmail
                    ? { email: identifier }
                    : { phone: identifier }
            });
            if (!user) {
                return api_result_1.ApiResult.error('Invalid credentials', 401);
            }
            // Check if user has EMPLOYEE role
            if (user.role !== 'EMPLOYEE') {
                return api_result_1.ApiResult.error('Access denied. Only collectors can login to mobile app', 403);
            }
            // Get employee details
            const employee = await config_1.prisma.employee.findFirst({
                where: {
                    userId: user.id
                },
                include: {
                    role: true,
                    scrapYard: {
                        select: {
                            id: true,
                            yardName: true
                        }
                    },
                    crew: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });
            if (!employee) {
                return api_result_1.ApiResult.error('Employee record not found', 404);
            }
            // Check if employee role is COLLECTOR
            if (employee.role.name.toLowerCase() !== 'collector') {
                return api_result_1.ApiResult.error('Access denied. Only collectors can login to mobile app', 403);
            }
            // Check if collector is active
            if (!employee.isActive) {
                return api_result_1.ApiResult.error('Your account is inactive. Please contact administrator', 403);
            }
            // Verify password
            if (!user.hashPassword) {
                return api_result_1.ApiResult.error('Invalid credentials', 401);
            }
            const hashFromDB = String(user.hashPassword).replace(/^\$2y\$/, '$2a$');
            const isPasswordValid = await bcrypt_1.default.compare(password, hashFromDB);
            if (!isPasswordValid) {
                return api_result_1.ApiResult.error('Invalid credentials', 401);
            }
            // Generate access token and refresh token
            const accessToken = this.generateAccessToken({
                id: employee.id,
                email: user.email,
                phone: user.phone || '',
                fullName: employee.fullName,
                role: employee.role.name,
                roleId: employee.roleId,
                organizationId: employee.organizationId,
                scrapYardId: employee.scrapYardId || undefined,
                crewId: employee.crewId || undefined,
                type: 'access'
            });
            const refreshToken = this.generateRefreshToken({
                id: employee.id,
                email: user.email,
                phone: user.phone || '',
                fullName: employee.fullName,
                role: employee.role.name,
                roleId: employee.roleId,
                organizationId: employee.organizationId,
                scrapYardId: employee.scrapYardId || undefined,
                crewId: employee.crewId || undefined,
                type: 'refresh'
            });
            // Prepare response
            const response = {
                collector: {
                    id: employee.id,
                    fullName: employee.fullName,
                    email: user.email,
                    phone: user.phone || '',
                    role: {
                        id: employee.role.id,
                        name: employee.role.name
                    },
                    profilePhoto: employee.profilePhoto || undefined,
                    rating: employee.rating || 0,
                    completedPickups: employee.completedPickups,
                    scrapYard: employee.scrapYard || undefined,
                    crew: employee.crew || undefined
                },
                accessToken,
                refreshToken
            };
            return api_result_1.ApiResult.success(response, 'Login successful');
        }
        catch (error) {
            console.error('Mobile login error:', error);
            return api_result_1.ApiResult.error(error.message || 'Login failed. Please try again', 500);
        }
    }
    /**
     * Refresh Access Token
     * - Validates refresh token
     * - Generates new access token
     * - Returns new access token and refresh token
     */
    async refreshAccessToken(data) {
        var _a;
        const { refreshToken } = data;
        try {
            // Verify refresh token
            const decoded = jsonwebtoken_1.default.verify(refreshToken, this.JWT_SECRET);
            // Check if token type is refresh
            if (decoded.type !== 'refresh') {
                return api_result_1.ApiResult.error('Invalid token type', 401);
            }
            // Get employee details to verify still active
            const employee = await config_1.prisma.employee.findUnique({
                where: { id: decoded.id },
                include: {
                    role: true,
                    user: true,
                    scrapYard: {
                        select: {
                            id: true,
                            yardName: true
                        }
                    },
                    crew: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });
            if (!employee) {
                return api_result_1.ApiResult.error('Employee not found', 404);
            }
            // Check if employee is still active
            if (!employee.isActive) {
                return api_result_1.ApiResult.error('Your account is inactive. Please contact administrator', 403);
            }
            // Check if user is still active
            if (!((_a = employee.user) === null || _a === void 0 ? void 0 : _a.isActive)) {
                return api_result_1.ApiResult.error('Your account is inactive. Please contact administrator', 403);
            }
            // Generate new tokens
            const newAccessToken = this.generateAccessToken({
                id: employee.id,
                email: employee.user.email,
                phone: employee.user.phone || '',
                fullName: employee.fullName,
                role: employee.role.name,
                roleId: employee.roleId,
                organizationId: employee.organizationId,
                scrapYardId: employee.scrapYardId || undefined,
                crewId: employee.crewId || undefined,
                type: 'access'
            });
            const newRefreshToken = this.generateRefreshToken({
                id: employee.id,
                email: employee.user.email,
                phone: employee.user.phone || '',
                fullName: employee.fullName,
                role: employee.role.name,
                roleId: employee.roleId,
                organizationId: employee.organizationId,
                scrapYardId: employee.scrapYardId || undefined,
                crewId: employee.crewId || undefined,
                type: 'refresh'
            });
            return api_result_1.ApiResult.success({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            }, 'Token refreshed successfully');
        }
        catch (error) {
            console.error('Token refresh error:', error);
            if (error.name === 'TokenExpiredError') {
                return api_result_1.ApiResult.error('Refresh token expired. Please login again', 401);
            }
            if (error.name === 'JsonWebTokenError') {
                return api_result_1.ApiResult.error('Invalid refresh token', 401);
            }
            return api_result_1.ApiResult.error(error.message || 'Token refresh failed', 500);
        }
    }
    /**
     * Verify Access Token
     * - Used by middleware to verify protected routes
     */
    verifyAccessToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.JWT_SECRET);
            // Check if token type is access
            if (decoded.type !== 'access') {
                return null;
            }
            return decoded;
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Generate Access Token
     */
    generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this.JWT_SECRET, {
            expiresIn: this.ACCESS_TOKEN_EXPIRY
        });
    }
    /**
     * Generate Refresh Token
     */
    generateRefreshToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this.JWT_SECRET, {
            expiresIn: this.REFRESH_TOKEN_EXPIRY
        });
    }
    /**
     * Mobile Logout
     * - For JWT tokens, logout is handled client-side by removing tokens
     * - This endpoint exists for consistency and future token blacklisting
     */
    async mobileLogout() {
        return api_result_1.ApiResult.success(null, 'Logged out successfully');
    }
}
exports.MobileAuth = MobileAuth;
