# Mobile Work Orders API Documentation

## Overview
This API provides comprehensive work order management for mobile collectors. It includes filtering, location-based search, status updates, and performance statistics.

**Base URL:** `http://localhost:9645/api/v1/mobile/work-orders`

**Authentication:** All endpoints require Bearer token authentication
```
Authorization: Bearer {access_token}
```

---

## Endpoints

### 1. Get Work Orders (List)

**GET** `/mobile/work-orders`

Retrieve all work orders assigned to the authenticated collector with advanced filtering options.

#### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | number | Page number (default: 1) | `1` |
| `limit` | number | Items per page (default: 20, max: 100) | `20` |
| `status` | string | Filter by order status (comma-separated for multiple) | `ASSIGNED,IN_PROGRESS` |
| `paymentStatus` | string | Filter by payment status | `PAID` |
| `dateFrom` | string | Filter orders created from date (ISO 8601) | `2025-12-01T00:00:00Z` |
| `dateTo` | string | Filter orders created until date (ISO 8601) | `2025-12-31T23:59:59Z` |
| `pickupDateFrom` | string | Filter by scheduled pickup from date | `2025-12-23T00:00:00Z` |
| `pickupDateTo` | string | Filter by scheduled pickup until date | `2025-12-24T23:59:59Z` |
| `yardId` | string | Filter by assigned scrap yard UUID | `123e4567-e89b-12d3-a456-426614174000` |
| `nearLatitude` | number | Latitude for nearby search | `12.9716` |
| `nearLongitude` | number | Longitude for nearby search | `77.5946` |
| `radiusKm` | number | Search radius in kilometers (default: 50) | `25` |
| `search` | string | Search in customer name, phone, address, order number | `John` |
| `sortBy` | string | Sort field: `createdAt`, `pickupTime`, `quotedPrice`, `customerName`, `orderStatus` | `pickupTime` |
| `sortOrder` | string | Sort direction: `asc` or `desc` | `asc` |
| `hasPhotos` | boolean | Filter orders with/without photos | `true` |
| `priceMin` | number | Minimum quoted price | `1000` |
| `priceMax` | number | Maximum quoted price | `5000` |
| `collectorLat` | number | Collector's current latitude (for distance calculation) | `12.9716` |
| `collectorLon` | number | Collector's current longitude (for distance calculation) | `77.5946` |

#### Order Status Values
- `PENDING` - Order created, not yet assigned
- `ASSIGNED` - Assigned to collector/crew
- `IN_PROGRESS` - Collector is working on it
- `COMPLETED` - Successfully completed
- `CANCELLED` - Cancelled order

