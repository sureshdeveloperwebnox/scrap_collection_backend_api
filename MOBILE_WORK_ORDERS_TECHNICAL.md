# Mobile Work Orders API - Technical Overview

## Architecture & Design Decisions

### 1. **Separation of Concerns**
The API follows a clean layered architecture:

```
Controller Layer (mobile-work-order.controller.ts)
    ↓
Service Layer (mobile-work-order.ts)
    ↓
Data Layer (Prisma ORM)
```

**Benefits:**
- Easy to test each layer independently
- Business logic isolated from HTTP concerns
- Database queries centralized in service layer

### 2. **Mobile-Optimized Response Format**
Instead of returning raw database models, we transform data to a mobile-friendly structure:

```typescript
// Database Model (verbose, includes relations)
{
  id, orderNumber, customerName, customerPhone, customerEmail,
  assignedCollector: { id, fullName, email, ... },
  yard: { id, yardName, address, ... },
  ...
}

// Mobile Response (clean, nested logically)
{
  id, orderNumber,
  customer: { name, phone, email },
  location: { address, latitude, longitude, distance, estimatedDuration },
  vehicle: { make, model, year, condition },
  assignment: { yard, crew, pickupTime },
  ...
}
```

**Benefits:**
- Reduced payload size
- Easier to consume in mobile apps
- Logical grouping of related data

### 3. **Comprehensive Filtering**
The API supports multiple filter types:

- **Status Filtering:** Single or multiple statuses
- **Date Range:** Creation date, pickup date
- **Location-Based:** Nearby orders within radius
- **Search:** Full-text search across multiple fields
- **Price Range:** Min/max filtering
- **Custom:** Photos, yard assignment, etc.

**Implementation:**
```typescript
// Flexible where clause building
const where: any = { OR: [/* collector or crew assignment */] };

if (status) {
  where.orderStatus = Array.isArray(status) ? { in: status } : status;
}

if (dateFrom || dateTo) {
  where.createdAt = {};
  if (dateFrom) where.createdAt.gte = new Date(dateFrom);
  if (dateTo) where.createdAt.lte = new Date(dateTo);
}
```

### 4. **Location-Based Features**

#### Distance Calculation
Uses the Haversine formula for accurate distance calculation:

```typescript
private calculateDistance(lat1, lon1, lat2, lon2): number {
  const R = 6371; // Earth's radius in km
  // ... Haversine formula implementation
  return distance;
}
```

#### Nearby Search
Filters orders within a specified radius:

```typescript
if (nearLatitude && nearLongitude) {
  filteredOrders = orders.filter(order => {
    const distance = this.calculateDistance(
      nearLatitude, nearLongitude,
      order.latitude, order.longitude
    );
    return distance <= radiusKm;
  });
}
```

**Use Cases:**
- Show collectors only nearby orders
- Calculate travel time estimates
- Optimize route planning

### 5. **Status Management with Validation**

#### State Machine Approach
Valid status transitions are explicitly defined:

```typescript
const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [ASSIGNED, CANCELLED],
  ASSIGNED: [IN_PROGRESS, CANCELLED],
  IN_PROGRESS: [COMPLETED, CANCELLED],
  COMPLETED: [], // Terminal state
  CANCELLED: []  // Terminal state
};
```

**Benefits:**
- Prevents invalid state transitions
- Maintains data integrity
- Clear business rules

#### Timeline Tracking
Every status change is recorded:

```typescript
await prisma.orderTimeline.create({
  data: {
    orderId,
    status: newStatus,
    notes: notes || `Status updated to ${newStatus}`,
    performedBy: collectorId
  }
});
```

### 6. **Performance Optimizations**

#### Pagination
```typescript
const skip = (page - 1) * limit;
const [orders, total] = await Promise.all([
  prisma.order.findMany({ skip, take: limit, ... }),
  prisma.order.count({ where })
]);
```

#### Selective Field Loading
Only fetch required relations:

```typescript
include: {
  yard: true,  // Only if needed
  crew: {
    include: {
      members: { select: { id: true, fullName: true } }  // Minimal fields
    }
  }
}
```

#### Parallel Queries
Use `Promise.all` for independent queries:

```typescript
const [todayAssigned, todayCompleted, todayRevenue] = await Promise.all([
  prisma.order.count({ where: todayWhere }),
  prisma.order.count({ where: completedWhere }),
  prisma.order.aggregate({ where: revenueWhere })
]);
```

### 7. **Security Measures**

#### Authentication
All endpoints protected by JWT middleware:

```typescript
const collectorId = (req as any).user?.id;
if (!collectorId) {
  return ApiResult.error('Collector not authenticated', 401);
}
```

#### Authorization
Collectors can only access their assigned orders:

```typescript
const where = {
  OR: [
    { assignedCollectorId: collectorId },
    { crew: { members: { some: { id: collectorId } } } }
  ]
};
```

