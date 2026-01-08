"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobileWorkOrderService = void 0;
const config_1 = require("../../config");
const api_result_1 = require("../../utils/api-result");
const storage_service_1 = require("../../utils/storage.service");
const enum_1 = require("../model/enum");
class MobileWorkOrderService {
    /**
     * Calculate distance between two coordinates using Haversine formula
     * Returns distance in kilometers
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    toRad(degrees) {
        return degrees * (Math.PI / 180);
    }
    /**
     * Process image (handle Base64 or pass through URL)
     */
    async processImage(image, folder) {
        if (!image || typeof image !== 'string')
            return image;
        // Check if it's a base64 string
        if (image.startsWith('data:image')) {
            try {
                const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                if (!matches || matches.length !== 3) {
                    return image;
                }
                const contentType = matches[1];
                const base64Data = matches[2];
                const buffer = Buffer.from(base64Data, 'base64');
                // Get extension from content type
                const extension = contentType.split('/')[1] || 'jpg';
                const fileName = `mobile_upload_${Date.now()}.${extension}`;
                // Upload to storage service
                const path = await storage_service_1.storageService.uploadFile(buffer, fileName, folder, contentType);
                return path;
            }
            catch (error) {
                console.error('Error processing base64 image:', error);
                return image;
            }
        }
        return image;
    }
    /**
     * Process multiple images
     */
    async processImages(images, folder) {
        if (!images || !Array.isArray(images) || images.length === 0)
            return [];
        const uploadPromises = images.map(img => this.processImage(img, folder));
        return Promise.all(uploadPromises);
    }
    /**
     * Transform database order to mobile-friendly format
     */
    transformOrderToMobile(order, collectorLocation) {
        var _a, _b;
        // Calculate distance if collector location provided
        let distance;
        let estimatedDuration;
        if (collectorLocation && order.latitude && order.longitude) {
            const distanceKm = this.calculateDistance(collectorLocation.lat, collectorLocation.lon, order.latitude, order.longitude);
            distance = `${distanceKm.toFixed(1)} km`;
            // Rough estimation: 40 km/h average speed in city
            const durationMinutes = Math.round((distanceKm / 40) * 60);
            estimatedDuration = `${durationMinutes} min`;
        }
        return {
            id: order.id,
            orderNumber: order.orderNumber || 'N/A',
            customer: {
                name: order.customerName,
                email: order.customerEmail || undefined
            },
            location: {
                address: order.address,
                latitude: order.latitude || undefined,
                longitude: order.longitude || undefined,
                distance,
                estimatedDuration
            },
            vehicle: order.vehicleDetails || {},
            photos: order.photos || undefined,
            assignment: {
                assignedAt: order.updatedAt,
                pickupTime: order.pickupTime || undefined,
                yard: order.scrap_yards ? {
                    id: order.scrap_yards.id,
                    name: order.scrap_yards.yardName,
                    address: order.scrap_yards.address
                } : undefined,
                crew: order.crews ? {
                    id: order.crews.id,
                    name: order.crews.name,
                    memberCount: ((_a = order.crews.Employee) === null || _a === void 0 ? void 0 : _a.length) || 0
                } : undefined
            },
            status: {
                order: order.orderStatus,
                payment: order.paymentStatus
            },
            pricing: {
                quoted: order.quotedPrice || undefined,
                actual: order.actualPrice || undefined
            },
            route: order.routeDistance || order.routeDuration ? {
                distance: order.routeDistance || undefined,
                duration: order.routeDuration || undefined
            } : undefined,
            notes: {
                customer: order.customerNotes || undefined,
                admin: order.adminNotes || undefined,
                instructions: order.instructions || undefined
            },
            timeline: (_b = order.order_timelines) === null || _b === void 0 ? void 0 : _b.map((t) => ({
                status: t.status,
                notes: t.notes || undefined,
                performedBy: t.performedBy || undefined,
                createdAt: t.createdAt
            })),
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        };
    }
    /**
     * Get work orders for a collector with comprehensive filtering
     */
    async getWorkOrders(collectorId, query, collectorLocation) {
        try {
            const { page = 1, limit = 20, status, paymentStatus, dateFrom, dateTo, pickupDateFrom, pickupDateTo, yardId, nearLatitude, nearLongitude, radiusKm = 50, search, sortBy = 'createdAt', sortOrder = 'desc', hasPhotos, priceMin, priceMax } = query;
            const parsedPage = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
            const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 20;
            const skip = (parsedPage - 1) * parsedLimit;
            // Build where clause
            const where = {
                OR: [
                    { assignedCollectorId: collectorId },
                    {
                        crews: {
                            Employee: {
                                some: {
                                    id: collectorId
                                }
                            }
                        }
                    }
                ]
            };
            // Status filter - support multiple statuses
            if (status) {
                if (Array.isArray(status)) {
                    where.orderStatus = { in: status };
                }
                else {
                    where.orderStatus = status;
                }
            }
            // Payment status filter
            if (paymentStatus) {
                where.paymentStatus = paymentStatus;
            }
            // Date range filter for order creation
            if (dateFrom || dateTo) {
                where.createdAt = {};
                if (dateFrom)
                    where.createdAt.gte = new Date(dateFrom);
                if (dateTo)
                    where.createdAt.lte = new Date(dateTo);
            }
            // Date range filter for pickup time
            if (pickupDateFrom || pickupDateTo) {
                where.pickupTime = {};
                if (pickupDateFrom)
                    where.pickupTime.gte = new Date(pickupDateFrom);
                if (pickupDateTo)
                    where.pickupTime.lte = new Date(pickupDateTo);
            }
            // Yard filter
            if (yardId) {
                where.yardId = yardId;
            }
            // Search filter
            if (search) {
                where.OR = [
                    { customerName: { contains: search, mode: 'insensitive' } },
                    { address: { contains: search, mode: 'insensitive' } },
                    { orderNumber: { contains: search, mode: 'insensitive' } }
                ];
            }
            // Photos filter
            if (hasPhotos !== undefined) {
                if (hasPhotos) {
                    where.photos = { not: null };
                }
                else {
                    where.photos = null;
                }
            }
            // Price range filter
            if (priceMin !== undefined || priceMax !== undefined) {
                where.quotedPrice = {};
                if (priceMin !== undefined)
                    where.quotedPrice.gte = priceMin;
                if (priceMax !== undefined)
                    where.quotedPrice.lte = priceMax;
            }
            // Fetch orders with all relations
            const [orders, total] = await Promise.all([
                config_1.prisma.order.findMany({
                    where,
                    skip,
                    take: parsedLimit,
                    include: {
                        scrap_yards: true,
                        crews: {
                            include: {
                                Employee: {
                                    select: {
                                        id: true,
                                        fullName: true
                                    }
                                }
                            }
                        },
                        order_timelines: {
                            orderBy: {
                                createdAt: 'asc'
                            }
                        }
                    },
                    orderBy: {
                        [sortBy]: sortOrder
                    }
                }),
                config_1.prisma.order.count({ where })
            ]);
            // Filter by location if coordinates provided
            let filteredOrders = orders;
            if (nearLatitude !== undefined && nearLongitude !== undefined) {
                filteredOrders = orders.filter(order => {
                    if (!order.latitude || !order.longitude)
                        return false;
                    const distance = this.calculateDistance(nearLatitude, nearLongitude, order.latitude, order.longitude);
                    return distance <= radiusKm;
                });
            }
            // Transform to mobile format
            const mobileOrders = filteredOrders.map(order => this.transformOrderToMobile(order, collectorLocation));
            // Calculate summary statistics
            const summary = {
                totalOrders: total,
                pendingCount: await config_1.prisma.order.count({ where: { ...where, orderStatus: enum_1.OrderStatus.PENDING } }),
                assignedCount: await config_1.prisma.order.count({ where: { ...where, orderStatus: enum_1.OrderStatus.ASSIGNED } }),
                inProgressCount: await config_1.prisma.order.count({ where: { ...where, orderStatus: enum_1.OrderStatus.IN_PROGRESS } }),
                completedCount: await config_1.prisma.order.count({ where: { ...where, orderStatus: enum_1.OrderStatus.COMPLETED } }),
                cancelledCount: await config_1.prisma.order.count({ where: { ...where, orderStatus: enum_1.OrderStatus.CANCELLED } }),
                totalRevenue: await config_1.prisma.order.aggregate({
                    where: { ...where, orderStatus: enum_1.OrderStatus.COMPLETED },
                    _sum: { actualPrice: true }
                }).then(result => result._sum.actualPrice || 0)
            };
            const response = {
                orders: mobileOrders,
                pagination: {
                    page: parsedPage,
                    limit: parsedLimit,
                    total: filteredOrders.length,
                    totalPages: Math.ceil(filteredOrders.length / parsedLimit)
                },
                summary
            };
            return api_result_1.ApiResult.success(response, 'Work orders retrieved successfully');
        }
        catch (error) {
            console.error('Error in getWorkOrders:', error);
            return api_result_1.ApiResult.error(error.message || 'Failed to fetch work orders', 500);
        }
    }
    /**
     * Get single work order details
     */
    async getWorkOrderById(collectorId, orderId) {
        try {
            const order = await config_1.prisma.order.findFirst({
                where: {
                    OR: [
                        { id: orderId },
                        { orderNumber: orderId }
                    ],
                    // Must be assigned to this collector or their crew
                    AND: [
                        {
                            OR: [
                                { assignedCollectorId: collectorId },
                                {
                                    crews: {
                                        Employee: {
                                            some: {
                                                id: collectorId
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                },
                include: {
                    scrap_yards: true,
                    crews: {
                        include: {
                            Employee: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    phone: true
                                }
                            }
                        }
                    },
                    order_timelines: {
                        orderBy: {
                            createdAt: 'asc'
                        }
                    },
                    Customer: {
                        select: {
                            id: true,
                            email: true,
                            phone: true
                        }
                    },
                    Payment: true
                }
            });
            if (!order) {
                return api_result_1.ApiResult.error('Work order not found or not assigned to you', 404);
            }
            const mobileOrder = this.transformOrderToMobile(order);
            return api_result_1.ApiResult.success(mobileOrder, 'Work order retrieved successfully');
        }
        catch (error) {
            console.error('Error in getWorkOrderById:', error);
            return api_result_1.ApiResult.error(error.message || 'Failed to fetch work order', 500);
        }
    }
    /**
     * Update work order status (for collectors to update progress)
     */
    async updateWorkOrderStatus(collectorId, orderId, data) {
        try {
            // Verify order is assigned to this collector
            const order = await config_1.prisma.order.findFirst({
                where: {
                    OR: [
                        { id: orderId },
                        { orderNumber: orderId }
                    ],
                    // Must be assigned to this collector or their crew
                    AND: [
                        {
                            OR: [
                                { assignedCollectorId: collectorId },
                                {
                                    crews: {
                                        Employee: {
                                            some: {
                                                id: collectorId
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            });
            if (!order) {
                return api_result_1.ApiResult.error('Work order not found or not assigned to you', 404);
            }
            // Validate status transition
            const validTransitions = {
                [enum_1.OrderStatus.PENDING]: [enum_1.OrderStatus.ASSIGNED, enum_1.OrderStatus.CANCELLED, enum_1.OrderStatus.COMPLETED],
                [enum_1.OrderStatus.ASSIGNED]: [enum_1.OrderStatus.IN_PROGRESS, enum_1.OrderStatus.CANCELLED, enum_1.OrderStatus.COMPLETED],
                [enum_1.OrderStatus.IN_PROGRESS]: [enum_1.OrderStatus.COMPLETED, enum_1.OrderStatus.CANCELLED],
                [enum_1.OrderStatus.COMPLETED]: [], // Cannot change from completed
                [enum_1.OrderStatus.CANCELLED]: [] // Cannot change from cancelled
            };
            if (!validTransitions[order.orderStatus].includes(data.status)) {
                return api_result_1.ApiResult.error(`Invalid status transition from ${order.orderStatus} to ${data.status}`, 400);
            }
            // Update order
            const updateData = {
                orderStatus: data.status
            };
            // Handle photos only on completion
            if (data.status === 'COMPLETED' && data.photos && data.photos.length > 0) {
                const processedPhotos = await this.processImages(data.photos, `orders/${order.id}/completion`);
                const existingPhotos = order.photos || [];
                updateData.photos = [...existingPhotos, ...processedPhotos];
                // Ensure actualPrice is set from quoted price if not already set
                if (order.quotedPrice && !order.actualPrice) {
                    updateData.actualPrice = order.quotedPrice;
                }
            }
            const updatedOrder = await config_1.prisma.order.update({
                where: { id: order.id },
                data: updateData,
                include: {
                    scrap_yards: true,
                    crews: {
                        include: {
                            Employee: true
                        }
                    },
                    order_timelines: true
                }
            });
            // Create timeline entry
            const timelineData = {
                orderId: order.id,
                status: data.status,
                notes: `Status updated to ${data.status} via mobile`,
                performedBy: collectorId
            };
            // Use custom timestamp if provided
            if (data.timestamp) {
                timelineData.createdAt = new Date(data.timestamp);
            }
            await config_1.prisma.order_timelines.create({
                data: timelineData
            });
            const mobileOrder = this.transformOrderToMobile(updatedOrder);
            return api_result_1.ApiResult.success(mobileOrder, 'Work order status updated successfully');
        }
        catch (error) {
            console.error('Error in updateWorkOrderStatus:', error);
            return api_result_1.ApiResult.error(error.message || 'Failed to update work order status', 500);
        }
    }
    /**
     * Get collector statistics
     */
    async getCollectorStats(collectorId) {
        try {
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const baseWhere = {
                OR: [
                    { assignedCollectorId: collectorId },
                    {
                        crews: {
                            Employee: {
                                some: {
                                    id: collectorId
                                }
                            }
                        }
                    }
                ]
            };
            // Today's stats
            const todayAssigned = await config_1.prisma.order.count({
                where: {
                    ...baseWhere,
                    createdAt: { gte: startOfToday },
                    orderStatus: { in: [enum_1.OrderStatus.ASSIGNED, enum_1.OrderStatus.IN_PROGRESS] }
                }
            });
            const todayCompleted = await config_1.prisma.order.count({
                where: {
                    ...baseWhere,
                    updatedAt: { gte: startOfToday },
                    orderStatus: enum_1.OrderStatus.COMPLETED
                }
            });
            const todayRevenue = await config_1.prisma.order.aggregate({
                where: {
                    ...baseWhere,
                    updatedAt: { gte: startOfToday },
                    orderStatus: enum_1.OrderStatus.COMPLETED
                },
                _sum: { actualPrice: true }
            });
            // This week's stats
            const weekAssigned = await config_1.prisma.order.count({
                where: {
                    ...baseWhere,
                    createdAt: { gte: startOfWeek },
                    orderStatus: { in: [enum_1.OrderStatus.ASSIGNED, enum_1.OrderStatus.IN_PROGRESS] }
                }
            });
            const weekCompleted = await config_1.prisma.order.count({
                where: {
                    ...baseWhere,
                    updatedAt: { gte: startOfWeek },
                    orderStatus: enum_1.OrderStatus.COMPLETED
                }
            });
            const weekRevenue = await config_1.prisma.order.aggregate({
                where: {
                    ...baseWhere,
                    updatedAt: { gte: startOfWeek },
                    orderStatus: enum_1.OrderStatus.COMPLETED
                },
                _sum: { actualPrice: true }
            });
            // This month's stats
            const monthAssigned = await config_1.prisma.order.count({
                where: {
                    ...baseWhere,
                    createdAt: { gte: startOfMonth },
                    orderStatus: { in: [enum_1.OrderStatus.ASSIGNED, enum_1.OrderStatus.IN_PROGRESS] }
                }
            });
            const monthCompleted = await config_1.prisma.order.count({
                where: {
                    ...baseWhere,
                    updatedAt: { gte: startOfMonth },
                    orderStatus: enum_1.OrderStatus.COMPLETED
                }
            });
            const monthRevenue = await config_1.prisma.order.aggregate({
                where: {
                    ...baseWhere,
                    updatedAt: { gte: startOfMonth },
                    orderStatus: enum_1.OrderStatus.COMPLETED
                },
                _sum: { actualPrice: true }
            });
            // Overall stats
            const totalCompleted = await config_1.prisma.order.count({
                where: {
                    ...baseWhere,
                    orderStatus: enum_1.OrderStatus.COMPLETED
                }
            });
            const totalRevenue = await config_1.prisma.order.aggregate({
                where: {
                    ...baseWhere,
                    orderStatus: enum_1.OrderStatus.COMPLETED
                },
                _sum: { actualPrice: true }
            });
            const totalAssigned = await config_1.prisma.order.count({
                where: baseWhere
            });
            // Get employee rating
            const employee = await config_1.prisma.employee.findUnique({
                where: { id: collectorId },
                select: { rating: true }
            });
            const stats = {
                today: {
                    assigned: todayAssigned,
                    completed: todayCompleted,
                    revenue: todayRevenue._sum.actualPrice || 0
                },
                thisWeek: {
                    assigned: weekAssigned,
                    completed: weekCompleted,
                    revenue: weekRevenue._sum.actualPrice || 0
                },
                thisMonth: {
                    assigned: monthAssigned,
                    completed: monthCompleted,
                    revenue: monthRevenue._sum.actualPrice || 0
                },
                overall: {
                    totalCompleted,
                    totalRevenue: totalRevenue._sum.actualPrice || 0,
                    averageRating: (employee === null || employee === void 0 ? void 0 : employee.rating) || 0,
                    completionRate: totalAssigned > 0 ? (totalCompleted / totalAssigned) * 100 : 0
                }
            };
            return api_result_1.ApiResult.success(stats, 'Collector statistics retrieved successfully');
        }
        catch (error) {
            console.error('Error in getCollectorStats:', error);
            return api_result_1.ApiResult.error(error.message || 'Failed to fetch collector statistics', 500);
        }
    }
}
exports.MobileWorkOrderService = MobileWorkOrderService;
