"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidatorMiddleware = void 0;
const response_generator_1 = require("../utils/response-generator");
const ValidatorMiddleware = (req, res, next, rules = []) => {
    // If no rules provided or empty array, continue
    if (!rules || rules.length === 0) {
        return next();
    }
    // Take the first rule in the array
    const rule = rules[0];
    // Validate body if body rule exists
    if (rule.body) {
        const { error, value } = rule.body.validate(req.body, { abortEarly: false });
        if (error) {
            const validationErrors = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            return response_generator_1.ResponseGenerator.send(res, response_generator_1.ResponseGenerator.error('Validation error', 400, validationErrors));
        }
        req.body = value;
    }
    // Validate params if params rule exists
    if (rule.params) {
        const { error, value } = rule.params.validate(req.params, { abortEarly: false });
        if (error) {
            const validationErrors = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            return response_generator_1.ResponseGenerator.send(res, response_generator_1.ResponseGenerator.error('Validation error', 400, validationErrors));
        }
        // Assign coerced params back
        req.params = value;
    }
    // Validate query if query rule exists
    if (rule.query) {
        const { error, value } = rule.query.validate(req.query, { abortEarly: false });
        if (error) {
            const validationErrors = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            return response_generator_1.ResponseGenerator.send(res, response_generator_1.ResponseGenerator.error('Validation error', 400, validationErrors));
        }
        // Assign coerced query back
        req.query = value;
    }
    // Store validated data in the request object
    req.validatedData = {
        body: req.body,
        params: req.params,
        query: req.query
    };
    next();
};
exports.ValidatorMiddleware = ValidatorMiddleware;