#### Input Validation
All inputs validated before processing:

```typescript
@Validate([mobileWorkOrderQuerySchema])
@Validate([mobileUpdateWorkOrderStatusSchema])
```

### 8. **Error Handling**

#### Consistent Error Format
```typescript
try {
  // ... operation
  return ApiResult.success(data, message);
} catch (error: any) {
  console.error('Error context:', error);
  return ApiResult.error(error.message || 'Fallback message', 500);
}
```

#### Specific Error Messages
```typescript
if (!order) {
  return ApiResult.error('Work order not found or not assigned to you', 404);
}

if (!validTransitions[currentStatus].includes(newStatus)) {
  return ApiResult.error(
    `Invalid status transition from ${currentStatus} to ${newStatus}`,
    400
  );
}
```

### 9. **Statistics & Analytics**

#### Time-Based Aggregations
```typescript
const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const startOfWeek = new Date(now);
startOfWeek.setDate(now.getDate() - now.getDay());
```

#### Performance Metrics
- Completion rate: `(completed / total) * 100`
- Revenue tracking by time period
- Average rating from employee record

### 10. **Scalability Considerations**

#### Database Indexes
Ensure these indexes exist:

```sql
CREATE INDEX idx_order_collector ON orders(assignedCollectorId);
CREATE INDEX idx_order_status ON orders(orderStatus);
CREATE INDEX idx_order_created ON orders(createdAt);
CREATE INDEX idx_order_pickup ON orders(pickupTime);
CREATE INDEX idx_order_location ON orders(latitude, longitude);
```

#### Caching Strategy
Consider caching for:
- Collector statistics (5-minute TTL)
- Scrap yard data (1-hour TTL)
- Order counts (1-minute TTL)

#### Query Optimization
- Use `select` to limit fields
- Avoid N+1 queries with `include`
- Use `count` instead of fetching all records

---

## Real-World Best Practices

### 1. **API Versioning**
Current: `/api/v1/mobile/work-orders`
Future: `/api/v2/mobile/work-orders` for breaking changes

### 2. **Rate Limiting**
Implement per-collector rate limits:
- 60 requests/minute for normal operations
- 100 burst capacity for peak usage

### 3. **Monitoring & Logging**
Log important events:
```typescript
console.log(`Collector ${collectorId} updated order ${orderId} to ${status}`);
console.error('Critical error in getWorkOrders:', error);
```

### 4. **Mobile App Integration**

#### Offline Support
- Cache recent orders locally
- Queue status updates when offline
- Sync when connection restored

#### Push Notifications
Trigger notifications for:
- New order assignments
- Pickup time reminders
- Status change confirmations

#### Background Location
- Track collector location periodically
- Update distance calculations
- Optimize route suggestions

### 5. **Testing Strategy**

#### Unit Tests
```typescript
describe('MobileWorkOrderService', () => {
  it('should calculate distance correctly', () => {
    const distance = service.calculateDistance(12.9716, 77.5946, 13.0827, 80.2707);
    expect(distance).toBeCloseTo(283, 0);
  });
});
```

#### Integration Tests
```typescript
describe('GET /mobile/work-orders', () => {
  it('should return only assigned orders', async () => {
    const response = await request(app)
      .get('/api/v1/mobile/work-orders')
      .set('Authorization', `Bearer ${collectorToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.data.orders).toBeDefined();
  });
});
```

### 6. **Documentation Maintenance**
- Keep API docs in sync with code
- Include request/response examples
- Document all error codes
- Provide integration guides

### 7. **Backward Compatibility**
When adding new features:
- Make new fields optional
- Don't remove existing fields
- Use API versioning for breaking changes

---

## Performance Benchmarks

### Expected Response Times
- **List Orders (20 items):** < 200ms
- **Get Single Order:** < 100ms
- **Update Status:** < 150ms
- **Get Statistics:** < 300ms

### Optimization Tips
1. Use database connection pooling
2. Implement Redis caching for hot data
3. Use CDN for photos
4. Compress API responses (gzip)
5. Implement pagination limits (max 100 items)

---

## Future Enhancements

### 1. **Real-Time Updates**
- WebSocket support for live order updates
- Push notifications for status changes

### 2. **Advanced Analytics**
- Route optimization algorithms
- Predictive pickup time estimation
- Revenue forecasting

### 3. **Batch Operations**
- Bulk status updates
- Multi-order assignments

### 4. **Enhanced Search**
- Fuzzy search
- Geospatial queries (PostGIS)
- Full-text search (Elasticsearch)

---

## Conclusion

This API is designed following industry best practices:
- ✅ RESTful design principles
- ✅ Comprehensive error handling
- ✅ Security-first approach
- ✅ Mobile-optimized responses
- ✅ Scalable architecture
- ✅ Well-documented
- ✅ Production-ready

The implementation balances performance, maintainability, and developer experience while providing all features needed for a real-world scrap collection mobile application.
