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
                select: {
                    id: true
                }
            });

            return ApiResult.success({ id: record.id }, 'Collection record created successfully', 201);
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
     * Get collection records by work order ID (for dashboard/admin access)
     */
    public async getRecordsByWorkOrder(workOrderId: string): Promise<ApiResult> {
        try {
            const records = await prisma.scrap_collection_records.findMany({
                where: {
                    workOrderId
                },
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
                    },
                    Customer: {
                        select: {
                            id: true,
                            name: true,
                            phone: true
                        }
                    },
                    Employee: {
                        select: {
                            id: true,
                            fullName: true,
                            phone: true,
                            email: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            return ApiResult.success({ records }, 'Collection records retrieved successfully');
        } catch (error: any) {
            console.error('Error in getRecordsByWorkOrder:', error);
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

    /**
     * Generate PDF for a scrap collection record
     */
    public async generatePDF(collectorId: string, recordId: string): Promise<ApiResult> {
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
                            phone: true,
                            email: true
                        }
                    }
                }
            });

            if (!record) {
                return ApiResult.error('Collection record not found or not authorized', 404);
            }

            // Generate HTML for PDF
            const html = this.generatePDFHTML(record);

            return ApiResult.success({ html, record }, 'PDF data generated successfully');
        } catch (error: any) {
            console.error('Error in generatePDF:', error);
            return ApiResult.error(error.message || 'Failed to generate PDF', 500);
        }
    }

    /**
     * Get PDF data by record ID (for dashboard/admin access)
     */
    public async getPDFDataById(recordId: string): Promise<ApiResult> {
        try {
            const record = await prisma.scrap_collection_records.findFirst({
                where: { id: recordId },
                include: {
                    scrap_categories: true,
                    scrap_names: true,
                    Order: true,
                    Customer: true,
                    Employee: {
                        select: {
                            id: true,
                            fullName: true,
                            phone: true,
                            email: true
                        }
                    }
                }
            });

            if (!record) {
                return ApiResult.error('Collection record not found', 404);
            }

            // Generate HTML for PDF
            const html = this.generatePDFHTML(record);

            return ApiResult.success({ html, record }, 'PDF data generated successfully');
        } catch (error: any) {
            console.error('Error in getPDFDataById:', error);
            return ApiResult.error(error.message || 'Failed to generate PDF data', 500);
        }
    }

    /**
     * Generate HTML content for PDF
     */
    private generatePDFHTML(record: any): string {
        const formatDate = (date: Date) => {
            return new Date(date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        };

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Scrap Collection Record - ${record.Order?.orderNumber || record.id}</title>
    <style>
        @page { size: A4; margin: 15mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 11pt; color: #1a1a1a; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th, td { padding: 10px; text-align: left; vertical-align: top; }
        th { background: #1e40af; color: white; font-weight: bold; font-size: 10pt; text-transform: uppercase; }
        td { border: 1px solid #e5e7eb; background: #f9fafb; }
        .label { font-size: 8pt; color: #6b7280; font-weight: bold; text-transform: uppercase; margin-bottom: 3px; }
        .value { font-size: 10pt; color: #1a1a1a; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 8pt; font-weight: bold; text-transform: uppercase; }
        .status-submitted { background: #fef3c7; color: #92400e; border: 1px solid #fbbf24; }
        .status-approved { background: #d1fae5; color: #065f46; border: 1px solid #10b981; }
        .status-rejected { background: #fee2e2; color: #991b1b; border: 1px solid #ef4444; }
        .status-completed { background: #dbeafe; color: #1e40af; border: 1px solid #3b82f6; }
        @media print { body { margin: 0; padding: 0; } table { page-break-inside: avoid; } }
    </style>
</head>
<body>
    <div style="border-bottom: 4px solid #1e40af; padding-bottom: 15px; margin-bottom: 20px;">
        <h1 style="font-size: 24pt; font-weight: bold; color: #1e40af; margin-bottom: 5px;">AUSSIE SCRAPX</h1>
        <h2 style="font-size: 14pt; color: #4b5563; font-weight: 600; margin-bottom: 8px;">Scrap Collection Record</h2>
        <div style="font-size: 9pt; color: #6b7280;">
            <span><strong>Record ID:</strong> ${record.id.substring(0, 8).toUpperCase()}</span> | 
            <span><strong>Generated:</strong> ${formatDate(new Date())} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
    </div>

    <table><thead><tr><th colspan="2">📋 WORK ORDER INFORMATION</th></tr></thead><tbody>
        <tr>
            <td style="width: 50%;"><div class="label">WORK ORDER NUMBER</div><div class="value">${record.Order?.orderNumber || 'N/A'}</div></td>
            <td style="width: 50%;"><div class="label">COLLECTION DATE</div><div class="value">${formatDate(record.collectionDate)}</div></td>
        </tr>
        <tr>
            <td><div class="label">STATUS</div><div class="value"><span class="status-badge status-${record.collectionStatus.toLowerCase()}">${record.collectionStatus}</span></div></td>
            <td><div class="label">COLLECTOR</div><div class="value">${record.Employee?.fullName || 'N/A'}</div></td>
        </tr>
    </tbody></table>

    <table><thead><tr><th colspan="2">👤 CUSTOMER INFORMATION</th></tr></thead><tbody>
        <tr>
            <td style="width: 50%;"><div class="label">CUSTOMER NAME</div><div class="value">${record.Customer?.name || 'N/A'}</div></td>
            <td style="width: 50%;"><div class="label">PHONE NUMBER</div><div class="value">${record.Customer?.phone || 'N/A'}</div></td>
        </tr>
    </tbody></table>

    <table><thead><tr><th colspan="3">♻️ SCRAP DETAILS</th></tr></thead><tbody>
        <tr>
            <td style="width: 33.33%;"><div class="label">CATEGORY</div><div class="value">${record.scrap_categories?.name || 'N/A'}</div></td>
            <td style="width: 33.33%;"><div class="label">SCRAP NAME</div><div class="value">${record.scrap_names?.name || 'N/A'}</div></td>
            <td style="width: 33.33%;"><div class="label">CONDITION</div><div class="value">${record.scrapCondition}</div></td>
        </tr>
        <tr>
            <td><div class="label">WEIGHT (KG)</div><div class="value">${record.weight ? `${record.weight} kg` : 'N/A'}</div></td>
            <td><div class="label">QUANTITY</div><div class="value">${record.quantity || 'N/A'}</div></td>
            <td><div class="label">MAKE</div><div class="value">${record.make || 'N/A'}</div></td>
        </tr>
        <tr>
            <td><div class="label">MODEL</div><div class="value">${record.model || 'N/A'}</div></td>
            <td><div class="label">YEAR</div><div class="value">${record.yearOfManufacture || 'N/A'}</div></td>
            <td></td>
        </tr>
        ${record.scrapDescription ? `<tr><td colspan="3"><div class="label">DESCRIPTION</div><div class="value">${record.scrapDescription}</div></td></tr>` : ''}
    </tbody></table>

    <table><thead><tr><th colspan="2">💰 PRICING INFORMATION</th></tr></thead><tbody>
        <tr>
            <td style="width: 50%; text-align: center; padding: 20px; border: 2px solid #e5e7eb;">
                <div class="label">QUOTED AMOUNT</div>
                <div style="font-size: 18pt; font-weight: bold; color: #1a1a1a; margin-top: 5px;">₹${record.quotedAmount.toFixed(2)}</div>
            </td>
            <td style="width: 50%; text-align: center; padding: 20px; border: 2px solid #10b981; background: #f0fdf4;">
                <div class="label">FINAL AMOUNT</div>
                <div style="font-size: 18pt; font-weight: bold; color: #059669; margin-top: 5px;">₹${record.finalAmount.toFixed(2)}</div>
            </td>
        </tr>
    </tbody></table>

    ${record.photos && Array.isArray(record.photos) && record.photos.length > 0 ? `
    <table><thead><tr><th colspan="3">📸 COLLECTION PHOTOS</th></tr></thead><tbody>
        <tr>
            ${record.photos.slice(0, 3).map((photo: string, index: number) => `
                <td style="width: 33.33%; text-align: center; padding: 10px;">
                    <img src="${photo}" alt="Photo ${index + 1}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px;" />
                    <div style="font-size: 8pt; color: #6b7280; margin-top: 5px;">Photo ${index + 1}</div>
                </td>
            `).join('')}
        </tr>
    </tbody></table>
    ` : ''}

    <table><thead><tr><th colspan="2">✍️ SIGNATURES</th></tr></thead><tbody>
        <tr>
            <td style="width: 50%; text-align: center; padding: 20px; border: 2px dashed #d1d5db; background: #f9fafb;">
                <div class="label" style="margin-bottom: 10px;">CUSTOMER SIGNATURE</div>
                ${record.customerSignature ? `
                    <img src="${record.customerSignature}" alt="Customer Signature" style="max-width: 180px; max-height: 80px;" />
                    <div style="font-size: 9pt; font-weight: 600; margin-top: 8px;">${record.Customer?.name || ''}</div>
                ` : '<div style="color: #9ca3af; font-style: italic;">No signature</div>'}
            </td>
            <td style="width: 50%; text-align: center; padding: 20px; border: 2px dashed #d1d5db; background: #f9fafb;">
                <div class="label" style="margin-bottom: 10px;">COLLECTOR SIGNATURE</div>
                ${record.collectorSignature ? `
                    <img src="${record.collectorSignature}" alt="Collector Signature" style="max-width: 180px; max-height: 80px;" />
                    <div style="font-size: 9pt; font-weight: 600; margin-top: 8px;">${record.Employee?.fullName || ''}</div>
                ` : '<div style="color: #9ca3af; font-style: italic;">No signature</div>'}
            </td>
        </tr>
    </tbody></table>

    <div style="margin-top: 30px; padding-top: 15px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 8pt;">
        <div>This is a computer-generated document. Generated on ${formatDate(new Date())} at ${new Date().toLocaleTimeString('en-GB')} | AUSSIE SCRAPX © ${new Date().getFullYear()}</div>
    </div>
</body>
</html>
        `;
    }
}
