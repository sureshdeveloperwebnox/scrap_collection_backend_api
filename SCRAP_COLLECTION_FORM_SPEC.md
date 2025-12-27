# Scrap Collection Form - Field Specification

## Form Fields

### Foreign Keys (IDs)
1. **workOrderId** (String, Optional) - Work Order ID
2. **organizationId** (Int, Required) - Organization ID
3. **assignOrderId** (String, Optional) - Assign Order ID
4. **customerId** (String, Optional) - Customer ID
5. **scrapCategoryId** (String, Required) - Scrap Category ID
6. **scrapNameId** (String, Optional) - Scrap Name ID
7. **collectorId** (String, Required) - Collector ID (Employee)

### Collection Details
8. **collectionDate** (DateTime, Default: now) - Collection date
9. **scrapDescription** (String, Required) - Scrap description
10. **scrapCondition** (Enum, Required) - Scrap condition
11. **make** (String, Optional) - Make
12. **model** (String, Optional) - Model
13. **yearOfManufacture** (String, Optional) - Year of manufacture
14. **weight** (Float, Optional) - Weight
15. **quantity** (Int, Optional) - Quantity (OPTIONAL field)

### Amounts
16. **quotedAmount** (Float, Required) - Quoted amount
17. **finalAmount** (Float, Required) - Final amount

### Photos & Signatures (Digital Ocean Paths)
18. **photos** (JSON Array, Optional) - Array of photo URLs stored in Digital Ocean
19. **customerSignature** (String, Optional) - Customer signature URL
20. **collectorSignature** (String, Optional) - Collector signature URL

### Status
21. **collectionStatus** (Enum, Default: SUBMITTED) - Collection status
    - Default: SUBMITTED
    - Future: Will be approved from dashboard (status will change)

### Timestamps (Auto-managed)
- **createdAt** (DateTime) - Auto-generated
- **updatedAt** (DateTime) - Auto-updated

## Database Model

```prisma
model scrap_collection_records {
  id                 String                 @id @default(uuid())
  // Foreign Keys
  workOrderId        String?                // Work Order ID
  organizationId     Int                    // Organization ID
  assignOrderId      String?                // Assign Order ID
  customerId         String?                // Customer ID
  scrapCategoryId    String                 // Scrap Category ID
  scrapNameId        String?                // Scrap Name ID
  collectorId        String                 // Collector ID (Employee)
  
  // Collection Details
  collectionDate     DateTime               @default(now())
  scrapDescription   String
  scrapCondition     ScrapConditionEnum
  make               String?
  model              String?
  yearOfManufacture  String?
  weight             Float?
  quantity           Int?                   // Optional
  
  // Amounts
  quotedAmount       Float
  finalAmount        Float
  
  // Photos & Signatures (Digital Ocean paths)
  photos             Json?                  // Array of photo URLs
  customerSignature  String?                // Customer signature URL
  collectorSignature String?                // Collector signature URL
  
  // Status
  collectionStatus   CollectionRecordStatus @default(SUBMITTED)
  
  // Timestamps
  createdAt          DateTime               @default(now())
  updatedAt          DateTime               @updatedAt
  
  // Relations
  Employee           Employee               @relation(fields: [collectorId], references: [id])
  Customer           Customer?              @relation(fields: [customerId], references: [id])
  Order              Order?                 @relation(fields: [workOrderId], references: [id])
  assign_orders      assign_orders?         @relation(fields: [assignOrderId], references: [id])
  Organization       Organization           @relation(fields: [organizationId], references: [id])
  scrap_categories   scrap_categories       @relation(fields: [scrapCategoryId], references: [id])
  scrap_names        scrap_names?           @relation(fields: [scrapNameId], references: [id])

  @@index([collectionDate])
  @@index([collectorId])
  @@index([customerId])
  @@index([workOrderId])
  @@index([collectionStatus])
}
```

## Notes

1. **Simplified Structure**: Removed all unnecessary fields from the previous schema
2. **Essential Fields Only**: Contains only the fields specified by the user
3. **Optional Quantity**: The quantity field is marked as optional as requested
4. **Status Flow**: Collection status defaults to SUBMITTED. Future approval workflow from dashboard will change this status
5. **Digital Ocean Storage**: Photos and signatures are stored as URLs pointing to Digital Ocean storage
6. **Indexed Fields**: Key fields are indexed for better query performance

## Removed Fields

The following fields were removed from the previous schema as they were not in the requirements:
- customerName, customerPhone, customerEmail, customerAddress
- serialNumber, dimensions
- baseAmount, taxPercentage, taxAmount, additionalCharges, discountAmount
- paymentMethod, paymentStatus
- beforePhotos, afterPhotos, employeeSignature
- scrapCollectedDate, notes, specialInstructions
- hazardousMaterial, requiresDisassembly
- pickupLatitude, pickupLongitude, scrapYardId
- status (replaced with collectionStatus)
- submittedAt, approvedAt, approvedBy
