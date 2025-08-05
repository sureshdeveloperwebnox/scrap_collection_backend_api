# Lead API Documentation

## Overview
The Lead API module provides comprehensive functionality for managing leads in the scrap collection service. It includes CRUD operations, lead conversion, and statistical analysis.

## Base URL
```
/api/v1/leads
```

## Data Models

### Lead Interface
```typescript
interface ILead {
  id: number;
  organizationId: number;
  customerId: number;
  name: string;
  contact: string;
  email?: string;
  location?: string;
  vehicleTypeId: number;
  scrapCategory: ScrapCategory;
  status: LeadStatus;
  createdAt: Date;
  updatedAt: Date;
}
```

### Enums
```typescript
enum LeadStatus {
  PENDING = 'PENDING',
  CONVERTED = 'CONVERTED',
  REJECTED = 'REJECTED'
}

enum ScrapCategory {
  JUNK = 'JUNK',
  ACCIDENT_DAMAGED = 'ACCIDENT_DAMAGED',
  FULLY_SCRAP = 'FULLY_SCRAP'
}
```

## API Endpoints

### 1. Create Lead
**POST** `/api/v1/leads`

Creates a new lead for scrap collection.

**Request Body:**
```json
{
  "organizationId": 1,
  "customerId": 1,
  "name": "John Doe",
  "contact": "+1234567890",
  "email": "john@example.com",
  "location": "123 Main St, City",
  "vehicleTypeId": 1,
  "scrapCategory": "JUNK"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": {
    "id": 1,
    "organizationId": 1,
    "customerId": 1,
    "name": "John Doe",
    "contact": "+1234567890",
    "email": "john@example.com",
    "location": "123 Main St, City",
    "vehicleTypeId": 1,
    "scrapCategory": "JUNK",
    "status": "PENDING",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "customer": {
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      }
    },
    "vehicleType": {
      "id": 1,
      "name": "Car"
    },
    "organization": {
      "name": "ScrapCo"
    }
  },
  "statusCode": 201
}
```

### 2. Get All Leads
**GET** `/api/v1/leads`

Retrieves a paginated list of leads with optional filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search term for name, contact, email, or location
- `status` (optional): Filter by lead status
- `scrapCategory` (optional): Filter by scrap category
- `organizationId` (optional): Filter by organization
- `customerId` (optional): Filter by customer

**Example Request:**
```
GET /api/v1/leads?page=1&limit=10&status=PENDING&search=john
```

