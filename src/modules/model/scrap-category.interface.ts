export interface IScrapCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  organizationId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateScrapCategoryRequest {
  organizationId: number;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface IUpdateScrapCategoryRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface IScrapCategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  organizationId?: number;
  isActive?: boolean | string;
}

