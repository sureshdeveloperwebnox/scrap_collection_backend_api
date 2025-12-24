# Mobile API Updates Summary

## ✅ Changes Completed

### 1. **Scrap Collection Form API** (`POST /mobile/collection-records`)

#### New Fields Added:
- **`employeeSignature`** (string, optional): URL to employee's digital signature image
- **`scrapCollectedDate`** (Date/string, optional): Actual date when scrap was collected from customer

#### Updated Request Example:
```json
POST http://localhost:9645/api/v1/mobile/collection-records
Headers: 
  Authorization: Bearer {token}
  Content-Type: application/json

Body:
{
  "customerName": "John Doe",
  "customerPhone": "+919876543210",
  "customerAddress": "123 Main St, Bangalore",
  
  "scrapCategoryId": "uuid-here",
  "scrapDescription": "Old washing machine",
  "scrapCondition": "POOR",
  
  "quotedAmount": 1200,
  "baseAmount": 1200,
  "taxPercentage": 18,
  "taxAmount": 216,
  "finalAmount": 1416,
  
  "weight": 25.0,
  "make": "LG",
  "model": "Front Load",
  
  // NEW FIELDS
  "employeeSignature": "https://storage.com/employee-signature.png",
  "scrapCollectedDate": "2024-12-24T10:30:00Z",
  
  // Existing signature fields
  "customerSignature": "https://storage.com/customer-signature.png",
  "collectorSignature": "https://storage.com/collector-signature.png"
}
```

---

### 2. **Work Order Status Update API** (`PUT /mobile/work-orders/{order_id}/status`)

#### New Fields Added:
- **`photos`** (array of strings, optional): General photos array for location arrival, progress photos, etc.
- **`timestamp`** (Date/string, optional): Custom timestamp when the status was actually updated (useful for offline sync)

#### Updated Request Example:
```json
PUT http://localhost:9645/api/v1/mobile/work-orders/{order_id}/status
Headers: 
  Authorization: Bearer {token}
  Content-Type: application/json

Body:
{
  "status": "IN_PROGRESS",
  "notes": "Arrived at customer location",
  
  // NEW FIELDS
  "photos": [
    "https://storage.com/arrival-photo1.jpg",
    "https://storage.com/location-photo2.jpg"
  ],
  "timestamp": "2024-12-24T10:15:00Z",
  
  // Location tracking
  "latitude": 12.9716,
  "longitude": 77.5946,
  
  // Existing fields (for completion)
  "actualPrice": 1500,
  "completionPhotos": [
    "https://storage.com/completed1.jpg"
  ]
}
```

---

## 📋 Use Cases

### **Scrap Collection Form:**
1. **Employee Signature**: Collector can add their own signature alongside customer signature for dual verification
2. **Scrap Collected Date**: Track the exact date/time when scrap was physically collected (may differ from form submission time)

### **Work Order Status Update:**
1. **Photos Array**: 
   - When collector arrives: Upload arrival photos
   - During work: Upload progress photos
   - On completion: Use `completionPhotos` for final photos
   - All photos are merged into the order's photo array
   
2. **Timestamp**:
   - Useful for offline mode: Collector can record exact time of status change even when offline
   - System will use this timestamp in the order timeline instead of server time
   - If not provided, server uses current time

---

## 🔄 Photo Handling Logic

The system now intelligently merges photos:
```
Final Photos = Existing Photos + General Photos + Completion Photos
```

Example flow:
1. Collector arrives → uploads 2 arrival photos via `photos` array
2. Collector completes → uploads 3 completion photos via `completionPhotos` array
3. Order now has 5 total photos in the database

---

## 🗄️ Database Changes

### ScrapCollectionRecord Table:
- Added `employeeSignature` (String, nullable)
- Added `scrapCollectedDate` (DateTime, nullable)

### No changes to Order table (photos already existed as JSON array)

---

## ✅ Testing Checklist

### Scrap Collection Form:
- [ ] Create record with `employeeSignature`
- [ ] Create record with `scrapCollectedDate`
- [ ] Create record with both new fields
- [ ] Verify fields are saved correctly in database
- [ ] Verify fields are returned in GET requests

### Work Order Status Update:
- [ ] Update status with `photos` array
- [ ] Update status with custom `timestamp`
- [ ] Update status with both `photos` and `completionPhotos`
- [ ] Verify all photos are merged correctly
- [ ] Verify timeline entry uses custom timestamp
- [ ] Verify timeline entry uses server time when timestamp not provided

---

## 🚀 Server Status

✅ Database schema updated
✅ Prisma client regenerated
✅ Server running on port 9645
✅ All validations in place
✅ Ready for testing!
