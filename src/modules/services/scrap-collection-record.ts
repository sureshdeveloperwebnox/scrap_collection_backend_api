import { prisma } from '../../config';
import { ApiResult } from '../../utils/api-result';
import { storageService } from '../../utils/storage.service';
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
     * Process image (handle Base64 or pass through URL)
     */
    private async processImage(image: string, folder: string): Promise<string> {
        if (!image || typeof image !== 'string') return image;

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
                const path = await storageService.uploadFile(buffer, fileName, folder, contentType);
                return path;
            } catch (error) {
                console.error('Error processing base64 image:', error);
                return image;
            }
        }

        return image;
    }

    /**
     * Process multiple images
     */
    private async processImages(images: string[], folder: string): Promise<string[]> {
        if (!images || !Array.isArray(images) || images.length === 0) return [];

        const uploadPromises = images.map(img => this.processImage(img, folder));
        return Promise.all(uploadPromises);
    }

    /**
     * Get helper data for the collection form
     * Returns work orders, scrap categories, and scrap names for the collector
     */
    public async getFormHelpers(collectorId: string): Promise<ApiResult> {
        try {
            // Get assigned work orders for this collector
            const workOrders = await (prisma.order as any).findMany({
                where: {
                    assignedCollectorId: collectorId,
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
            }) as any[];

            // Get collector's organization
            const collector = await prisma.employee.findUnique({
                where: { id: collectorId },
                select: { organizationId: true }
            });

            if (!collector) {
                return ApiResult.error('Collector not found', 404);
            }

            // Get scrap categories
            const scrapCategories = await prisma.scrap_categories.findMany({
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
            const scrapNames = await prisma.scrap_names.findMany({
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
                    orderNumber: (wo as any).orderNumber || 'N/A',
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

            // Resolve workOrderId if it's an orderNumber
            let resolvedWorkOrderId = data.workOrderId;
            if (data.workOrderId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.workOrderId)) {
                const order = await (prisma.order as any).findUnique({
                    where: { orderNumber: data.workOrderId },
                    select: { id: true }
                });
                if (order) {
                    resolvedWorkOrderId = order.id;
                }
            }

            // Verify scrap category exists
            const category = await prisma.scrap_categories.findUnique({
                where: { id: data.scrapCategoryId }
            });

            if (!category) {
                return ApiResult.error('Scrap category not found', 404);
            }

            // Verify scrap name if provided
            if (data.scrapNameId) {
                const scrapName = await prisma.scrap_names.findUnique({
                    where: { id: data.scrapNameId }
                });

                if (!scrapName) {
                    return ApiResult.error('Scrap name not found', 404);
                }
            }

            // Process photos and signatures (handle Base64)
            const recordFolder = `collections/${resolvedWorkOrderId || 'standalone'}/${Date.now()}`;

            const processedPhotos = data.photos ? await this.processImages(data.photos, `${recordFolder}/photos`) : [];
            const processedCustomerSignature = data.customerSignature ? await this.processImage(data.customerSignature, `${recordFolder}/signatures`) : undefined;
            const processedCollectorSignature = data.collectorSignature ? await this.processImage(data.collectorSignature, `${recordFolder}/signatures`) : undefined;

            // Create the record
            const record = await prisma.scrap_collection_records.create({
                data: {
                    workOrderId: resolvedWorkOrderId,
                    assignOrderId: data.assignOrderId,
                    customerId: data.customerId,
                    scrapCategoryId: data.scrapCategoryId,
                    scrapNameId: data.scrapNameId,
                    collectorId,
                    collectionDate: data.collectionDate ? new Date(data.collectionDate) : new Date(),
                    scrapDescription: data.scrapDescription,
                    scrapCondition: data.scrapCondition as any,
                    make: data.make,
                    model: data.model,
                    yearOfManufacture: data.yearOfManufacture,
                    weight: data.weight,
                    quantity: data.quantity,
                    quotedAmount: data.quotedAmount || 0,
                    finalAmount: data.finalAmount || 0,
                    photos: processedPhotos as any,
                    customerSignature: processedCustomerSignature,
                    collectorSignature: processedCollectorSignature,
                    collectionStatus: CollectionRecordStatus.SUBMITTED as any
                },
                include: {
                    scrap_categories: true,
                    scrap_names: true,
                    Order: {
                        select: {
                            id: true,
                            orderNumber: true
                        } as any
                    },
                    Customer: {
                        select: {
                            id: true,
                            name: true,
                            phone: true
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
                collectionStatus,
                workOrderId,
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
            if (collectionStatus) {
                if (Array.isArray(collectionStatus)) {
                    where.collectionStatus = { in: collectionStatus };
                } else {
                    where.collectionStatus = collectionStatus;
                }
            }

            // Work Order filter
            if (workOrderId) {
                where.workOrderId = workOrderId;
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
                    { scrapDescription: { contains: search, mode: 'insensitive' } },
                    { make: { contains: search, mode: 'insensitive' } },
                    { model: { contains: search, mode: 'insensitive' } }
                ];
            }

            const [records, total] = await Promise.all([
                prisma.scrap_collection_records.findMany({
                    where,
                    skip,
                    take: parsedLimit,
                    include: {
                        scrap_categories: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        scrap_names: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        Order: {
                            select: {
                                id: true,
                                orderNumber: true
                            } as any
                        }
                    },
                    orderBy: {
                        [sortBy]: sortOrder
                    }
                }),
                prisma.scrap_collection_records.count({ where })
            ]);

            // Calculate summary
            const summary = {
                totalRecords: total,
                totalAmount: await prisma.scrap_collection_records.aggregate({
                    where,
                    _sum: { finalAmount: true }
                }).then(result => result._sum.finalAmount || 0),
                submittedCount: await prisma.scrap_collection_records.count({
                    where: { ...where, collectionStatus: CollectionRecordStatus.SUBMITTED }
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
            const record = await prisma.scrap_collection_records.findFirst({
                where: {
                    id: recordId,
                    collectorId
                },
                include: {
                    scrap_categories: true,
                    scrap_names: true,
                    Order: true,
                    Customer: true,
                    Employee: {
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
            const existingRecord = await prisma.scrap_collection_records.findFirst({
                where: {
                    id: recordId,
                    collectorId
                }
            });

            if (!existingRecord) {
                return ApiResult.error('Collection record not found or not authorized', 404);
            }

            const updateData: any = { ...data };

            if (data.collectionDate) {
                updateData.collectionDate = new Date(data.collectionDate);
            }

            // Resolve workOrderId if it's an orderNumber
            if (data.workOrderId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.workOrderId)) {
                const order = await (prisma.order as any).findUnique({
                    where: { orderNumber: data.workOrderId },
                    select: { id: true }
                });
                if (order) {
                    updateData.workOrderId = order.id;
                }
            }

            // Process photos and signatures if provided (handle Base64)
            const recordFolder = `collections/${existingRecord.workOrderId || 'standalone'}/${existingRecord.id}`;

            if (data.photos) {
                updateData.photos = await this.processImages(data.photos, `${recordFolder}/photos`);
            }
            if (data.customerSignature) {
                updateData.customerSignature = await this.processImage(data.customerSignature, `${recordFolder}/signatures`);
            }
            if (data.collectorSignature) {
                updateData.collectorSignature = await this.processImage(data.collectorSignature, `${recordFolder}/signatures`);
            }

            const record = await prisma.scrap_collection_records.update({
                where: { id: recordId },
                data: updateData as any,
                include: {
                    scrap_categories: true,
                    scrap_names: true,
                    Order: true,
                    Customer: true
                }
            });

            return ApiResult.success(record, 'Collection record updated successfully');
        } catch (error: any) {
            console.error('Error in updateRecord:', error);
            return ApiResult.error(error.message || 'Failed to update collection record', 500);
        }
    }

    /**
     * Delete a collection record
     */
    public async deleteRecord(collectorId: string, recordId: string): Promise<ApiResult> {
        try {
            const record = await prisma.scrap_collection_records.findFirst({
                where: {
                    id: recordId,
                    collectorId
                }
            });

            if (!record) {
                return ApiResult.error('Collection record not found or not authorized', 404);
            }

            await prisma.scrap_collection_records.delete({
                where: { id: recordId }
            });

            return ApiResult.success(null, 'Collection record deleted successfully');
        } catch (error: any) {
            console.error('Error in deleteRecord:', error);
            return ApiResult.error(error.message || 'Failed to delete collection record', 500);
        }
    }
}
