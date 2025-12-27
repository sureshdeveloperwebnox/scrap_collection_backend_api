# Scrap Collection Form - Test Payload

## Sample Payload for Creating Scrap Collection Record

### Minimal Required Payload
```json
{
  "organizationId": 1,
  "collectorId": "collector-1",
  "scrapCategoryId": "cat-electronics",
  "scrapDescription": "Old refrigerator in non-working condition",
  "scrapCondition": "JUNK",
  "quotedAmount": 3500,
  "finalAmount": 3500,
  "collectionStatus": "SUBMITTED"
}
```

### Complete Payload with All Fields
```json
{
  "workOrderId": "order-1",
  "organizationId": 1,
  "assignOrderId": null,
  "customerId": "customer-1",
  "scrapCategoryId": "cat-electronics",
  "scrapNameId": "name-fridge",
  "collectorId": "collector-1",
  "collectionDate": "2025-12-27T12:30:00.000Z",
  "scrapDescription": "Samsung double door refrigerator, not cooling, 10 years old",
  "scrapCondition": "DAMAGED",
  "make": "Samsung",
  "model": "RT28M3022S8",
  "yearOfManufacture": "2015",
  "weight": 65.5,
  "quantity": 1,
  "quotedAmount": 3500,
  "finalAmount": 3200,
  "photos": [
    "https://webnox.blr1.digitaloceanspaces.com/Scrap_Service/scrap_photos/photo1.jpg",
    "https://webnox.blr1.digitaloceanspaces.com/Scrap_Service/scrap_photos/photo2.jpg"
  ],
  "customerSignature": "https://webnox.blr1.digitaloceanspaces.com/Scrap_Service/signatures/customer_sig.png",
  "collectorSignature": "https://webnox.blr1.digitaloceanspaces.com/Scrap_Service/signatures/collector_sig.png",
  "collectionStatus": "SUBMITTED"
}
```

### Payload with Optional Fields (Washing Machine)
```json
{
  "organizationId": 1,
  "collectorId": "collector-2",
  "customerId": "customer-2",
  "scrapCategoryId": "cat-electronics",
  "scrapNameId": "name-washing-machine",
  "scrapDescription": "LG front load washing machine with damaged drum",
  "scrapCondition": "DAMAGED",
  "make": "LG",
  "model": "FHT1408SWL",
  "yearOfManufacture": "2018",
  "weight": 72.0,
  "quotedAmount": 2800,
  "finalAmount": 2800,
  "photos": [
    "https://webnox.blr1.digitaloceanspaces.com/Scrap_Service/scrap_photos/washing_machine.jpg"
  ],
  "collectionStatus": "SUBMITTED"
}
```

### Payload for Vehicle (Car)
```json
{
  "workOrderId": "order-3",
  "organizationId": 1,
  "collectorId": "collector-1",
  "customerId": "customer-3",
  "scrapCategoryId": "cat-vehicles",
  "scrapNameId": "name-car",
  "scrapDescription": "Maruti Alto 800 - Accident damaged, total loss",
  "scrapCondition": "WRECKED",
  "make": "Maruti",
  "model": "Alto 800",
  "yearOfManufacture": "2010",
  "weight": 750.0,
  "quantity": 1,
  "quotedAmount": 45000,
  "finalAmount": 45000,
  "photos": [
    "https://webnox.blr1.digitaloceanspaces.com/Scrap_Service/scrap_photos/car_front.jpg",
    "https://webnox.blr1.digitaloceanspaces.com/Scrap_Service/scrap_photos/car_side.jpg",
    "https://webnox.blr1.digitaloceanspaces.com/Scrap_Service/scrap_photos/car_damage.jpg"
  ],
  "customerSignature": "https://webnox.blr1.digitaloceanspaces.com/Scrap_Service/signatures/customer_car_sig.png",
  "collectorSignature": "https://webnox.blr1.digitaloceanspaces.com/Scrap_Service/signatures/collector_car_sig.png",
  "collectionStatus": "SUBMITTED"
}
```

## Available Test Data from Seed

### Collectors (Employees)
- `collector-1` - Rajesh Kumar (rajesh@collector.com)
- `collector-2` - Suresh Reddy (suresh@collector.com)
- `collector-3` - Amit Sharma (amit@collector.com)

### Customers
- `customer-1` - Priya Sharma
- `customer-2` - Vikram Patel
- `customer-3` - Anjali Desai
- `customer-4` - Rahul Mehta
- `customer-5` - Sneha Iyer

### Work Orders
- `order-1` - WO-24122024-001 (ASSIGNED)
- `order-2` - WO-24122024-002 (ASSIGNED)
- `order-3` - WO-24122024-003 (ASSIGNED)
- `order-4` - WO-23122024-004 (IN_PROGRESS)
- `order-5` - WO-23122024-005 (COMPLETED)
- `order-6` - WO-22122024-006 (COMPLETED)

### Scrap Categories
- `cat-electronics` - Electronics
- `cat-metal` - Metal Scrap
- `cat-vehicles` - Vehicles

### Scrap Names
- `name-fridge` - Refrigerator (under Electronics)
- `name-washing-machine` - Washing Machine (under Electronics)
- `name-car` - Car (under Vehicles)

### Scrap Yards
- `yard-1` - North Bangalore Scrap Yard
- `yard-2` - South Bangalore Scrap Yard

### Organization
- Organization ID: `1` - Scrap Collection Inc

## Scrap Condition Enum Values
- `JUNK` - Completely non-functional
- `DAMAGED` - Partially damaged
- `WRECKED` - Severely damaged (for vehicles)
- `ACCIDENTAL` - Accident damaged
- `FULLY_SCRAP` - Ready for scrapping

## Collection Status Enum Values
- `SUBMITTED` - Default status when form is submitted
- (Future statuses will be added for approval workflow)

## cURL Test Command

```bash
# Create Scrap Collection Record
curl -X POST http://localhost:9645/api/v1/mobile/scrap-collections \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "organizationId": 1,
    "collectorId": "collector-1",
    "customerId": "customer-1",
    "scrapCategoryId": "cat-electronics",
    "scrapNameId": "name-fridge",
    "scrapDescription": "Old refrigerator in non-working condition",
    "scrapCondition": "DAMAGED",
    "make": "Samsung",
    "model": "RT28M3022S8",
    "yearOfManufacture": "2015",
    "weight": 65.5,
    "quantity": 1,
    "quotedAmount": 3500,
    "finalAmount": 3200,
    "photos": [
      "https://webnox.blr1.digitaloceanspaces.com/Scrap_Service/scrap_photos/photo1.jpg"
    ],
    "customerSignature": "https://webnox.blr1.digitaloceanspaces.com/Scrap_Service/signatures/customer_sig.png",
    "collectorSignature": "https://webnox.blr1.digitaloceanspaces.com/Scrap_Service/signatures/collector_sig.png",
    "collectionStatus": "SUBMITTED"
  }'
```

## Notes

1. **Required Fields:**
   - organizationId
   - collectorId
   - scrapCategoryId
   - scrapDescription
   - scrapCondition
   - quotedAmount
   - finalAmount

2. **Optional Fields:**
   - workOrderId
   - assignOrderId
   - customerId
   - scrapNameId
   - collectionDate (defaults to now)
   - make, model, yearOfManufacture
   - weight
   - quantity
   - photos
   - customerSignature
   - collectorSignature

3. **Photos Format:** JSON array of URL strings
4. **Signatures:** Single URL string pointing to Digital Ocean storage
5. **Default Status:** SUBMITTED
