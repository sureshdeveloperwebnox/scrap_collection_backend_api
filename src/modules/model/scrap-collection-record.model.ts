import { ScrapConditionEnum, CollectionRecordStatus } from './enum';

/**
 * Interface for creating a scrap collection record
 * Simplified to match the new schema
 */
export interface ICreateScrapCollectionRecord {
    // Foreign Keys (IDs)
    workOrderId?: string;
    assignOrderId?: string;
    customerId?: string;
    scrapCategoryId: string;
    scrapNameId?: string;

    // Collection Details
    collectionDate?: Date | string;
    scrapDescription: string;
    scrapCondition: ScrapConditionEnum;
    make?: string;
    model?: string;
    yearOfManufacture?: string;
    weight?: number;
    quantity?: number; // Optional

    // Amounts
    quotedAmount: number;
    finalAmount: number;

    // Photos & Signatures (Digital Ocean paths)
    photos?: string[]; // Array of photo URLs
    customerSignature?: string; // Customer signature URL
    collectorSignature?: string; // Collector signature URL

    // Status
    collectionStatus?: CollectionRecordStatus;
}

/**
 * Interface for updating a scrap collection record
 */
export interface IUpdateScrapCollectionRecord extends Partial<ICreateScrapCollectionRecord> {
    collectionStatus?: CollectionRecordStatus;
}

/**
 * Query parameters for fetching scrap collection records
 */
export interface IScrapCollectionRecordQueryParams {
    page?: number;
    limit?: number;
    collectionStatus?: CollectionRecordStatus | CollectionRecordStatus[];
    collectorId?: string;
    workOrderId?: string;
    customerId?: string;
    scrapCategoryId?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    sortBy?: 'collectionDate' | 'finalAmount' | 'createdAt';
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
        submittedCount: number;
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
