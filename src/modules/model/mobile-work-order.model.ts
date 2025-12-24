import { OrderStatus, PaymentStatusEnum } from './enum';

/**
 * Query parameters for fetching work orders
 * Supports comprehensive filtering for mobile collectors
 */
export interface IMobileWorkOrderQueryParams {
    // Pagination
    page?: number;
    limit?: number;

    // Status filters
    status?: OrderStatus | OrderStatus[]; // Single or multiple statuses
    paymentStatus?: PaymentStatusEnum;

    // Date filters
    dateFrom?: string; // ISO date string
    dateTo?: string; // ISO date string
    pickupDateFrom?: string; // Filter by scheduled pickup time
    pickupDateTo?: string;

    // Location filters
    yardId?: string; // Filter by assigned scrap yard
    nearLatitude?: number; // For nearby orders
    nearLongitude?: number;
    radiusKm?: number; // Radius in kilometers for nearby search

    // Search
    search?: string; // Search in customer name, phone, address, order number

    // Sorting
    sortBy?: 'createdAt' | 'pickupTime' | 'quotedPrice' | 'customerName' | 'orderStatus';
    sortOrder?: 'asc' | 'desc';

    // Additional filters
    hasPhotos?: boolean; // Only orders with photos
    priceMin?: number;
    priceMax?: number;
}

/**
 * Response structure for work order list
 */
export interface IMobileWorkOrderListResponse {
    orders: IMobileWorkOrder[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    summary?: {
        totalOrders: number;
        pendingCount: number;
        assignedCount: number;
        inProgressCount: number;
        completedCount: number;
        cancelledCount: number;
        totalRevenue: number;
    };
}

/**
 * Simplified work order structure for mobile app
 */
export interface IMobileWorkOrder {
    id: string;
    orderNumber: string;

    // Customer information
    customer: {
        name: string;
        phone: string;
        email?: string;
    };

    // Location
    location: {
        address: string;
        latitude?: number;
        longitude?: number;
        distance?: string; // Distance from collector's current location
        estimatedDuration?: string; // Estimated travel time
    };

    // Vehicle details
    vehicle: {
        make?: string;
        model?: string;
        year?: string;
        condition?: string;
        [key: string]: any; // Allow additional fields from JSON
    };

    // Photos
    photos?: string[];

    // Assignment details
    assignment: {
        assignedAt?: Date;
        pickupTime?: Date;
        yard?: {
            id: string;
            name: string;
            address: string;
        };
        crew?: {
            id: string;
            name: string;
            memberCount: number;
        };
    };

    // Status and payment
    status: {
        order: OrderStatus;
        payment: PaymentStatusEnum;
    };

    // Pricing
    pricing: {
        quoted?: number;
        actual?: number;
    };

    // Route information
    route?: {
        distance?: string;
        duration?: string;
    };

    // Notes
    notes: {
        customer?: string;
        admin?: string;
        instructions?: string;
    };

    // Timeline
    timeline?: Array<{
        status: OrderStatus;
        notes?: string;
        performedBy?: string;
        createdAt: Date;
    }>;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Request body for updating work order status
 */
export interface IMobileUpdateWorkOrderStatusRequest {
    status: OrderStatus;
    notes?: string;
    actualPrice?: number;
    completionPhotos?: string[]; // Photos taken upon completion
    photos?: string[]; // General photos (e.g., arrival, location)
    timestamp?: Date | string; // Timestamp when status was updated
    latitude?: number; // Location where status was updated
    longitude?: number;
    performedById?: string; // Optional: ID of the employee performing the action (defaults to collector)
}

/**
 * Statistics for collector's dashboard
 */
export interface IMobileCollectorStats {
    today: {
        assigned: number;
        completed: number;
        revenue: number;
    };
    thisWeek: {
        assigned: number;
        completed: number;
        revenue: number;
    };
    thisMonth: {
        assigned: number;
        completed: number;
        revenue: number;
    };
    overall: {
        totalCompleted: number;
        totalRevenue: number;
        averageRating: number;
        completionRate: number; // Percentage of completed vs assigned
    };
}
