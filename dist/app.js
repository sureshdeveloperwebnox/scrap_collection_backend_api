"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = require("./routes");
const response_generator_1 = require("./utils/response-generator");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// Load environment variables
dotenv_1.default.config();
// Initialize express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)()); // Add cookie parser middleware
// Allow multiple origins (e.g. http://localhost:7002,http://192.168.0.21:7002) for login from different hosts
const corsOrigin = ((_a = process.env.CORS_ORIGINS) === null || _a === void 0 ? void 0 : _a.trim())
    ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
    : (process.env.FRONTEND_URL || 'http://localhost:7002');
app.use((0, cors_1.default)({
    origin: Array.isArray(corsOrigin) ? corsOrigin : corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Important for cookies
}));
// Serve static files from uploads directory
app.use('/uploads', express_1.default.static('uploads'));
// Setup routes
(0, routes_1.combineRouters)(app);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    response_generator_1.ResponseGenerator.send(res, response_generator_1.ResponseGenerator.error('Internal server error', 500));
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
