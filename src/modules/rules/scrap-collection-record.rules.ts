import Joi from 'joi';

export const createScrapCollectionRecordSchema = {
    body: Joi.object({
        orderId: Joi.string().required(),
        customerId: Joi.string().required(),

        scrapCategoryId: Joi.string().required(),
        scrapNameId: Joi.string().required(),
        scrapDescription: Joi.string().required(),
        scrapCondition: Joi.string().valid('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'SCRAP', 'HAZARDOUS').required(),

        make: Joi.string().required(),
        model: Joi.string().required(),
        yearOfManufacture: Joi.string().optional(),
        serialNumber: Joi.string().optional(),

        weight: Joi.number().min(0).required(),
        quantity: Joi.number().integer().min(1).required(),
        dimensions: Joi.object({
            length: Joi.number().optional(),
            width: Joi.number().optional(),
            height: Joi.number().optional(),
            unit: Joi.string().optional()
        }).optional(),

        // Financial Details made optional as requested
        quotedAmount: Joi.number().min(0).optional(),
        baseAmount: Joi.number().min(0).optional(),
        taxPercentage: Joi.number().min(0).max(100).optional(),
        taxAmount: Joi.number().min(0).optional(),
        additionalCharges: Joi.number().min(0).optional(),
        discountAmount: Joi.number().min(0).optional(),
        finalAmount: Joi.number().min(0).optional(),
        paymentMethod: Joi.string().valid('CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE').optional(),
        paymentStatus: Joi.string().valid('UNPAID', 'PAID', 'REFUNDED').optional(),

        photos: Joi.array().items(Joi.string().uri()).required(),
        beforePhotos: Joi.array().items(Joi.string().uri()).optional(),
        afterPhotos: Joi.array().items(Joi.string().uri()).optional(),
        customerSignature: Joi.string().uri().required(),
        collectorSignature: Joi.string().uri().optional(),
        employeeSignature: Joi.string().uri().required(),
        scrapCollectedDate: Joi.date().iso().required(),

        notes: Joi.string().max(2000).optional(),
        specialInstructions: Joi.string().max(1000).optional(),
        hazardousMaterial: Joi.boolean().optional(),
        requiresDisassembly: Joi.boolean().optional(),

        pickupLatitude: Joi.number().min(-90).max(90).optional(),
        pickupLongitude: Joi.number().min(-180).max(180).optional(),
        scrapYardId: Joi.string().optional()
    })
};

export const updateScrapCollectionRecordSchema = {
    body: Joi.object({
        orderId: Joi.string().optional(),
        customerId: Joi.string().optional(),
        customerName: Joi.string().optional(),
        customerPhone: Joi.string().optional(),
        customerEmail: Joi.string().email().optional(),
        customerAddress: Joi.string().optional(),

        scrapCategoryId: Joi.string().optional(),
        scrapNameId: Joi.string().optional(),
        scrapDescription: Joi.string().optional(),
        scrapCondition: Joi.string().valid('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'SCRAP', 'HAZARDOUS').optional(),

        make: Joi.string().optional(),
        model: Joi.string().optional(),
        yearOfManufacture: Joi.string().optional(),
        serialNumber: Joi.string().optional(),

        weight: Joi.number().min(0).optional(),
        quantity: Joi.number().integer().min(1).optional(),
        dimensions: Joi.object({
            length: Joi.number().optional(),
            width: Joi.number().optional(),
            height: Joi.number().optional(),
            unit: Joi.string().optional()
        }).optional(),

        quotedAmount: Joi.number().min(0).optional(),
        baseAmount: Joi.number().min(0).optional(),
        taxPercentage: Joi.number().min(0).max(100).optional(),
        taxAmount: Joi.number().min(0).optional(),
        additionalCharges: Joi.number().min(0).optional(),
        discountAmount: Joi.number().min(0).optional(),
        finalAmount: Joi.number().min(0).optional(),
        paymentMethod: Joi.string().valid('CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE').optional(),
        paymentStatus: Joi.string().valid('UNPAID', 'PAID', 'REFUNDED').optional(),

        photos: Joi.array().items(Joi.string().uri()).optional(),
        beforePhotos: Joi.array().items(Joi.string().uri()).optional(),
        afterPhotos: Joi.array().items(Joi.string().uri()).optional(),
        customerSignature: Joi.string().uri().optional(),
        collectorSignature: Joi.string().uri().optional(),
        employeeSignature: Joi.string().uri().optional(),
        scrapCollectedDate: Joi.date().iso().optional(),

        notes: Joi.string().max(2000).optional(),
        specialInstructions: Joi.string().max(1000).optional(),
        hazardousMaterial: Joi.boolean().optional(),
        requiresDisassembly: Joi.boolean().optional(),

        pickupLatitude: Joi.number().min(-90).max(90).optional(),
        pickupLongitude: Joi.number().min(-180).max(180).optional(),
        scrapYardId: Joi.string().optional(),

        status: Joi.string().valid('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'COMPLETED').optional()
    })
};

export const scrapCollectionRecordQuerySchema = {
    query: Joi.object({
        page: Joi.number().integer().min(1).optional(),
        limit: Joi.number().integer().min(1).max(100).optional(),
        status: Joi.string().optional(),
        orderId: Joi.string().optional(),
        customerId: Joi.string().optional(),
        scrapCategoryId: Joi.string().optional(),
        dateFrom: Joi.date().iso().optional(),
        dateTo: Joi.date().iso().optional(),
        search: Joi.string().max(200).optional(),
        sortBy: Joi.string().valid('collectionDate', 'finalAmount', 'createdAt', 'customerName').optional(),
        sortOrder: Joi.string().valid('asc', 'desc').optional()
    })
};

export const scrapCollectionRecordIdSchema = {
    params: Joi.object({
        id: Joi.string().required()
    })
};