**Response:**
```json
{
  "success": true,
  "message": "Leads retrieved successfully",
  "data": {
    "leads": [
      {
        "id": 1,
        "name": "John Doe",
        "contact": "+1234567890",
        "status": "PENDING",
        "scrapCategory": "JUNK",
        "customer": {
          "user": {
            "firstName": "John",
            "lastName": "Doe"
          }
        },
        "vehicleType": {
          "name": "Car"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### 3. Get Lead by ID
**GET** `/api/v1/leads/:id`

Retrieves a specific lead by its ID.

**Example Request:**
```
GET /api/v1/leads/1
```

**Response:**
```json
{
  "success": true,
  "message": "Lead retrieved successfully",
  "data": {
    "id": 1,
    "organizationId": 1,
    "customerId": 1,
    "name": "John Doe",
    "contact": "+1234567890",
    "email": "john@example.com",
    "location": "123 Main St, City",
    "vehicleTypeId": 1,
    "scrapCategory": "JUNK",
    "status": "PENDING",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "customer": {
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      }
    },
    "vehicleType": {
      "id": 1,
      "name": "Car"
    },
    "organization": {
      "name": "ScrapCo"
    }
  }
}
```

### 4. Update Lead
**PUT** `/api/v1/leads/:id`

Updates an existing lead.

**Request Body:**
```json
{
  "name": "John Smith",
  "contact": "+1234567891",
  "email": "johnsmith@example.com",
  "location": "456 Oak St, City",
  "vehicleTypeId": 2,
  "scrapCategory": "ACCIDENT_DAMAGED",
  "status": "CONVERTED"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead updated successfully",
  "data": {
    "id": 1,
    "name": "John Smith",
    "contact": "+1234567891",
    "status": "CONVERTED",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 5. Delete Lead
**DELETE** `/api/v1/leads/:id`

Deletes a lead (only if not converted to an order).

**Example Request:**
```
DELETE /api/v1/leads/1
```

**Response:**
```json
{
  "success": true,
  "message": "Lead deleted successfully",
  "data": null
}
```

### 6. Convert Lead
**PUT** `/api/v1/leads/:id/convert`

Converts a pending lead to either converted or rejected status.

**Request Body:**
```json
{
  "status": "CONVERTED"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead converted successfully",
  "data": {
    "id": 1,
    "status": "CONVERTED",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 7. Get Lead Statistics
**GET** `/api/v1/leads/stats/:organizationId`

Retrieves lead statistics for an organization.

**Example Request:**
```
GET /api/v1/leads/stats/1
```

**Response:**
```json
{
  "success": true,
  "message": "Lead statistics retrieved successfully",
  "data": {
    "total": 100,
    "pending": 25,
    "converted": 60,
    "rejected": 15
  }
}
```

## Validation Rules

### Create Lead Validation
- `organizationId`: Required, positive integer
- `customerId`: Required, positive integer
- `name`: Required, 2-100 characters
- `contact`: Required, 10-20 characters
- `email`: Optional, valid email format
- `location`: Optional, max 255 characters
- `vehicleTypeId`: Required, positive integer
- `scrapCategory`: Required, must be one of: JUNK, ACCIDENT_DAMAGED, FULLY_SCRAP

### Update Lead Validation
- All fields are optional
- Same validation rules as create lead
- `status`: Optional, must be one of: PENDING, CONVERTED, REJECTED

### Convert Lead Validation
- `status`: Required, must be either CONVERTED or REJECTED

## Error Responses

### 404 - Lead Not Found
```json
{
  "success": false,
  "message": "Lead not found",
  "statusCode": 404
}
```

### 400 - Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Lead name must be at least 2 characters long"
    }
  ],
  "statusCode": 400
}
```

### 400 - Business Logic Error
```json
{
  "success": false,
  "message": "Cannot delete lead that has been converted to an order",
  "statusCode": 400
}
```

## Business Rules

1. **Lead Creation**: 
   - Customer must exist in the organization
   - Vehicle type must exist in the organization
   - Lead status defaults to PENDING

2. **Lead Conversion**:
   - Only PENDING leads can be converted
   - Converted leads can be either CONVERTED or REJECTED

3. **Lead Deletion**:
   - Cannot delete leads that have been converted to orders
   - Only leads with PENDING status can be deleted

4. **Search Functionality**:
   - Searches across name, contact, email, and location fields
   - Case-insensitive search

5. **Pagination**:
   - Default page size is 10
   - Maximum page size is 100
   - Results are ordered by creation date (newest first)

## Dependencies

The Lead API module depends on:
- Prisma ORM for database operations
- Joi for request validation
- Express.js for routing
- Custom decorators for route registration
- ApiResult utility for standardized responses

## Database Schema

The Lead model is defined in the Prisma schema with the following relationships:
- Belongs to Organization
- Belongs to Customer
- Belongs to VehicleType
- Has one Order (optional)

```prisma
model Lead {
  id            Int       @id @default(autoincrement())
  organizationId Int
  organization   Organization @relation(fields: [organizationId], references: [id])
  customerId    Int
  customer      Customer  @relation(fields: [customerId], references: [id])
  name          String
  contact       String
  email         String?
  location      String?
  vehicleTypeId Int
  vehicleType   VehicleType @relation(fields: [vehicleTypeId], references: [id])
  scrapCategory ScrapCategory
  status        LeadStatus
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  order         Order?
}
``` 