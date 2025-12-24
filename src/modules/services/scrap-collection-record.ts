import { prisma } from '../../config';
import { ApiResult } from '../../utils/api-result';
import {
    ICreateScrapCollectionRecord,
    IUpdateScrapCollectionRecord,
    IScrapCollectionRecordQueryParams,
    IScrapCollectionRecordListResponse,
    ICollectionFormHelpers
} from '../model/scrap-collection-record.model';
import { CollectionRecordStatus } from '../model/enum';

export class ScrapCollectionRecordService {
    /**
     * Get helper data for the collection form
     * Returns work orders, scrap categories, and scrap names for the collector
     */
    public async getFormHelpers(collectorId: string): Promise<ApiResult> {
        try {
            // Get assigned work orders for this collector
            const workOrders = await prisma.order.findMany({
                where: {
                    OR: [
                        { assignedCollectorId: collectorId },
                        {
                            crew: {
                                members: {
                                    some: { id: collectorId }
                                }
                            }
                        }
                    ],
                    orderStatus: { in: ['ASSIGNED', 'IN_PROGRESS'] }
                },
                select: {
                    id: true,
                    orderNumber: true,
                    customerName: true,
                    customerPhone: true,
                    address: true,
                    customerId: true,
                    customerEmail: true
                },
                orderBy: { createdAt: 'desc' },
                take: 50
            });

            // Get collector's organization
            const collector = await prisma.employee.findUnique({
                where: { id: collectorId },
                select: { organizationId: true }
            });

            if (!collector) {
                return ApiResult.error('Collector not found', 404);
            }

            // Get scrap categories
            const scrapCategories = await prisma.scrapCategory.findMany({
                where: {
                    organizationId: collector.organizationId,
                    isActive: true
                },
                select: {
                    id: true,
                    name: true,
                    description: true
                },
                orderBy: { name: 'asc' }
            });

            // Get all scrap names
            const scrapNames = await prisma.scrapName.findMany({
                where: {
                    organizationId: collector.organizationId,
                    isActive: true
                },
                select: {
                    id: true,
                    name: true,
                    scrapCategoryId: true
                },
                orderBy: { name: 'asc' }
            });

            const helpers: ICollectionFormHelpers = {
                workOrders: workOrders.map(wo => ({
                    id: wo.id,
                    orderNumber: wo.orderNumber || 'N/A',
                    customerName: wo.customerName,
                    customerPhone: wo.customerPhone,
                    address: wo.address
                })),
                scrapCategories: scrapCategories.map(sc => ({
                    id: sc.id,
                    name: sc.name,
                    description: sc.description || undefined
                })),
                scrapNames: scrapNames.map(sn => ({
                    id: sn.id,
                    name: sn.name,
                    categoryId: sn.scrapCategoryId
                }))
            };

            return ApiResult.success(helpers, 'Form helpers retrieved successfully');
        } catch (error: any) {
            console.error('Error in getFormHelpers:', error);
            return ApiResult.error(error.message || 'Failed to fetch form helpers', 500);
        }
    }

