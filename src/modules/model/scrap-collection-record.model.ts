import { ScrapConditionEnum, PaymentMethodEnum, PaymentStatusEnum, CollectionRecordStatus } from './enum';

/**
 * Interface for creating a scrap collection record
 */
export interface ICreateScrapCollectionRecord {
    // Work Order & Customer Reference
    orderId: string;
    customerId: string;

    // Scrap Item Details
    scrapCategoryId: string;
    scrapNameId: string;
    scrapDescription: string;
    scrapCondition: ScrapConditionEnum;

    // Item Specifications
    make: string;
    model: string;
    yearOfManufacture?: string;
    serialNumber?: string;

    // Measurements & Pricing
    weight: number;
    quantity: number;
    dimensions?: {
        length?: number;
        width?: number;
        height?: number;
        unit?: string;
    };

    // Financial Details (Optional in payload, fetched from Order or calculated)
    quotedAmount?: number;
    baseAmount?: number;
    taxPercentage?: number;
    taxAmount?: number;
    additionalCharges?: number;
    discountAmount?: number;
    finalAmount?: number;
    paymentMethod?: PaymentMethodEnum;
    paymentStatus?: PaymentStatusEnum;

    // Documentation
    photos: string[];
    beforePhotos?: string[];
    afterPhotos?: string[];
    customerSignature: string;
    collectorSignature?: string;
    employeeSignature: string;
    scrapCollectedDate: Date | string;

    // Additional Information
    notes?: string;
    specialInstructions?: string;
    hazardousMaterial?: boolean;
    requiresDisassembly?: boolean;

    // Location
    pickupLatitude?: number;
    pickupLongitude?: number;
    scrapYardId?: string;
}

/**
 * Interface for updating a scrap collection record
 */
export interface IUpdateScrapCollectionRecord extends Partial<ICreateScrapCollectionRecord> {
    status?: CollectionRecordStatus;
}

/**
 * Query parameters for fetching scrap collection records
 */
export interface IScrapCollectionRecordQueryParams {
    page?: number;
    limit?: number;
    status?: CollectionRecordStatus | CollectionRecordStatus[];
    collectorId?: string;
    orderId?: string;
    customerId?: string;
    scrapCategoryId?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    sortBy?: 'collectionDate' | 'finalAmount' | 'createdAt' | 'customerName';
    sortOrder?: 'asc' | 'desc';
}

/**
 * Response for scrap collection record list
 */
export interface IScrapCollectionRecordListResponse {
    records: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    summary?: {
        totalRecords: number;
        totalAmount: number;
        draftCount: number;
        submittedCount: number;
        approvedCount: number;
    };
}

/**
 * Helper data for the collection form
 */
export interface ICollectionFormHelpers {
    workOrders: Array<{
        id: string;
        orderNumber: string;
        customerName: string;
        customerPhone: string;
        address: string;
    }>;
    scrapCategories: Array<{
        id: string;
        name: string;
        description?: string;
    }>;
    scrapNames: Array<{
        id: string;
        name: string;
        categoryId: string;
    }>;
}
