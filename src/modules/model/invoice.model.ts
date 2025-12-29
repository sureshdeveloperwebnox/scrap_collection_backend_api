import { IsString, IsOptional, IsNumber, IsDateString, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceItemDto {
    @IsString()
    description!: string;

    @IsNumber()
    @Min(0.01)
    quantity!: number;

    @IsNumber()
    @Min(0)
    unitPrice!: number;

    @IsNumber()
    @Min(0)
    amount!: number;
}

export class CreateInvoiceDto {
    @IsString()
    customerId!: string;

    @IsOptional()
    @IsString()
    workOrderId?: string;

    @IsString()
    invoiceNumber!: string;

    @IsDateString()
    invoiceDate!: string;

    @IsDateString()
    dueDate!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateInvoiceItemDto)
    items!: CreateInvoiceItemDto[];

    @IsNumber()
    @Min(0)
    subtotal!: number;

    @IsNumber()
    @Min(0)
    tax!: number;

    @IsNumber()
    @Min(0)
    discount!: number;

    @IsNumber()
    @Min(0)
    total!: number;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsString()
    terms?: string;
}

export class UpdateInvoiceDto {
    @IsOptional()
    @IsString()
    customerId?: string;

    @IsOptional()
    @IsString()
    workOrderId?: string;

    @IsOptional()
    @IsString()
    invoiceNumber?: string;

    @IsOptional()
    @IsDateString()
    invoiceDate?: string;

    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateInvoiceItemDto)
    items?: CreateInvoiceItemDto[];

    @IsOptional()
    @IsNumber()
    @Min(0)
    subtotal?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    tax?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    discount?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    total?: number;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsString()
    terms?: string;

    @IsOptional()
    @IsString()
    status?: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
}
