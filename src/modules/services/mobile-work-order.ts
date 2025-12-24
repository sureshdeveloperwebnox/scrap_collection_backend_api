import { prisma } from '../../config';
import { ApiResult } from '../../utils/api-result';
import {
    IMobileWorkOrderQueryParams,
    IMobileWorkOrderListResponse,
    IMobileWorkOrder,
    IMobileUpdateWorkOrderStatusRequest,
    IMobileCollectorStats
} from '../model/mobile-work-order.model';
import { OrderStatus } from '../model/enum';

export class MobileWorkOrderService {
    /**
     * Calculate distance between two coordinates using Haversine formula
     * Returns distance in kilometers
     */
    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRad(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    /**
     * Transform database order to mobile-friendly format
     */
    private transformOrderToMobile(order: any, collectorLocation?: { lat: number; lon: number }): IMobileWorkOrder {
        // Calculate distance if collector location provided
        let distance: string | undefined;
        let estimatedDuration: string | undefined;

        if (collectorLocation && order.latitude && order.longitude) {
            const distanceKm = this.calculateDistance(
                collectorLocation.lat,
                collectorLocation.lon,
                order.latitude,
                order.longitude
            );
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
                phone: order.customerPhone,
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
                yard: order.yard ? {
                    id: order.yard.id,
                    name: order.yard.yardName,
                    address: order.yard.address
                } : undefined,
                crew: order.crew ? {
                    id: order.crew.id,
                    name: order.crew.name,
                    memberCount: order.crew.members?.length || 0
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
            timeline: order.orderTimeline?.map((t: any) => ({
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
    public async getWorkOrders(
        collectorId: string,
        query: IMobileWorkOrderQueryParams,
        collectorLocation?: { lat: number; lon: number }
    ): Promise<ApiResult> {
        try {
            const {
                page = 1,
                limit = 20,
                status,
                paymentStatus,
                dateFrom,
                dateTo,
                pickupDateFrom,
                pickupDateTo,
                yardId,
                nearLatitude,
                nearLongitude,
                radiusKm = 50,
                search,
                sortBy = 'createdAt',
                sortOrder = 'desc',
                hasPhotos,
                priceMin,
                priceMax
            } = query;

            const parsedPage = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
            const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 20;
            const skip = (parsedPage - 1) * parsedLimit;

            // Build where clause
            const where: any = {
                OR: [
                    { assignedCollectorId: collectorId },
                    {
                        crew: {
                            members: {
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
                } else {
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
                if (dateFrom) where.createdAt.gte = new Date(dateFrom);
                if (dateTo) where.createdAt.lte = new Date(dateTo);
            }

            // Date range filter for pickup time
            if (pickupDateFrom || pickupDateTo) {
                where.pickupTime = {};
                if (pickupDateFrom) where.pickupTime.gte = new Date(pickupDateFrom);
                if (pickupDateTo) where.pickupTime.lte = new Date(pickupDateTo);
            }

            // Yard filter
            if (yardId) {
                where.yardId = yardId;
            }

            // Search filter
            if (search) {
                where.OR = [
                    { customerName: { contains: search, mode: 'insensitive' } },
                    { customerPhone: { contains: search, mode: 'insensitive' } },
                    { address: { contains: search, mode: 'insensitive' } },
                    { orderNumber: { contains: search, mode: 'insensitive' } }
                ];
            }

            // Photos filter
            if (hasPhotos !== undefined) {
                if (hasPhotos) {
                    where.photos = { not: null };
                } else {
                    where.photos = null;
                }
            }

            // Price range filter
            if (priceMin !== undefined || priceMax !== undefined) {
                where.quotedPrice = {};
                if (priceMin !== undefined) where.quotedPrice.gte = priceMin;
                if (priceMax !== undefined) where.quotedPrice.lte = priceMax;
            }

            // Fetch orders with all relations
            const [orders, total] = await Promise.all([
                prisma.order.findMany({
                    where,
                    skip,
                    take: parsedLimit,
                    include: {
                        yard: true,
                        crew: {
                            include: {
                                members: {
                                    select: {
                                        id: true,
                                        fullName: true
                                    }
                                }
                            }
                        },
                        orderTimeline: {
                            orderBy: {
                                createdAt: 'asc'
                            }
                        }
                    },
                    orderBy: {
                        [sortBy]: sortOrder
                    }
                }),
                prisma.order.count({ where })
            ]);

            // Filter by location if coordinates provided
            let filteredOrders = orders;
            if (nearLatitude !== undefined && nearLongitude !== undefined) {
                filteredOrders = orders.filter(order => {
                    if (!order.latitude || !order.longitude) return false;
                    const distance = this.calculateDistance(
                        nearLatitude,
                        nearLongitude,
                        order.latitude,
                        order.longitude
                    );
                    return distance <= radiusKm;
                });
            }

            // Transform to mobile format
            const mobileOrders = filteredOrders.map(order =>
                this.transformOrderToMobile(order, collectorLocation)
            );

            // Calculate summary statistics
            const summary = {
                totalOrders: total,
                pendingCount: await prisma.order.count({ where: { ...where, orderStatus: OrderStatus.PENDING } }),
                assignedCount: await prisma.order.count({ where: { ...where, orderStatus: OrderStatus.ASSIGNED } }),
                inProgressCount: await prisma.order.count({ where: { ...where, orderStatus: OrderStatus.IN_PROGRESS } }),
                completedCount: await prisma.order.count({ where: { ...where, orderStatus: OrderStatus.COMPLETED } }),
                cancelledCount: await prisma.order.count({ where: { ...where, orderStatus: OrderStatus.CANCELLED } }),
                totalRevenue: await prisma.order.aggregate({
                    where: { ...where, orderStatus: OrderStatus.COMPLETED },
                    _sum: { actualPrice: true }
                }).then(result => result._sum.actualPrice || 0)
            };

            const response: IMobileWorkOrderListResponse = {
                orders: mobileOrders,
                pagination: {
                    page: parsedPage,
                    limit: parsedLimit,
                    total: filteredOrders.length,
                    totalPages: Math.ceil(filteredOrders.length / parsedLimit)
                },
                summary
            };

            return ApiResult.success(response, 'Work orders retrieved successfully');
        } catch (error: any) {
            console.error('Error in getWorkOrders:', error);
            return ApiResult.error(error.message || 'Failed to fetch work orders', 500);
        }
    }

    /**
     * Get single work order details
     */
    public async getWorkOrderById(collectorId: string, orderId: string): Promise<ApiResult> {
        try {
            const order = await prisma.order.findFirst({
                where: {
                    id: orderId,
                    OR: [
                        { assignedCollectorId: collectorId },
                        {
                            crew: {
                                members: {
                                    some: {
                                        id: collectorId
                                    }
                                }
                            }
                        }
                    ]
                },
                include: {
                    yard: true,
                    crew: {
                        include: {
                            members: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    phone: true
                                }
                            }
                        }
                    },
                    orderTimeline: {
                        orderBy: {
                            createdAt: 'asc'
                        }
                    },
                    customer: {
                        select: {
                            id: true,
                            email: true,
                            phone: true
                        }
                    },
                    payment: true
                }
            });

            if (!order) {
                return ApiResult.error('Work order not found or not assigned to you', 404);
            }

            const mobileOrder = this.transformOrderToMobile(order);

            return ApiResult.success(mobileOrder, 'Work order retrieved successfully');
        } catch (error: any) {
            console.error('Error in getWorkOrderById:', error);
            return ApiResult.error(error.message || 'Failed to fetch work order', 500);
        }
    }

    /**
     * Update work order status (for collectors to update progress)
     */
    public async updateWorkOrderStatus(
        collectorId: string,
        orderId: string,
        data: IMobileUpdateWorkOrderStatusRequest
    ): Promise<ApiResult> {
        try {
            // Verify order is assigned to this collector
            const order = await prisma.order.findFirst({
                where: {
                    id: orderId,
                    OR: [
                        { assignedCollectorId: collectorId },
                        {
                            crew: {
                                members: {
                                    some: {
                                        id: collectorId
                                    }
                                }
                            }
                        }
                    ]
                }
            });

            if (!order) {
                return ApiResult.error('Work order not found or not assigned to you', 404);
            }

            // Validate status transition
            const validTransitions: Record<OrderStatus, OrderStatus[]> = {
                [OrderStatus.PENDING]: [OrderStatus.ASSIGNED, OrderStatus.CANCELLED],
                [OrderStatus.ASSIGNED]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
                [OrderStatus.IN_PROGRESS]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
                [OrderStatus.COMPLETED]: [], // Cannot change from completed
                [OrderStatus.CANCELLED]: [] // Cannot change from cancelled
            };

            if (!validTransitions[order.orderStatus].includes(data.status)) {
                return ApiResult.error(
                    `Invalid status transition from ${order.orderStatus} to ${data.status}`,
                    400
                );
            }

            // Update order
            const updateData: any = {
                orderStatus: data.status
            };

            if (data.actualPrice !== undefined) {
                updateData.actualPrice = data.actualPrice;
            }

            // Merge all photos (existing + completion + general photos)
            const existingPhotos = order.photos as any[] || [];
            const newPhotos: string[] = [];

            if (data.completionPhotos && data.completionPhotos.length > 0) {
                newPhotos.push(...data.completionPhotos);
            }

            if (data.photos && data.photos.length > 0) {
                newPhotos.push(...data.photos);
            }

            if (newPhotos.length > 0) {
                updateData.photos = [...existingPhotos, ...newPhotos];
            }

            const updatedOrder = await prisma.order.update({
                where: { id: orderId },
                data: updateData,
                include: {
                    yard: true,
                    crew: {
                        include: {
                            members: true
                        }
                    },
                    orderTimeline: true
                }
            });

            // Create timeline entry with custom timestamp if provided
            const timelineData: any = {
                orderId,
                status: data.status,
                notes: data.notes || `Status updated to ${data.status} by collector`,
                performedBy: collectorId,
                latitude: data.latitude,
                longitude: data.longitude
            };

            // Use custom timestamp if provided, otherwise use current time
            if (data.timestamp) {
                timelineData.createdAt = new Date(data.timestamp);
            }

            await prisma.orderTimeline.create({
                data: timelineData
            });

            const mobileOrder = this.transformOrderToMobile(updatedOrder);

            return ApiResult.success(mobileOrder, 'Work order status updated successfully');
        } catch (error: any) {
            console.error('Error in updateWorkOrderStatus:', error);
            return ApiResult.error(error.message || 'Failed to update work order status', 500);
        }
    }

    /**
     * Get collector statistics
     */
    public async getCollectorStats(collectorId: string): Promise<ApiResult> {
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
                        crew: {
                            members: {
                                some: {
                                    id: collectorId
                                }
                            }
                        }
                    }
                ]
            };

            // Today's stats
            const todayAssigned = await prisma.order.count({
                where: {
                    ...baseWhere,
                    createdAt: { gte: startOfToday },
                    orderStatus: { in: [OrderStatus.ASSIGNED, OrderStatus.IN_PROGRESS] }
                }
            });

            const todayCompleted = await prisma.order.count({
                where: {
                    ...baseWhere,
                    updatedAt: { gte: startOfToday },
                    orderStatus: OrderStatus.COMPLETED
                }
            });

            const todayRevenue = await prisma.order.aggregate({
                where: {
                    ...baseWhere,
                    updatedAt: { gte: startOfToday },
                    orderStatus: OrderStatus.COMPLETED
                },
                _sum: { actualPrice: true }
            });

            // This week's stats
            const weekAssigned = await prisma.order.count({
                where: {
                    ...baseWhere,
                    createdAt: { gte: startOfWeek },
                    orderStatus: { in: [OrderStatus.ASSIGNED, OrderStatus.IN_PROGRESS] }
                }
            });

            const weekCompleted = await prisma.order.count({
                where: {
                    ...baseWhere,
                    updatedAt: { gte: startOfWeek },
                    orderStatus: OrderStatus.COMPLETED
                }
            });

            const weekRevenue = await prisma.order.aggregate({
                where: {
                    ...baseWhere,
                    updatedAt: { gte: startOfWeek },
                    orderStatus: OrderStatus.COMPLETED
                },
                _sum: { actualPrice: true }
            });

            // This month's stats
            const monthAssigned = await prisma.order.count({
                where: {
                    ...baseWhere,
                    createdAt: { gte: startOfMonth },
                    orderStatus: { in: [OrderStatus.ASSIGNED, OrderStatus.IN_PROGRESS] }
                }
            });

            const monthCompleted = await prisma.order.count({
                where: {
                    ...baseWhere,
                    updatedAt: { gte: startOfMonth },
                    orderStatus: OrderStatus.COMPLETED
                }
            });

            const monthRevenue = await prisma.order.aggregate({
                where: {
                    ...baseWhere,
                    updatedAt: { gte: startOfMonth },
                    orderStatus: OrderStatus.COMPLETED
                },
                _sum: { actualPrice: true }
            });

            // Overall stats
            const totalCompleted = await prisma.order.count({
                where: {
                    ...baseWhere,
                    orderStatus: OrderStatus.COMPLETED
                }
            });

            const totalRevenue = await prisma.order.aggregate({
                where: {
                    ...baseWhere,
                    orderStatus: OrderStatus.COMPLETED
                },
                _sum: { actualPrice: true }
            });

            const totalAssigned = await prisma.order.count({
                where: baseWhere
            });

            // Get employee rating
            const employee = await prisma.employee.findUnique({
                where: { id: collectorId },
                select: { rating: true }
            });

            const stats: IMobileCollectorStats = {
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
                    averageRating: employee?.rating || 0,
                    completionRate: totalAssigned > 0 ? (totalCompleted / totalAssigned) * 100 : 0
                }
            };

            return ApiResult.success(stats, 'Collector statistics retrieved successfully');
        } catch (error: any) {
            console.error('Error in getCollectorStats:', error);
            return ApiResult.error(error.message || 'Failed to fetch collector statistics', 500);
        }
    }
}
