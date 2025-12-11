export interface IRole {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateRoleRequest {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface IUpdateRoleRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface IRoleQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'isActive' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

