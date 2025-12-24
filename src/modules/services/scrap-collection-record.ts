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

            // Resolve detailed data from Order or Customer
            let resolvedOrderId = data.orderId;
            let resolvedCustomerId = data.customerId;
            let customerName = (data as any).customerName;
            let customerPhone = (data as any).customerPhone;
            let customerAddress = (data as any).customerAddress;
            let customerEmail = (data as any).customerEmail;

            // Financial defaults
            let quotedAmount = data.quotedAmount || 0;
            let baseAmount = data.baseAmount || 0;
            let finalAmount = data.finalAmount || 0;

            if (data.orderId) {
                const order = await prisma.order.findFirst({
                    where: {
                        OR: [
                            { id: data.orderId },
                            { orderNumber: data.orderId }
                        ]
                    },
                    select: {
                        id: true,
                        customerId: true,
                        customerName: true,
                        customerPhone: true,
                        customerEmail: true,
                        address: true,
                        quotedPrice: true
                    }
                });

                if (order) {
                    resolvedOrderId = order.id;
                    resolvedCustomerId = order.customerId || resolvedCustomerId;
                    customerName = customerName || order.customerName;
                    customerPhone = customerPhone || order.customerPhone;
                    customerEmail = customerEmail || order.customerEmail;
                    customerAddress = customerAddress || order.address;

                    // Default amounts from order if not provided in payload
                    quotedAmount = data.quotedAmount ?? order.quotedPrice ?? 0;
                    baseAmount = data.baseAmount ?? order.quotedPrice ?? 0;
                    finalAmount = data.finalAmount ?? order.quotedPrice ?? 0;
                }
            }

            // Fallback: If still missing customer info, try to fetch from Customer model directly
            if (resolvedCustomerId && (!customerName || !customerPhone || !customerAddress)) {
                const customer = await prisma.customer.findUnique({
                    where: { id: resolvedCustomerId },
                    select: { name: true, phone: true, address: true, email: true }
                });

                if (customer) {
                    customerName = customerName || customer.name;
                    customerPhone = customerPhone || customer.phone;
                    customerAddress = customerAddress || customer.address;
                    customerEmail = customerEmail || customer.email;
                }
            }

            // Final validation for mandatory DB fields
            if (!customerName || !customerPhone || !customerAddress) {
                return ApiResult.error('Customer name, phone, and address are required and could not be resolved from the order or customer ID', 400);
            }

            // Process photos and signatures (handle Base64)
            const recordFolder = `collections/${resolvedOrderId || 'standalone'}/${Date.now()}`;

            const processedPhotos = data.photos ? await this.processImages(data.photos, `${recordFolder}/photos`) : [];
            const processedBeforePhotos = data.beforePhotos ? await this.processImages(data.beforePhotos, `${recordFolder}/before`) : [];
            const processedAfterPhotos = data.afterPhotos ? await this.processImages(data.afterPhotos, `${recordFolder}/after`) : [];

            const processedCustomerSignature = data.customerSignature ? await this.processImage(data.customerSignature, `${recordFolder}/signatures`) : undefined;
            const processedCollectorSignature = data.collectorSignature ? await this.processImage(data.collectorSignature, `${recordFolder}/signatures`) : undefined;
            const processedEmployeeSignature = data.employeeSignature ? await this.processImage(data.employeeSignature, `${recordFolder}/signatures`) : undefined;

            // Create the record with auto-filled organizationId
            const record = await prisma.scrapCollectionRecord.create({
                data: {
                    ...data,
                    orderId: resolvedOrderId,
                    customerId: resolvedCustomerId,
                    customerName,
                    customerPhone,
                    customerEmail,
                    customerAddress,
                    quotedAmount,
                    baseAmount,
                    finalAmount,
                    collectorId,
                    organizationId: collector.organizationId,
                    status: CollectionRecordStatus.DRAFT,
                    dimensions: data.dimensions as any,
                    photos: processedPhotos as any,
                    beforePhotos: processedBeforePhotos as any,
                    afterPhotos: processedAfterPhotos as any,
                    customerSignature: processedCustomerSignature,
                    collectorSignature: processedCollectorSignature,
                    employeeSignature: processedEmployeeSignature
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

            // Process photos and signatures if provided (handle Base64)
            const recordFolder = `collections/${existingRecord.orderId || 'standalone'}/${existingRecord.id}`;

            if (data.photos) {
                updateData.photos = await this.processImages(data.photos, `${recordFolder}/photos`);
            }
            if (data.beforePhotos) {
                updateData.beforePhotos = await this.processImages(data.beforePhotos, `${recordFolder}/before`);
            }
            if (data.afterPhotos) {
                updateData.afterPhotos = await this.processImages(data.afterPhotos, `${recordFolder}/after`);
            }
            if (data.customerSignature) {
                updateData.customerSignature = await this.processImage(data.customerSignature, `${recordFolder}/signatures`);
            }
            if (data.collectorSignature) {
                updateData.collectorSignature = await this.processImage(data.collectorSignature, `${recordFolder}/signatures`);
            }
            if (data.employeeSignature) {
                updateData.employeeSignature = await this.processImage(data.employeeSignature, `${recordFolder}/signatures`);
            }

            // Handle JSON fields
            if (data.dimensions) updateData.dimensions = data.dimensions as any;

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
