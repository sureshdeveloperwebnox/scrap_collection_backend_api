# 🧪 Mobile API Testing Guide

## ✅ Database Seeded Successfully!

The database has been populated with test data for mobile API testing.

---

## 📊 **Seeded Data Summary:**

### **Collectors (3)**
| Name | Email | Phone | Scrap Yard | Status |
|------|-------|-------|------------|--------|
| Rajesh Kumar | rajesh@collector.com | +919876543211 | North Bangalore | Active |
| Suresh Reddy | suresh@collector.com | +919876543212 | South Bangalore | Active |
| Amit Sharma | amit@collector.com | +919876543213 | North Bangalore | Active |

**Password for all:** `collector123`

### **Work Orders (6)**

#### **Assigned to Rajesh Kumar (collector-1):**
1. **WO-24122024-001** - Samsung Refrigerator
   - Customer: Priya Sharma
   - Status: ASSIGNED
   - Price: ₹3,500
   - Location: MG Road, Bangalore

2. **WO-24122024-002** - LG Washing Machine
   - Customer: Vikram Patel
   - Status: ASSIGNED
   - Price: ₹2,800
   - Location: Indiranagar, Bangalore

3. **WO-22122024-006** - Bajaj Pulsar 150
   - Customer: Priya Sharma
   - Status: COMPLETED
   - Price: ₹8,500
   - Location: MG Road, Bangalore

#### **Assigned to Suresh Reddy (collector-2):**
4. **WO-24122024-003** - Maruti Alto 800
   - Customer: Anjali Desai
   - Status: ASSIGNED
   - Price: ₹45,000
   - Location: Koramangala, Bangalore

5. **WO-23122024-004** - Whirlpool AC
   - Customer: Rahul Mehta
   - Status: IN_PROGRESS
   - Price: ₹4,200
   - Location: Whitefield, Bangalore

#### **Assigned to Amit Sharma (collector-3):**
6. **WO-23122024-005** - Sony LED TV
   - Customer: Sneha Iyer
   - Status: COMPLETED
   - Price: ₹2,500
   - Location: HSR Layout, Bangalore

### **Scrap Categories (3)**
- Electronics
- Metal Scrap
- Vehicles

### **Scrap Names (3)**
- Refrigerator (Electronics)
- Washing Machine (Electronics)
- Car (Vehicles)

### **Scrap Yards (2)**
- North Bangalore Scrap Yard (Hebbal)
- South Bangalore Scrap Yard (Jayanagar)

---

## 🔐 **Step 1: Login**

```bash
POST http://localhost:9645/api/v1/mobile/auth/login
Content-Type: application/json

{
  "identifier": "rajesh@collector.com",
  "password": "collector123"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "collector": {
      "id": "collector-1",
      "fullName": "Rajesh Kumar",
      "email": "rajesh@collector.com",
      "phone": "+919876543211"
    }
  }
}
```

**Copy the `accessToken` for subsequent requests!**

---

## 📋 **Step 2: Get Work Orders**

```bash
GET http://localhost:9645/api/v1/mobile/work-orders
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Query Parameters (Optional):**
- `?status=ASSIGNED` - Filter by status
- `?collectorLat=12.9716&collectorLon=77.5946` - Calculate distance
- `?limit=10` - Limit results

**Expected Response:**
- Should return 2-3 work orders assigned to Rajesh Kumar
- Orders with status ASSIGNED and COMPLETED

---

## 🔍 **Step 3: Get Single Work Order**

```bash
GET http://localhost:9645/api/v1/mobile/work-orders/order-1
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected Response:**
- Full details of the Samsung Refrigerator order
- Customer information
- Location details
- Timeline

---

## ✏️ **Step 4: Update Work Order Status**

### **Start Work (ASSIGNED → IN_PROGRESS)**

```bash
PUT http://localhost:9645/api/v1/mobile/work-orders/order-1/status
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "status": "IN_PROGRESS",
  "notes": "Arrived at customer location",
  "photos": [
    "https://example.com/arrival-photo.jpg"
  ],
  "timestamp": "2024-12-24T12:30:00Z",
  "latitude": 12.9716,
  "longitude": 77.5946
}
```

### **Complete Work (IN_PROGRESS → COMPLETED)**