#### Example Request
```bash
curl -X GET "http://localhost:9645/api/v1/mobile/work-orders?status=ASSIGNED,IN_PROGRESS&limit=10&collectorLat=12.9716&collectorLon=77.5946" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Example Response
```json
{
  "version": "1.0.0",
  "validationErrors": [],
  "code": 200,
  "status": "success",
  "message": "Work orders retrieved successfully",
  "data": {
    "orders": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "orderNumber": "WO-23122025-1",
        "customer": {
          "name": "John Doe",
          "phone": "+919876543210",
          "email": "john@example.com"
        },
        "location": {
          "address": "123 Main St, Bangalore",
          "latitude": 12.9716,
          "longitude": 77.5946,
          "distance": "5.2 km",
          "estimatedDuration": "8 min"
        },
        "vehicle": {
          "make": "Toyota",
          "model": "Corolla",
          "year": "2015",
          "condition": "JUNK"
        },
        "photos": [
          "https://example.com/photo1.jpg",
          "https://example.com/photo2.jpg"
        ],
        "assignment": {
          "assignedAt": "2025-12-23T10:00:00Z",
          "pickupTime": "2025-12-23T14:00:00Z",
          "yard": {
            "id": "yard-uuid",
            "name": "Central Scrap Yard",
            "address": "456 Industrial Area"
          },
          "crew": null
        },
        "status": {
          "order": "ASSIGNED",
          "payment": "UNPAID"
        },
        "pricing": {
          "quoted": 15000,
          "actual": null
        },
        "route": {
          "distance": "12 km",
          "duration": "25 min"
        },
        "notes": {
          "customer": "Please call before arriving",
          "admin": "Priority pickup",
          "instructions": "Check engine condition"
        },
        "timeline": [
          {
            "status": "PENDING",
            "notes": "Order WO-23122025-1 created",
            "performedBy": "system",
            "createdAt": "2025-12-23T09:00:00Z"
          },
          {
            "status": "ASSIGNED",
            "notes": "Order assigned",
            "performedBy": "system",
            "createdAt": "2025-12-23T10:00:00Z"
          }
        ],
        "createdAt": "2025-12-23T09:00:00Z",
        "updatedAt": "2025-12-23T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    },
    "summary": {
      "totalOrders": 25,
      "pendingCount": 0,
      "assignedCount": 15,
      "inProgressCount": 5,
      "completedCount": 3,
      "cancelledCount": 2,
      "totalRevenue": 45000
    }
  }
}
```

---

### 2. Get Work Order Details

**GET** `/mobile/work-orders/:id`

Retrieve detailed information about a specific work order.

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Work order ID |

#### Example Request
```bash
curl -X GET "http://localhost:9645/api/v1/mobile/work-orders/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Example Response
```json
{
  "version": "1.0.0",
  "validationErrors": [],
  "code": 200,
  "status": "success",
  "message": "Work order retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "orderNumber": "WO-23122025-1",
    "customer": {
      "name": "John Doe",
      "phone": "+919876543210",
      "email": "john@example.com"
    },
    "location": {
      "address": "123 Main St, Bangalore",
      "latitude": 12.9716,
      "longitude": 77.5946
    },
    "vehicle": {
      "make": "Toyota",
      "model": "Corolla",
      "year": "2015",
      "condition": "JUNK"
    },
    "photos": ["https://example.com/photo1.jpg"],
    "assignment": {
      "assignedAt": "2025-12-23T10:00:00Z",
      "pickupTime": "2025-12-23T14:00:00Z",
      "yard": {
        "id": "yard-uuid",
        "name": "Central Scrap Yard",
        "address": "456 Industrial Area"
      }
    },
    "status": {
      "order": "ASSIGNED",
      "payment": "UNPAID"
    },
    "pricing": {
      "quoted": 15000,
      "actual": null
    },
    "notes": {
      "customer": "Please call before arriving",
      "admin": "Priority pickup",
      "instructions": "Check engine condition"
    },
    "timeline": [
      {
        "status": "PENDING",
        "notes": "Order created",
        "performedBy": "system",
        "createdAt": "2025-12-23T09:00:00Z"
      }
    ],
    "createdAt": "2025-12-23T09:00:00Z",
    "updatedAt": "2025-12-23T10:00:00Z"
  }
}
```

---

### 3. Update Work Order Status

**PUT** `/mobile/work-orders/:id/status`

Update the status of a work order. Collectors can progress orders through their lifecycle.

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Work order ID |

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Yes | New order status |
| `notes` | string | No | Notes about the status change (max 1000 chars) |
| `actualPrice` | number | No | Final price (required when marking as COMPLETED) |
| `completionPhotos` | string[] | No | Array of photo URLs taken upon completion |
| `latitude` | number | No | Collector's latitude when updating status |
| `longitude` | number | No | Collector's longitude when updating status |

#### Valid Status Transitions
- `PENDING` → `ASSIGNED`, `CANCELLED`
- `ASSIGNED` → `IN_PROGRESS`, `CANCELLED`
- `IN_PROGRESS` → `COMPLETED`, `CANCELLED`
- `COMPLETED` → (no further changes allowed)
- `CANCELLED` → (no further changes allowed)

#### Example Request
```bash
curl -X PUT "http://localhost:9645/api/v1/mobile/work-orders/550e8400-e29b-41d4-a716-446655440000/status" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS",
    "notes": "Started pickup, on the way to customer location",
    "latitude": 12.9716,
    "longitude": 77.5946
  }'
```

