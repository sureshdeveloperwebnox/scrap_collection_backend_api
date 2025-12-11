export interface IEmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables?: {
    [key: string]: any;
  };
  organizationId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateEmailTemplateRequest {
  organizationId: number;
  name: string;
  subject: string;
  body: string;
  variables?: {
    [key: string]: any;
  };
}

export interface IUpdateEmailTemplateRequest {
  name?: string;
  subject?: string;
  body?: string;
  variables?: {
    [key: string]: any;
  };
}

export interface IEmailTemplateQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  organizationId?: number;
}