```bash
PUT http://localhost:9645/api/v1/mobile/work-orders/order-1/status
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "status": "COMPLETED",
  "notes": "Pickup completed successfully",
  "actualPrice": 3500,
  "completionPhotos": [
    "https://example.com/completed1.jpg",
    "https://example.com/completed2.jpg"
  ],
  "timestamp": "2024-12-24T14:00:00Z",
  "latitude": 12.9716,
  "longitude": 77.5946
}
```

---

## 📊 **Step 5: Get Collector Stats**

```bash
GET http://localhost:9645/api/v1/mobile/work-orders/stats/dashboard
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected Response:**
- Today's stats
- This week's stats
- This month's stats
- Overall performance

---

## 📝 **Step 6: Get Form Helpers (Scrap Collection)**

```bash
GET http://localhost:9645/api/v1/mobile/collection-records/form-helpers
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected Response:**
- Work orders assigned to collector
- Scrap categories
- Scrap names

---

## ➕ **Step 7: Create Scrap Collection Record**

```bash
POST http://localhost:9645/api/v1/mobile/collection-records
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "orderId": "order-1",
  "customerName": "Priya Sharma",
  "customerPhone": "+919123456781",
  "customerAddress": "45 MG Road, Bangalore",
  
  "scrapCategoryId": "cat-electronics",
  "scrapNameId": "name-fridge",
  "scrapDescription": "Old Samsung refrigerator, not cooling",
  "scrapCondition": "POOR",
  
  "make": "Samsung",
  "model": "Double Door",
  "weight": 45.5,
  "quantity": 1,
  
  "quotedAmount": 3500,
  "baseAmount": 3500,
  "taxPercentage": 18,
  "taxAmount": 630,
  "finalAmount": 4130,
  
  "customerSignature": "https://example.com/customer-sign.png",
  "employeeSignature": "https://example.com/employee-sign.png",
  "scrapCollectedDate": "2024-12-24T14:00:00Z",
  
  "photos": ["https://example.com/fridge1.jpg"],
  "pickupLatitude": 12.9716,
  "pickupLongitude": 77.5946
}
```

---

## 🔍 **Step 8: List Collection Records**

```bash
GET http://localhost:9645/api/v1/mobile/collection-records
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Query Parameters:**
- `?status=DRAFT`
- `?page=1&limit=20`

---

## 🎯 **Testing Scenarios:**

### **Scenario 1: Complete Workflow**
1. Login as Rajesh
2. Get assigned work orders
3. View order details (order-1)
4. Update status to IN_PROGRESS
5. Create scrap collection record
6. Update status to COMPLETED
7. Check dashboard stats

### **Scenario 2: Multiple Collectors**
1. Login as Suresh (suresh@collector.com)
2. Should see different work orders
3. Test with order-3 (Maruti Alto)

### **Scenario 3: Offline Sync**
1. Create collection record with custom timestamp
2. Update work order status with custom timestamp
3. Verify timeline shows correct timestamps

---

## ✅ **Expected Behaviors:**

### **Authorization:**
- ❌ Without token → 401 Unauthorized
- ❌ Invalid token → 401 Invalid token
- ✅ Valid token → Access granted

### **Work Order Access:**
- ✅ Collector can see only their assigned orders
- ❌ Cannot access other collector's orders

### **Status Transitions:**
- ✅ ASSIGNED → IN_PROGRESS
- ✅ IN_PROGRESS → COMPLETED
- ❌ COMPLETED → IN_PROGRESS (Invalid)
- ❌ ASSIGNED → COMPLETED (Invalid, must go through IN_PROGRESS)

### **Photo Handling:**
- ✅ Photos array merges with existing photos
- ✅ Completion photos added separately
- ✅ All photos stored in order.photos

---

## 🐛 **Troubleshooting:**

### **"Work order not found"**
- Check if order is assigned to logged-in collector
- Verify order ID is correct

### **"Invalid status transition"**
- Check current order status
- Follow valid transition path

### **"Scrap category not found"**
- Use IDs from form-helpers endpoint
- Check if category is active

---

## 📱 **Postman Collection Tips:**

1. **Create Environment Variable:**
   - `token` = Your access token
   - `baseUrl` = `http://localhost:9645/api/v1`

2. **Set Authorization:**
   - Type: Bearer Token
   - Token: `{{token}}`

3. **Save Requests:**
   - Organize by feature (Auth, Work Orders, Collection Records)

---

## 🎉 **Happy Testing!**

All endpoints are ready and the database is seeded with realistic test data.