#### Example Response
```json
{
  "version": "1.0.0",
  "validationErrors": [],
  "code": 200,
  "status": "success",
  "message": "Work order status updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "orderNumber": "WO-23122025-1",
    "status": {
      "order": "IN_PROGRESS",
      "payment": "UNPAID"
    },
    "timeline": [
      {
        "status": "PENDING",
        "notes": "Order created",
        "performedBy": "system",
        "createdAt": "2025-12-23T09:00:00Z"
      },
      {
        "status": "ASSIGNED",
        "notes": "Order assigned",
        "performedBy": "system",
        "createdAt": "2025-12-23T10:00:00Z"
      },
      {
        "status": "IN_PROGRESS",
        "notes": "Started pickup, on the way to customer location",
        "performedBy": "collector-uuid",
        "createdAt": "2025-12-23T11:30:00Z"
      }
    ]
  }
}
```

#### Completing an Order
```bash
curl -X PUT "http://localhost:9645/api/v1/mobile/work-orders/550e8400-e29b-41d4-a716-446655440000/status" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED",
    "notes": "Vehicle picked up successfully",
    "actualPrice": 14500,
    "completionPhotos": [
      "https://example.com/completion1.jpg",
      "https://example.com/completion2.jpg"
    ],
    "latitude": 12.9716,
    "longitude": 77.5946
  }'
```

---

### 4. Get Collector Statistics

**GET** `/mobile/work-orders/stats/dashboard`

Retrieve performance statistics for the authenticated collector.

#### Example Request
```bash
curl -X GET "http://localhost:9645/api/v1/mobile/work-orders/stats/dashboard" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Example Response
```json
{
  "version": "1.0.0",
  "validationErrors": [],
  "code": 200,
  "status": "success",
  "message": "Collector statistics retrieved successfully",
  "data": {
    "today": {
      "assigned": 5,
      "completed": 3,
      "revenue": 42000
    },
    "thisWeek": {
      "assigned": 25,
      "completed": 18,
      "revenue": 245000
    },
    "thisMonth": {
      "assigned": 98,
      "completed": 85,
      "revenue": 1250000
    },
    "overall": {
      "totalCompleted": 450,
      "totalRevenue": 6500000,
      "averageRating": 4.7,
      "completionRate": 92.5
    }
  }
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "version": "1.0.0",
  "validationErrors": [],
  "code": 401,
  "status": "error",
  "message": "Invalid or expired token",
  "data": null
}
```

### 404 Not Found
```json
{
  "version": "1.0.0",
  "validationErrors": [],
  "code": 404,
  "status": "error",
  "message": "Work order not found or not assigned to you",
  "data": null
}
```

### 400 Bad Request (Invalid Status Transition)
```json
{
  "version": "1.0.0",
  "validationErrors": [],
  "code": 400,
  "status": "error",
  "message": "Invalid status transition from COMPLETED to IN_PROGRESS",
  "data": null
}
```

---

## Best Practices

### 1. **Efficient Filtering**
Use specific filters to reduce data transfer:
```bash
# Get only today's assigned orders
GET /mobile/work-orders?status=ASSIGNED&dateFrom=2025-12-23T00:00:00Z&limit=50
```

### 2. **Location-Based Queries**
Always send collector location for distance calculation:
```bash
GET /mobile/work-orders?collectorLat=12.9716&collectorLon=77.5946&nearLatitude=12.9716&nearLongitude=77.5946&radiusKm=10
```

### 3. **Pagination**
Use reasonable page sizes (10-50 items):
```bash
GET /mobile/work-orders?page=1&limit=20
```

### 4. **Status Updates**
Always include notes for better tracking:
```json
{
  "status": "IN_PROGRESS",
  "notes": "Vehicle loaded, heading to scrap yard",
  "latitude": 12.9716,
  "longitude": 77.5946
}
```

### 5. **Completion Photos**
Always upload completion photos for completed orders:
```json
{
  "status": "COMPLETED",
  "actualPrice": 14500,
  "completionPhotos": ["url1", "url2"],
  "notes": "All parts removed, vehicle crushed"
}
```

---

## Rate Limiting
- **Requests per minute:** 60
- **Burst limit:** 100

---

## Support
For API issues or questions, contact: support@example.com
