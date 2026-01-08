"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCompleteAssignment = exports.validateStartAssignment = void 0;
const joi_1 = __importDefault(require("joi"));
const startAssignmentSchema = joi_1.default.object({
    orderId: joi_1.default.string().uuid().required().messages({
        'string.empty': 'Order ID is required',
        'string.uuid': 'Order ID must be a valid UUID',
        'any.required': 'Order ID is required'
    }),
    assignOrderId: joi_1.default.string().uuid().required().messages({
        'string.empty': 'Assignment ID is required',
        'string.uuid': 'Assignment ID must be a valid UUID',
        'any.required': 'Assignment ID is required'
    }),
    collectorId: joi_1.default.string().uuid().optional().messages({
        'string.uuid': 'Collector ID must be a valid UUID'
    }),
    crewId: joi_1.default.string().uuid().optional().messages({
        'string.uuid': 'Crew ID must be a valid UUID'
    })
}).or('collectorId', 'crewId').messages({
    'object.missing': 'Either collectorId or crewId must be provided'
});
const completeAssignmentSchema = joi_1.default.object({
    orderId: joi_1.default.string().uuid().required().messages({
        'string.empty': 'Order ID is required',
        'string.uuid': 'Order ID must be a valid UUID',
        'any.required': 'Order ID is required'
    }),
    assignOrderId: joi_1.default.string().uuid().required().messages({
        'string.empty': 'Assignment ID is required',
        'string.uuid': 'Assignment ID must be a valid UUID',
        'any.required': 'Assignment ID is required'
    }),
    collectorId: joi_1.default.string().uuid().optional().messages({
        'string.uuid': 'Collector ID must be a valid UUID'
    }),
    crewId: joi_1.default.string().uuid().optional().messages({
        'string.uuid': 'Crew ID must be a valid UUID'
    }),
    completionNotes: joi_1.default.string().optional().allow('').messages({
        'string.base': 'Completion notes must be a string'
    }),
    completionPhotos: joi_1.default.array().items(joi_1.default.string()).optional().messages({
        'array.base': 'Completion photos must be an array of strings'
    })
}).or('collectorId', 'crewId').messages({
    'object.missing': 'Either collectorId or crewId must be provided'
});
const validateStartAssignment = (req, res, next) => {
    const { error } = startAssignmentSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map(detail => detail.message);
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
        return;
    }
    next();
};
exports.validateStartAssignment = validateStartAssignment;
const validateCompleteAssignment = (req, res, next) => {
    const { error } = completeAssignmentSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map(detail => detail.message);
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
        return;
    }
    next();
};
exports.validateCompleteAssignment = validateCompleteAssignment;
