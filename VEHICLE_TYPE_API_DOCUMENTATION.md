# Vehicle Type API Documentation

## Overview
The Vehicle Type API module provides comprehensive functionality for managing vehicle types in the scrap collection service. It includes CRUD operations, search capabilities, and statistical analysis for vehicle types within organizations.

## Base URL
```
/api/v1/vehicle-types
```

## Data Models

### Vehicle Type Interface
```typescript
interface IVehicleType {
  id: number;
  organizationId: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Create Vehicle Type Request
```typescript
interface ICreateVehicleTypeRequest {
  organizationId: number;
  name: string;
  description?: string;
  isActive?: boolean;
}
```

### Update Vehicle Type Request
```typescript
interface IUpdateVehicleTypeRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}
```

### Vehicle Type Query Parameters
```typescript
interface IVehicleTypeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  organizationId?: number;
}
```

## API Endpoints

### 1. Create Vehicle Type
**POST** `/api/v1/vehicle-types`

Creates a new vehicle type for an organization.

**Request Body:**
```json
{
  "organizationId": 1,
  "name": "Sedan",
  "description": "Four-door passenger car",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vehicle type created successfully",
  "data": {
    "id": 1,
    "organizationId": 1,
    "name": "Sedan",
    "description": "Four-door passenger car",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "organization": {
      "name": "ScrapCo"
    }
  },
  "statusCode": 201
}
```

**Validation Rules:**
- `organizationId`: Required, positive integer
- `name`: Required, 2-100 characters
- `description`: Optional, max 500 characters
- `isActive`: Optional, boolean (defaults to true)

**Error Responses:**
- `400`: Vehicle type with this name already exists for this organization
- `404`: Organization not found

### 2. Get Vehicle Types
**GET** `/api/v1/vehicle-types`

Retrieves a paginated list of vehicle types with optional filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page, 1-100 (default: 10)
- `search` (optional): Search in name and description
- `isActive` (optional): Filter by active status
- `organizationId` (optional): Filter by organization

**Example Request:**
```
GET /api/v1/vehicle-types?page=1&limit=10&search=sedan&isActive=true&organizationId=1
```

**Response:**
```json
{
  "success": true,
  "message": "Vehicle types retrieved successfully",
  "data": {
    "vehicleTypes": [
      {
        "id": 1,
        "organizationId": 1,
        "name": "Sedan",
        "description": "Four-door passenger car",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "organization": {
          "name": "ScrapCo"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  },
  "statusCode": 200
}
```

### 3. Get Vehicle Type by ID
**GET** `/api/v1/vehicle-types/:id`

Retrieves a specific vehicle type by its ID.

**Path Parameters:**
- `id`: Vehicle type ID (positive integer)

**Example Request:**
```
GET /api/v1/vehicle-types/1
```

**Response:**
```json
{
  "success": true,
  "message": "Vehicle type retrieved successfully",
  "data": {
    "id": 1,
    "organizationId": 1,
    "name": "Sedan",
    "description": "Four-door passenger car",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "organization": {
      "name": "ScrapCo"
    }
  },
  "statusCode": 200
}
```

**Error Responses:**
- `404`: Vehicle type not found

### 4. Update Vehicle Type
**PUT** `/api/v1/vehicle-types/:id`

Updates an existing vehicle type.

**Path Parameters:**
- `id`: Vehicle type ID (positive integer)

**Request Body:**
```json
{
  "name": "Updated Sedan",
  "description": "Updated description",
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vehicle type updated successfully",
  "data": {
    "id": 1,
    "organizationId": 1,
    "name": "Updated Sedan",
    "description": "Updated description",
    "isActive": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "organization": {
      "name": "ScrapCo"
    }
  },
  "statusCode": 200
}
```

**Validation Rules:**
- `name`: Optional, 2-100 characters
- `description`: Optional, max 500 characters
- `isActive`: Optional, boolean

**Error Responses:**
- `400`: Vehicle type with this name already exists for this organization
- `404`: Vehicle type not found

### 5. Delete Vehicle Type
**DELETE** `/api/v1/vehicle-types/:id`

Deletes a vehicle type if it's not being used in leads or orders.

**Path Parameters:**
- `id`: Vehicle type ID (positive integer)

**Example Request:**
```
DELETE /api/v1/vehicle-types/1
```

**Response:**
```json
{
  "success": true,
  "message": "Vehicle type deleted successfully",
  "data": null,
  "statusCode": 200
}
```

**Error Responses:**
- `400`: Cannot delete vehicle type that is being used in leads/orders
- `404`: Vehicle type not found

### 6. Get Vehicle Type Statistics
**GET** `/api/v1/vehicle-types/stats/:organizationId`

Retrieves statistics for vehicle types within an organization.

**Path Parameters:**
- `organizationId`: Organization ID (positive integer)

**Example Request:**
```
GET /api/v1/vehicle-types/stats/1
```

**Response:**
```json
{
  "success": true,
  "message": "Vehicle type statistics retrieved successfully",
  "data": {
    "total": 5,
    "active": 3,
    "inactive": 2
  },
  "statusCode": 200
}
```

## Business Rules

### Vehicle Type Management
1. **Unique Names**: Vehicle type names must be unique within an organization
2. **Organization Scoping**: Vehicle types are scoped to specific organizations
3. **Deletion Constraints**: Vehicle types cannot be deleted if they are referenced in leads or orders
4. **Active Status**: Vehicle types can be marked as active or inactive for soft deletion

### Validation Rules
1. **Name Validation**: 2-100 characters, required
2. **Description Validation**: Max 500 characters, optional
3. **Organization Validation**: Must reference an existing organization
4. **ID Validation**: Must be positive integers for all ID parameters

### Search and Filtering
1. **Text Search**: Searches in both name and description fields (case-insensitive)
2. **Status Filtering**: Can filter by active/inactive status
3. **Organization Filtering**: Can filter by specific organization
4. **Pagination**: Supports pagination with configurable page size

## Error Handling

### Common Error Codes
- `400 Bad Request`: Validation errors, business rule violations
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side errors

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "statusCode": 400
}
```

## Usage Examples

### Creating Multiple Vehicle Types
```bash
# Create Sedan
curl -X POST /api/v1/vehicle-types \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": 1,
    "name": "Sedan",
    "description": "Four-door passenger car"
  }'

# Create SUV
curl -X POST /api/v1/vehicle-types \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": 1,
    "name": "SUV",
    "description": "Sport utility vehicle"
  }'

# Create Truck
curl -X POST /api/v1/vehicle-types \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": 1,
    "name": "Truck",
    "description": "Commercial truck"
  }'
```

### Searching and Filtering
```bash
# Search for vehicle types containing "car"
curl "GET /api/v1/vehicle-types?search=car"

# Get only active vehicle types
curl "GET /api/v1/vehicle-types?isActive=true"

# Get vehicle types for specific organization with pagination
curl "GET /api/v1/vehicle-types?organizationId=1&page=1&limit=5"
```

### Bulk Operations
```bash
# Get statistics for organization
curl "GET /api/v1/vehicle-types/stats/1"

# Update multiple vehicle types (one by one)
curl -X PUT /api/v1/vehicle-types/1 \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'

curl -X PUT /api/v1/vehicle-types/2 \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'
```

## Integration with Other Modules

### Lead Module Integration
- Vehicle types are referenced in leads via `vehicleTypeId`
- Vehicle type validation occurs during lead creation
- Vehicle types cannot be deleted if referenced in leads

### Order Module Integration
- Vehicle types are referenced in orders via `vehicleTypeId`
- Vehicle type validation occurs during order creation
- Vehicle types cannot be deleted if referenced in orders

### Organization Module Integration
- Vehicle types are scoped to organizations
- Organization validation occurs during vehicle type creation
- Vehicle type statistics are calculated per organization 