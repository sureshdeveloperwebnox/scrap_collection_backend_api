import { UserRole } from "./enum";

export interface ISignUpData {
  name: string;
  firstName: string;
  lastName?: string;
  address?: string;
  phone?: string;
  email: string;
  password: string;
  countryId: number;
  role?: UserRole;
}

export interface ISignInData {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: {
    id: string;
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    role: UserRole;
    organizationId?: number;
  };
  token: string;
} 


