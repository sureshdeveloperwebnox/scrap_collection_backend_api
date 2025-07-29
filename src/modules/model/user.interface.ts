import { UserRole, AdminRoleType } from './enum';

export interface IUser {
  id: string;
  email: string;
  phone?: string;
  password?: string;
  hashPassword?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isActive: boolean;
  organizationId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdminRole {
  id: number;
  userId: string;
  roleType: AdminRoleType;
  createdAt: Date;
  updatedAt: Date;
} 