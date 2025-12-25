import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { ApiResult } from '../../utils/api-result';
import { IMobileLoginData, IMobileTokenPayload, IRefreshTokenData } from '../model/mobile-auth.model';
import { prisma } from '../../config';

export class MobileAuth {
    private readonly JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
    private readonly ACCESS_TOKEN_EXPIRY = '1h'; // 1 hour
    private readonly REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

    /**
     * Mobile Login for Collectors
     * - Accepts email or phone number
     * - Validates password
     * - Checks if user is an EMPLOYEE with collector role
     * - Checks if collector is active
     * - Returns access token and refresh token
     */
    public async mobileLogin(data: IMobileLoginData): Promise<ApiResult> {
        const { identifier, password } = data;

        try {
            // Check if identifier is email or phone
            const isEmail = identifier.includes('@');

            // Find employee by email or phone
            const employee = await prisma.employee.findFirst({
                where: isEmail
                    ? { email: identifier }
                    : { phone: identifier },
                include: {
                    roles: true,
                    scrap_yards: {
                        select: {
                            id: true,
                            yardName: true
                        }
                    },
                    crews: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });

            if (!employee) {
                return ApiResult.error('Invalid credentials', 401);
            }

            // Check if employee role is COLLECTOR
            if (employee.roles.name.toLowerCase() !== 'collector') {
                return ApiResult.error('Access denied. Only collectors can login to mobile app', 403);
            }

            // Check if collector is active
            if (!employee.isActive) {
                return ApiResult.error('Your account is inactive. Please contact administrator', 403);
            }

            // Verify password using employee.passwordHash
            if (!employee.passwordHash) {
                return ApiResult.error('Invalid credentials', 401);
            }

            const hashFromDB = String(employee.passwordHash).replace(/^\$2y\$/, '$2a$');
            const isPasswordValid = await bcrypt.compare(password, hashFromDB);

            if (!isPasswordValid) {
                return ApiResult.error('Invalid credentials', 401);
            }

            // Generate access token and refresh token
            const accessToken = this.generateAccessToken({
                id: employee.id,
                email: employee.email,
                phone: employee.phone || '',
                fullName: employee.fullName,
                role: employee.roles.name,
                roleId: employee.roleId,
                organizationId: employee.organizationId,
                scrapYardId: employee.scrapYardId || undefined,
                crewId: employee.crewId || undefined,
                type: 'access'
            });

            const refreshToken = this.generateRefreshToken({
                id: employee.id,
                email: employee.email,
                phone: employee.phone || '',
                fullName: employee.fullName,
                role: employee.roles.name,
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
                    email: employee.email,
                    phone: employee.phone || '',
                    role: {
                        id: employee.roles.id,
                        name: employee.roles.name
                    },
                    profilePhoto: employee.profilePhoto || undefined,
                    rating: employee.rating || 0,
                    completedPickups: employee.completedPickups,
                    scrapYard: employee.scrap_yards || undefined,
                    crew: employee.crews || undefined
                },
                accessToken,
                refreshToken
            };

            return ApiResult.success(response, 'Login successful');

        } catch (error: any) {
            console.error('Mobile login error:', error);
            return ApiResult.error(
                error.message || 'Login failed. Please try again',
                500
            );
        }
    }

    /**
     * Refresh Access Token
     * - Validates refresh token
     * - Generates new access token
     * - Returns new access token and refresh token
     */
    public async refreshAccessToken(data: IRefreshTokenData): Promise<ApiResult> {
        const { refreshToken } = data;

        try {
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, this.JWT_SECRET) as IMobileTokenPayload;

            // Check if token type is refresh
            if (decoded.type !== 'refresh') {
                return ApiResult.error('Invalid token type', 401);
            }

            // Get employee details to verify still active
            const employee = await prisma.employee.findUnique({
                where: { id: decoded.id },
                include: {
                    roles: true,
                    users: true,
                    scrap_yards: {
                        select: {
                            id: true,
                            yardName: true
                        }
                    },
                    crews: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });

            if (!employee) {
                return ApiResult.error('Employee not found', 404);
            }

            // Check if employee is still active
            if (!employee.isActive) {
                return ApiResult.error('Your account is inactive. Please contact administrator', 403);
            }

            // Check if user is still active
            if (!employee.users?.isActive) {
                return ApiResult.error('Your account is inactive. Please contact administrator', 403);
            }

            // Generate new tokens
            const newAccessToken = this.generateAccessToken({
                id: employee.id,
                email: employee.email,
                phone: employee.phone || '',
                fullName: employee.fullName,
                role: employee.roles.name,
                roleId: employee.roleId,
                organizationId: employee.organizationId,
                scrapYardId: employee.scrapYardId || undefined,
                crewId: employee.crewId || undefined,
                type: 'access'
            });

            const newRefreshToken = this.generateRefreshToken({
                id: employee.id,
                email: employee.email,
                phone: employee.phone || '',
                fullName: employee.fullName,
                role: employee.roles.name,
                roleId: employee.roleId,
                organizationId: employee.organizationId,
                scrapYardId: employee.scrapYardId || undefined,
                crewId: employee.crewId || undefined,
                type: 'refresh'
            });

            return ApiResult.success({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            }, 'Token refreshed successfully');
        } catch (error: any) {
            console.error('Token refresh error:', error);

            if (error.name === 'TokenExpiredError') {
                return ApiResult.error('Refresh token expired. Please login again', 401);
            }

            if (error.name === 'JsonWebTokenError') {
                return ApiResult.error('Invalid refresh token', 401);
            }

            return ApiResult.error(
                error.message || 'Token refresh failed',
                500
            );
        }
    }

    /**
     * Verify Access Token
     * - Used by middleware to verify protected routes
     */
    public verifyAccessToken(token: string): IMobileTokenPayload | null {
        try {
            const decoded = jwt.verify(token, this.JWT_SECRET) as IMobileTokenPayload;

            // Check if token type is access
            if (decoded.type !== 'access') {
                return null;
            }

            return decoded;
        } catch (error) {
            return null;
        }
    }

    /**
     * Generate Access Token
     */
    private generateAccessToken(payload: IMobileTokenPayload): string {
        return jwt.sign(payload, this.JWT_SECRET, {
            expiresIn: this.ACCESS_TOKEN_EXPIRY
        });
    }

    /**
     * Generate Refresh Token
     */
    private generateRefreshToken(payload: IMobileTokenPayload): string {
        return jwt.sign(payload, this.JWT_SECRET, {
            expiresIn: this.REFRESH_TOKEN_EXPIRY
        });
    }

    /**
     * Mobile Logout
     * - For JWT tokens, logout is handled client-side by removing tokens
     * - This endpoint exists for consistency and future token blacklisting
     */
    public async mobileLogout(): Promise<ApiResult> {
        return ApiResult.success(null, 'Logged out successfully');
    }
}
