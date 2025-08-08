"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const api_result_1 = require("../../utils/api-result");
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
}
exports.Auth = Auth;