    /**
     * Create a new scrap collection record
     */
    public async createRecord(
        collectorId: string,
        data: ICreateScrapCollectionRecord
    ): Promise<ApiResult> {
        try {
            // Get collector's organization
            const collector = await prisma.employee.findUnique({
                where: { id: collectorId },
                select: { organizationId: true }
            });

            if (!collector) {
                return ApiResult.error('Collector not found', 404);
            }

            // Verify scrap category exists
            const category = await prisma.scrapCategory.findUnique({
                where: { id: data.scrapCategoryId }
            });

            if (!category) {
                return ApiResult.error('Scrap category not found', 404);
            }

            // Verify scrap name if provided
            if (data.scrapNameId) {
                const scrapName = await prisma.scrapName.findUnique({
                    where: { id: data.scrapNameId }
                });

                if (!scrapName) {
                    return ApiResult.error('Scrap name not found', 404);
                }
            }

            // Resolve actual order ID if provided as orderNumber
            let resolvedOrderId = data.orderId;
            let resolvedCustomerId = data.customerId;

            if (data.orderId) {
                const order = await prisma.order.findFirst({
                    where: {
                        OR: [
                            { id: data.orderId },
                            { orderNumber: data.orderId }
                        ]
                    },
                    select: { id: true, customerId: true }
                });

                if (order) {
                    resolvedOrderId = order.id;
                    // If customerId wasn't provided, use the one from the order
                    if (!resolvedCustomerId && order.customerId) {
                        resolvedCustomerId = order.customerId;
                    }
                }
            }

            // Create the record with auto-filled organizationId
            const record = await prisma.scrapCollectionRecord.create({
                data: {
                    ...data,
                    orderId: resolvedOrderId,
                    customerId: resolvedCustomerId,
                    collectorId,
                    organizationId: collector.organizationId,
                    status: CollectionRecordStatus.DRAFT,
                    dimensions: data.dimensions as any,
                    photos: data.photos as any,
                    beforePhotos: data.beforePhotos as any,
                    afterPhotos: data.afterPhotos as any
                },
                include: {
                    scrapCategory: true,
                    scrapName: true,
                    order: {
                        select: {
                            id: true,
                            orderNumber: true
                        }
                    },
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            phone: true
                        }
                    },
                    scrapYard: {
                        select: {
                            id: true,
                            yardName: true
                        }
                    }
                }
            });

