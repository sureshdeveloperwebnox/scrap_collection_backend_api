export interface IScrapName {
  id: string;
  name: string;
  scrapCategoryId: string;
  organizationId: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateScrapNameRequest {
  name: string;
  scrapCategoryId: string;
  organizationId: number;
  isActive?: boolean;
}

export interface IUpdateScrapNameRequest {
  name?: string;
  scrapCategoryId?: string;
  isActive?: boolean;
}

export interface IScrapNameQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  scrapCategoryId?: string;
  organizationId?: number;
  isActive?: boolean;
}

