import { prisma } from '../../config/db.config';
import { CreateInvoiceDto, UpdateInvoiceDto } from '../model/invoice.model';
import { InvoiceStatus } from '@prisma/client';

export class InvoiceService {
    async createInvoice(data: CreateInvoiceDto, organizationId: number) {
        const { items, ...invoiceData } = data;

        const invoice = await prisma.invoice.create({
            data: {
                ...invoiceData,
                invoiceDate: new Date(data.invoiceDate),
                dueDate: new Date(data.dueDate),
                organizationId,
                items: {
                    create: items.map(item => ({
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        amount: item.amount,
                    })),
                },
            },
            include: {
                items: true,
                Customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        address: true,
                    },
                },
                WorkOrder: {
                    select: {
                        id: true,
                        orderNumber: true,
                        orderStatus: true,
                    },
                },
            },
        });

        return invoice;
    }

    async getInvoices(
        organizationId: number,
        page: number = 1,
        limit: number = 10,
        status?: InvoiceStatus,
        customerId?: string,
        workOrderId?: string,
        search?: string
    ) {
        const skip = (page - 1) * limit;

        const where: any = {
            organizationId,
        };

        if (status) {
            where.status = status;
        }

        if (customerId) {
            where.customerId = customerId;
        }

        if (workOrderId) {
            where.workOrderId = workOrderId;
        }

        if (search) {
            where.OR = [
                { invoiceNumber: { contains: search, mode: 'insensitive' } },
                { Customer: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({
                where,
                skip,
                take: limit,
                include: {
                    items: true,
                    Customer: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                        },
                    },
                    WorkOrder: {
                        select: {
                            id: true,
                            orderNumber: true,
                            orderStatus: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            prisma.invoice.count({ where }),
        ]);

        return {
            invoices,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getInvoiceById(id: string, organizationId: number) {
        const invoice = await prisma.invoice.findFirst({
            where: {
                id,
                organizationId,
            },
            include: {
                items: true,
                Customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        address: true,
                    },
                },
                WorkOrder: {
                    include: {
                        scrap_yards: true
                    }
                },
                Organization: true,
            },
        });

        if (!invoice) {
            throw new Error('Invoice not found');
        }

        return invoice;
    }

    async updateInvoice(id: string, data: UpdateInvoiceDto, organizationId: number) {
        const { items, ...updateData } = data;

        const updatedInvoice = await prisma.invoice.update({
            where: { id, organizationId },
            data: {
                ...updateData,
                ...(data.invoiceDate && { invoiceDate: new Date(data.invoiceDate) }),
                ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
                ...(items && {
                    items: {
                        deleteMany: {},
                        create: items.map(item => ({
                            description: item.description,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            amount: item.amount,
                        })),
                    },
                }),
            },
            include: {
                items: true,
                Customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                WorkOrder: {
                    select: {
                        id: true,
                        orderNumber: true,
                        orderStatus: true,
                    },
                },
            },
        });

        return updatedInvoice;
    }

    async updateInvoiceStatus(id: string, status: InvoiceStatus, organizationId: number) {
        const invoice = await prisma.invoice.update({
            where: { id, organizationId },
            data: { status },
        });

        return invoice;
    }

    async deleteInvoice(id: string, organizationId: number) {
        await prisma.invoice.delete({
            where: { id, organizationId },
        });

        return { message: 'Invoice deleted successfully' };
    }

    async getInvoiceStats(organizationId: number) {
        const [total, draft, sent, paid, overdue, cancelled] = await Promise.all([
            prisma.invoice.count({ where: { organizationId } }),
            prisma.invoice.count({ where: { organizationId, status: 'DRAFT' } }),
            prisma.invoice.count({ where: { organizationId, status: 'SENT' } }),
            prisma.invoice.count({ where: { organizationId, status: 'PAID' } }),
            prisma.invoice.count({ where: { organizationId, status: 'OVERDUE' } }),
            prisma.invoice.count({ where: { organizationId, status: 'CANCELLED' } }),
        ]);

        const totalRevenue = await prisma.invoice.aggregate({
            where: { organizationId, status: 'PAID' },
            _sum: { total: true },
        });

        const pendingRevenue = await prisma.invoice.aggregate({
            where: { organizationId, status: { in: ['SENT', 'OVERDUE'] } },
            _sum: { total: true },
        });

        return {
            total,
            draft,
            sent,
            paid,
            overdue,
            cancelled,
            totalRevenue: totalRevenue._sum.total || 0,
            pendingRevenue: pendingRevenue._sum.total || 0,
        };
    }

    async getInvoicesByCustomer(customerId: string, organizationId: number) {
        return prisma.invoice.findMany({
            where: { customerId, organizationId },
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getInvoicesByWorkOrder(workOrderId: string, organizationId: number) {
        return prisma.invoice.findMany({
            where: { workOrderId, organizationId },
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async generatePDF(id: string, organizationId: number) {
        const invoice = await this.getInvoiceById(id, organizationId);
        const html = this.generatePDFHTML(invoice);
        return { html, invoice };
    }

    private numberToWords(num: number): string {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

        const convert = (n: number): string => {
            if (n < 10) return ones[n];
            if (n < 20) return teens[n - 10];
            if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
            if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
            if (n < 1000000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
            return n.toString();
        };

        if (num === 0) return 'Zero';
        const parts = num.toFixed(2).split('.');
        let result = convert(parseInt(parts[0])) + ' Dollars';
        if (parts.length > 1 && parseInt(parts[1]) > 0) {
            result += ' and ' + convert(parseInt(parts[1])) + ' Cents';
        }
        return result + ' Only';
    }

    private formatCurrency(amount: number): string {
        return amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    private generatePDFHTML(invoice: any): string {
        const formatDate = (date: Date) => {
            return new Date(date).toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        };

        const org = invoice.Organization || {
            name: 'AUSSIE SCRAPX',
            address: '123 Scrap Yard Way, Melbourne VIC',
            phone: '+61 400 000 000',
            email: 'billing@aussiescrapx.com',
            website: 'www.aussiescrapx.com'
        };

        const yard = invoice.WorkOrder?.scrap_yards;
        const amountInWords = this.numberToWords(invoice.total);

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice - ${invoice.invoiceNumber}</title>
    <style>
        @page { size: A4; margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            font-size: 9pt; 
            color: #1a1a1a; 
            line-height: 1.5; 
            background: #f3f4f6; /* Gray background for web preview */
            display: flex;
            justify-content: center;
            padding: 40px 0;
        }
        
        .container { 
            width: 210mm; 
            min-height: 297mm; 
            background: white; 
            padding: 20mm; 
            margin: 0 auto;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            position: relative;
        }
        
        @media print {
            body { 
                background: white; 
                padding: 0; 
                display: block;
            }
            .container { 
                width: 100%; 
                margin: 0; 
                padding: 20mm; 
                box-shadow: none; 
                min-height: auto;
            }
        }
        
        /* Header Section */
        .header { display: table; width: 100%; margin-bottom: 50px; }
        .header-left { display: table-cell; vertical-align: top; width: 60%; }
        .header-right { display: table-cell; vertical-align: top; text-align: right; width: 40%; }
        
        .company-name { font-size: 22pt; font-weight: 800; color: #000; letter-spacing: -0.5px; margin-bottom: 8px; }
        .company-info { color: #666; font-size: 8.5pt; font-weight: 400; }
        
        .invoice-title { font-size: 26pt; font-weight: 200; color: #999; text-transform: uppercase; margin-bottom: 15px; }
        .invoice-meta-table { display: table; width: 100%; border-collapse: collapse; }
        .meta-row { display: table-row; }
        .meta-label { display: table-cell; font-weight: 700; font-size: 8pt; color: #1a1a1a; padding: 2px 0; text-align: right; padding-right: 15px; text-transform: uppercase; }
        .meta-value { display: table-cell; font-size: 9pt; color: #1a1a1a; padding: 2px 0; text-align: right; }

        /* Billing Section */
        .billing-grid { display: table; width: 100%; margin-bottom: 40px; border-top: 1px solid #eee; padding-top: 25px; }
        .billing-col { display: table-cell; width: 33%; vertical-align: top; }
        .billing-label { font-size: 8pt; font-weight: 800; color: #999; text-transform: uppercase; margin-bottom: 10px; }
        .billing-content { font-size: 9pt; color: #333; }
        .billing-content strong { display: block; font-size: 10pt; color: #000; margin-bottom: 4px; }

        /* Table Section */
        table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        thead th { 
            text-align: left; 
            font-size: 8pt; 
            font-weight: 800; 
            text-transform: uppercase; 
            color: #666; 
            border-bottom: 2px solid #000; 
            padding: 12px 10px; 
        }
        tbody td { padding: 15px 10px; border-bottom: 1px solid #eee; vertical-align: middle; }
        .item-description { font-weight: 600; color: #000; font-size: 9.5pt; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }

        /* Summary Section */
        .summary-wrapper { display: table; width: 100%; margin-top: 20px; page-break-inside: avoid; }
        .summary-notes { display: table-cell; width: 55%; vertical-align: top; padding-right: 50px; }
        .summary-totals { display: table-cell; width: 45%; vertical-align: top; }

        .notes-box { margin-bottom: 25px; }
        .notes-heading { font-size: 8pt; font-weight: 800; color: #999; text-transform: uppercase; margin-bottom: 8px; }
        .notes-text { font-size: 8.5pt; color: #666; line-height: 1.6; }

        .words-box { background: #f9f9f9; padding: 15px; border-radius: 4px; border-left: 3px solid #eee; }
        .words-label { font-size: 7.5pt; font-weight: 800; color: #999; text-transform: uppercase; margin-bottom: 5px; }
        .words-text { font-size: 9pt; font-weight: 600; color: #333; font-style: italic; }

        .totals-table { width: 100%; border-collapse: collapse; }
        .totals-row td { padding: 8px 0; font-size: 9pt; }
        .totals-row.grand-total td { 
            padding-top: 20px; 
            border-top: 2px solid #000; 
            font-size: 14pt; 
            font-weight: 800; 
            color: #000; 
        }
        .totals-label { color: #666; text-align: right; padding-right: 20px; }
        .totals-value { text-align: right; font-weight: 700; color: #000; }

        /* Footer */
        .footer { position: fixed; bottom: 20mm; left: 20mm; right: 20mm; text-align: center; border-top: 1px solid #eee; padding-top: 15px; }
        .footer p { font-size: 8pt; color: #aaa; }
        
        .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-weight: 800; font-size: 7pt; text-transform: uppercase; margin-left: 10px; }
        .badge-paid { background: #e8f5e9; color: #2e7d32; }
        .badge-pending { background: #fff8e1; color: #f57f17; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-left">
                <div class="company-name">${org.name}</div>
                <div class="company-info">
                    <p>${org.address || ''}</p>
                    <p>${org.phone || ''} &bull; ${org.email || ''}</p>
                    <p>${org.website || ''}</p>
                </div>
            </div>
            <div class="header-right">
                <div class="invoice-title">Invoice</div>
                <div class="invoice-meta-table">
                    <div class="meta-row">
                        <div class="meta-label">Invoice Number</div>
                        <div class="meta-value"><strong>${invoice.invoiceNumber}</strong></div>
                    </div>
                    <div class="meta-row">
                        <div class="meta-label">Date Issued</div>
                        <div class="meta-value">${formatDate(invoice.invoiceDate)}</div>
                    </div>
                    <div class="meta-row">
                        <div class="meta-label">Due Date</div>
                        <div class="meta-value">${formatDate(invoice.dueDate)}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Billing Info -->
        <div class="billing-grid">
            <div class="billing-col">
                <div class="billing-label">Bill To</div>
                <div class="billing-content">
                    <strong>${invoice.Customer?.name}</strong>
                    <p>${invoice.Customer?.address || 'N/A'}</p>
                    <p>${invoice.Customer?.email || ''}</p>
                    <p>${invoice.Customer?.phone || ''}</p>
                </div>
            </div>
            <div class="billing-col">
                <div class="billing-label">Shipment/Reference</div>
                <div class="billing-content">
                    <strong>#${invoice.WorkOrder?.orderNumber || 'DIRECT'}</strong>
                    <p>Status: ${invoice.WorkOrder?.orderStatus || 'N/A'}</p>
                    <p>Processed at: ${yard?.yardName || 'Main Yard'}</p>
                </div>
            </div>
            <div class="billing-col">
                <div class="billing-label">Payment Information</div>
                <div class="billing-content">
                    <strong>Status: ${invoice.status}</strong>
                    <p>Method: Bank Transfer / Cash</p>
                    <p>Currency: AUD ($)</p>
                </div>
            </div>
        </div>

        <!-- Items Table -->
        <table>
            <thead>
                <tr>
                    <th style="width: 55%;">Description</th>
                    <th class="text-center" style="width: 10%;">Qty</th>
                    <th class="text-right" style="width: 15%;">Unit Price</th>
                    <th class="text-right" style="width: 20%;">Total</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.items.map((item: any) => `
                    <tr>
                        <td class="item-description">${item.description}</td>
                        <td class="text-center">${item.quantity}</td>
                        <td class="text-right">$${this.formatCurrency(item.unitPrice)}</td>
                        <td class="text-right" style="font-weight: 700;">$${this.formatCurrency(item.amount)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <!-- Summary -->
        <div class="summary-wrapper">
            <div class="summary-notes">
                <div class="notes-box">
                    <div class="notes-heading">Notes & Instructions</div>
                    <div class="notes-text">${invoice.notes || 'Please include the invoice number as a reference for bank transfers. Thank you for your business.'}</div>
                </div>
                <div class="words-box">
                    <div class="words-label">Total Amount in Words</div>
                    <div class="words-text">${amountInWords}</div>
                </div>
            </div>
            <div class="summary-totals">
                <table class="totals-table">
                    <tr class="totals-row">
                        <td class="totals-label">Subtotal</td>
                        <td class="totals-value">$${this.formatCurrency(invoice.subtotal)}</td>
                    </tr>
                    <tr class="totals-row">
                        <td class="totals-label">G.S.T (10%)</td>
                        <td class="totals-value">$${this.formatCurrency(invoice.tax)}</td>
                    </tr>
                    ${invoice.discount > 0 ? `
                    <tr class="totals-row">
                        <td class="totals-label" style="color: #d32f2f;">Discount / Adjustment</td>
                        <td class="totals-value" style="color: #d32f2f;">- $${this.formatCurrency(invoice.discount)}</td>
                    </tr>
                    ` : ''}
                    <tr class="totals-row grand-total">
                        <td class="totals-label">Total Due (AUD)</td>
                        <td class="totals-value">$${this.formatCurrency(invoice.total)}</td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Aussie ScrapX &bull; Thank you for choosing us for your scrap management needs.</p>
            <p style="margin-top: 5px; font-size: 7pt;">This is a computer-generated document. No signature required.</p>
        </div>
    </div>
</body>
</html>
        `;
    }
}
