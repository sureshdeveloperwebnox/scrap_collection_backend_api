export interface IReview {
  id: string;
  orderId: string;
  customerId: string;
  collectorId: string;
  rating: number; // 1-5
  comment?: string;
  organizationId: number;
  createdAt: Date;
  updatedAt: Date;
} 

export interface ICreateReviewRequest {
  orderId: string;
  customerId: string;
  collectorId: string;
  rating: number;
  comment?: string;
  organizationId: number;
}

export interface IUpdateReviewRequest {
  rating?: number;
  comment?: string;
}

export interface IReviewQueryParams {
  page?: number;
  limit?: number;
  collectorId?: string;
  customerId?: string;
  minRating?: number;
  organizationId?: number;
}
