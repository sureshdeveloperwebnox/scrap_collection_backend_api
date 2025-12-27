# Scrap Collection API Updates

## Summary of Changes

### 1. Modified POST Response (Create Record)
**Endpoint:** `POST /api/v1/mobile/scrap-collections`

**Change:** The response now returns only the ID of the created record instead of the full record data.

**Response Example:**
```json
{
  "success": true,
  "message": "Collection record created successfully",
  "statusCode": 201,
  "data": {
    "id": "uuid-here"
  }
}
```

### 2. Get Full Record Details
**Endpoint:** `GET /api/v1/mobile/scrap-collections/:id`

**Purpose:** Fetch complete details of a scrap collection record by ID.

**Response:** Returns full record with all relations (customer, order, scrap category, scrap name, collector, etc.)

### 3. PDF Download Endpoint
**Endpoint:** `GET /api/v1/mobile/scrap-collections/:id/pdf`

**Purpose:** Generate and download PDF for a scrap collection record.

**Response:**
```json
{
  "success": true,
  "message": "PDF data generated successfully",
  "data": {
    "html": "<html>...</html>",
    "record": { /* full record data */ }
  }
}
```

**PDF Features:**
- Professional layout with proper alignment
- Sections for:
  - Work Order Information
  - Customer Information
  - Scrap Details (category, name, condition, weight, quantity, make, model, year)
  - Pricing (quoted and final amounts)
  - Photos (grid layout)
  - Signatures (customer and collector)
- Color-coded status badges
- Formatted dates and currency
- Print-ready design

## Frontend Implementation Guide

### Work Order Details Page

You need to add a new card/section to display scrap collection form data:

```typescript
// 1. Fetch scrap collection records for a work order
const fetchScrapCollectionRecords = async (workOrderId: string) => {
  const response = await fetch(
    `/api/v1/mobile/scrap-collections?workOrderId=${workOrderId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.json();
};

// 2. Fetch specific record details
const fetchRecordDetails = async (recordId: string) => {
  const response = await fetch(
    `/api/v1/mobile/scrap-collections/${recordId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.json();
};

// 3. Download PDF
const downloadPDF = async (recordId: string) => {
  const response = await fetch(
    `/api/v1/mobile/scrap-collections/${recordId}/pdf`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  const data = await response.json();
  
  // Option 1: Open in new window
  const printWindow = window.open('', '_blank');
  printWindow.document.write(data.data.html);
  printWindow.document.close();
  printWindow.print();
  
  // Option 2: Use html2pdf library
  // import html2pdf from 'html2pdf.js';
  // html2pdf().from(data.data.html).save(`scrap-record-${recordId}.pdf`);
};
```

### Suggested UI Component Structure

```tsx
// ScrapCollectionCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';

export function ScrapCollectionCard({ workOrderId }: { workOrderId: string }) {
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    // Fetch records for this work order
    fetchScrapCollectionRecords(workOrderId).then(data => {
      setRecords(data.data.records);
    });
  }, [workOrderId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scrap Collection Forms</CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <p className="text-muted-foreground">No collection forms submitted yet</p>
        ) : (
          <div className="space-y-4">
            {records.map(record => (
              <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{record.scrap_categories?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(record.collectionDate).toLocaleDateString()}
                  </p>
                  <span className={`inline-block px-2 py-1 text-xs rounded ${
                    record.collectionStatus === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-800' :
                    record.collectionStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {record.collectionStatus}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      fetchRecordDetails(record.id).then(data => {
                        setSelectedRecord(data.data);
                      });
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadPDF(record.id)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

## Testing

### Test the Create Endpoint
```bash
curl -X POST http://localhost:9645/api/v1/mobile/scrap-collections \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "workOrderId": "WO-27122025-1",
    "assignOrderId": "uuid",
    "customerId": "uuid",
    "scrapCategoryId": "uuid",
    "scrapNameId": "uuid",
    "collectionDate": "2025-12-28",
    "scrapDescription": "Test description",
    "scrapCondition": "DAMAGED",
    "weight": 65.5,
    "quantity": 1,
    "quotedAmount": 3500,
    "finalAmount": 3200,
    "photos": ["url1", "url2"],
    "customerSignature": "signature-url",
    "collectorSignature": "signature-url"
  }'
```

### Test the PDF Endpoint
```bash
curl -X GET http://localhost:9645/api/v1/mobile/scrap-collections/{record-id}/pdf \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Next Steps

1. **Frontend Dashboard:**
   - Add the ScrapCollectionCard component to the work order details page
   - Implement the view modal to show full record details
   - Add PDF download functionality

2. **Optional Enhancements:**
   - Add filtering by status in the work order view
   - Add bulk PDF download for multiple records
   - Add email functionality to send PDF to customer
   - Add approval/rejection workflow for submitted forms

## API Endpoints Summary

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/mobile/scrap-collections/form-helpers` | Get form dropdown data | Yes (Collector) |
| POST | `/mobile/scrap-collections` | Create new record | Yes (Collector) |
| GET | `/mobile/scrap-collections` | List records with filters | Yes (Collector) |
| GET | `/mobile/scrap-collections/:id` | Get record details | Yes (Collector) |
| PUT | `/mobile/scrap-collections/:id` | Update record | Yes (Collector) |
| DELETE | `/mobile/scrap-collections/:id` | Delete record | Yes (Collector) |
| GET | `/mobile/scrap-collections/:id/pdf` | Download PDF | Yes (Collector) |
