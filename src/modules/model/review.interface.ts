export interface IReview {
  id: number;
  organizationId: number;
  customerId: number;
  employeeId: number;
  orderId: number;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
} 