import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const startAssignmentSchema = Joi.object({
    orderId: Joi.string().uuid().required().messages({
        'string.empty': 'Order ID is required',
        'string.uuid': 'Order ID must be a valid UUID',
        'any.required': 'Order ID is required'
    }),
    assignOrderId: Joi.string().uuid().required().messages({
        'string.empty': 'Assignment ID is required',
        'string.uuid': 'Assignment ID must be a valid UUID',
        'any.required': 'Assignment ID is required'
    }),
    collectorId: Joi.string().uuid().optional().messages({
        'string.uuid': 'Collector ID must be a valid UUID'
    }),
    crewId: Joi.string().uuid().optional().messages({
        'string.uuid': 'Crew ID must be a valid UUID'
    }),
    timeStamp: Joi.alternatives().try(Joi.date(), Joi.string().allow('')).optional().messages({
        'date.base': 'Invalid timestamp format'
    })
}).or('collectorId', 'crewId').messages({
    'object.missing': 'Either collectorId or crewId must be provided'
});

const completeAssignmentSchema = Joi.object({
    orderId: Joi.string().uuid().required().messages({
        'string.empty': 'Order ID is required',
        'string.uuid': 'Order ID must be a valid UUID',
        'any.required': 'Order ID is required'
    }),
    assignOrderId: Joi.string().uuid().required().messages({
        'string.empty': 'Assignment ID is required',
        'string.uuid': 'Assignment ID must be a valid UUID',
        'any.required': 'Assignment ID is required'
    }),
    collectorId: Joi.string().uuid().optional().messages({
        'string.uuid': 'Collector ID must be a valid UUID'
    }),
    crewId: Joi.string().uuid().optional().messages({
        'string.uuid': 'Crew ID must be a valid UUID'
    }),
    completionNotes: Joi.string().optional().allow('').messages({
        'string.base': 'Completion notes must be a string'
    }),
    completionPhotos: Joi.array().items(Joi.string()).optional().messages({
        'array.base': 'Completion photos must be an array of strings'
    }),
    timeStamp: Joi.alternatives().try(Joi.date(), Joi.string().allow('')).optional().messages({
        'date.base': 'Invalid timestamp format'
    })
}).or('collectorId', 'crewId').messages({
    'object.missing': 'Either collectorId or crewId must be provided'
});

export const validateStartAssignment = (req: Request, res: Response, next: NextFunction): void => {
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

export const validateCompleteAssignment = (req: Request, res: Response, next: NextFunction): void => {
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