            return ApiResult.success(record, 'Collection record created successfully', 201);
        } catch (error: any) {
            console.error('Error in createRecord:', error);
            return ApiResult.error(error.message || 'Failed to create collection record', 500);
        }
    }

    /**
     * Get collection records with filtering
     */
    public async getRecords(
        collectorId: string,
        query: IScrapCollectionRecordQueryParams
    ): Promise<ApiResult> {
        try {
            const {
                page = 1,
                limit = 20,
                status,
                orderId,
                customerId,
                scrapCategoryId,
                dateFrom,
                dateTo,
                search,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = query;

            const parsedPage = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
            const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 20;
            const skip = (parsedPage - 1) * parsedLimit;

            const where: any = {
                collectorId
            };

            // Status filter
            if (status) {
                if (Array.isArray(status)) {
                    where.status = { in: status };
                } else {
                    where.status = status;
                }
            }

            // Order filter
            if (orderId) {
                where.orderId = orderId;
            }

            // Customer filter
            if (customerId) {
                where.customerId = customerId;
            }

            // Scrap category filter
            if (scrapCategoryId) {
                where.scrapCategoryId = scrapCategoryId;
            }

            // Date range filter
            if (dateFrom || dateTo) {
                where.collectionDate = {};
                if (dateFrom) where.collectionDate.gte = new Date(dateFrom);
                if (dateTo) where.collectionDate.lte = new Date(dateTo);
            }

            // Search filter
            if (search) {
                where.OR = [
                    { customerName: { contains: search, mode: 'insensitive' } },
                    { customerPhone: { contains: search, mode: 'insensitive' } },
                    { scrapDescription: { contains: search, mode: 'insensitive' } }
                ];
            }

            const [records, total] = await Promise.all([
                prisma.scrapCollectionRecord.findMany({
                    where,
                    skip,
                    take: parsedLimit,
                    include: {
                        scrapCategory: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        scrapName: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        order: {
                            select: {
                                id: true,
                                orderNumber: true
                            }
                        },
                        scrapYard: {
                            select: {
                                id: true,
                                yardName: true
                            }
                        }
                    },
                    orderBy: {
                        [sortBy]: sortOrder
                    }
                }),
                prisma.scrapCollectionRecord.count({ where })
            ]);

            // Calculate summary
            const summary = {
                totalRecords: total,
                totalAmount: await prisma.scrapCollectionRecord.aggregate({
                    where,
                    _sum: { finalAmount: true }
                }).then(result => result._sum.finalAmount || 0),
                draftCount: await prisma.scrapCollectionRecord.count({
                    where: { ...where, status: CollectionRecordStatus.DRAFT }
                }),
                submittedCount: await prisma.scrapCollectionRecord.count({
                    where: { ...where, status: CollectionRecordStatus.SUBMITTED }
                }),
                approvedCount: await prisma.scrapCollectionRecord.count({
                    where: { ...where, status: CollectionRecordStatus.APPROVED }
                })
            };

            const response: IScrapCollectionRecordListResponse = {
                records,
                pagination: {
                    page: parsedPage,
                    limit: parsedLimit,
                    total,
                    totalPages: Math.ceil(total / parsedLimit)
                },
                summary
            };

            return ApiResult.success(response, 'Collection records retrieved successfully');
        } catch (error: any) {
            console.error('Error in getRecords:', error);
            return ApiResult.error(error.message || 'Failed to fetch collection records', 500);
        }
    }

    /**
     * Get single collection record by ID
     */
    public async getRecordById(collectorId: string, recordId: string): Promise<ApiResult> {
        try {
            const record = await prisma.scrapCollectionRecord.findFirst({
                where: {
                    id: recordId,
                    collectorId
                },
                include: {
                    scrapCategory: true,
                    scrapName: true,
                    order: true,
                    customer: true,
                    scrapYard: true,
                    collector: {
                        select: {
                            id: true,
                            fullName: true,
                            phone: true
                        }
                    }
                }
            });

            if (!record) {
                return ApiResult.error('Collection record not found or not authorized', 404);
            }

            return ApiResult.success(record, 'Collection record retrieved successfully');
        } catch (error: any) {
            console.error('Error in getRecordById:', error);
            return ApiResult.error(error.message || 'Failed to fetch collection record', 500);
        }
    }

    /**
     * Update a collection record
     */
    public async updateRecord(
        collectorId: string,
        recordId: string,
        data: IUpdateScrapCollectionRecord
    ): Promise<ApiResult> {
        try {
            // Verify record exists and belongs to collector
            const existingRecord = await prisma.scrapCollectionRecord.findFirst({
                where: {
                    id: recordId,
                    collectorId
                }
            });

            if (!existingRecord) {
                return ApiResult.error('Collection record not found or not authorized', 404);
            }

            // Don't allow updates to approved/completed records
            if (existingRecord.status === CollectionRecordStatus.APPROVED ||
                existingRecord.status === CollectionRecordStatus.COMPLETED) {
                return ApiResult.error('Cannot update approved or completed records', 400);
            }

            const updateData: any = { ...data };

            // Handle JSON fields
            if (data.dimensions) updateData.dimensions = data.dimensions as any;
            if (data.photos) updateData.photos = data.photos as any;
            if (data.beforePhotos) updateData.beforePhotos = data.beforePhotos as any;
            if (data.afterPhotos) updateData.afterPhotos = data.afterPhotos as any;

            // Set submittedAt if status is being changed to SUBMITTED
            if (data.status === CollectionRecordStatus.SUBMITTED && !existingRecord.submittedAt) {
                updateData.submittedAt = new Date();
            }

            const record = await prisma.scrapCollectionRecord.update({
                where: { id: recordId },
                data: updateData,
                include: {
                    scrapCategory: true,
                    scrapName: true,
                    order: true,
                    customer: true,
                    scrapYard: true
                }
            });

            return ApiResult.success(record, 'Collection record updated successfully');
        } catch (error: any) {
            console.error('Error in updateRecord:', error);
            return ApiResult.error(error.message || 'Failed to update collection record', 500);
        }
    }

    /**
     * Delete a collection record (only drafts)
     */
    public async deleteRecord(collectorId: string, recordId: string): Promise<ApiResult> {
        try {
            const record = await prisma.scrapCollectionRecord.findFirst({
                where: {
                    id: recordId,
                    collectorId
                }
            });

            if (!record) {
                return ApiResult.error('Collection record not found or not authorized', 404);
            }

            // Only allow deleting draft records
            if (record.status !== CollectionRecordStatus.DRAFT) {
                return ApiResult.error('Can only delete draft records', 400);
            }

            await prisma.scrapCollectionRecord.delete({
                where: { id: recordId }
            });

            return ApiResult.success(null, 'Collection record deleted successfully');
        } catch (error: any) {
            console.error('Error in deleteRecord:', error);
            return ApiResult.error(error.message || 'Failed to delete collection record', 500);
        }
    }
}
