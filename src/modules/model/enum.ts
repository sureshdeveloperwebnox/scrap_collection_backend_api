export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  CUSTOMER = 'CUSTOMER'
}

export enum AdminRoleType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  STAFF_ADMIN = 'STAFF_ADMIN'
}

export enum EmployeeRole {
  COLLECTOR = 'COLLECTOR',
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  ACCOUNTANT = 'ACCOUNTANT'
}

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUOTED = 'QUOTED',
  CONVERTED = 'CONVERTED',
  REJECTED = 'REJECTED'
}

export enum VehicleTypeEnum {
  CAR = 'CAR',
  BIKE = 'BIKE',
  TRUCK = 'TRUCK',
  BOAT = 'BOAT',
  VAN = 'VAN',
  SUV = 'SUV'
}

export enum VehicleConditionEnum {
  JUNK = 'JUNK',
  DAMAGED = 'DAMAGED',
  WRECKED = 'WRECKED',
  ACCIDENTAL = 'ACCIDENTAL',
  FULLY_SCRAP = 'FULLY_SCRAP'
}

export enum LeadSourceEnum {
  WEBFORM = 'WEBFORM',
  CHATBOT = 'CHATBOT',
  CALL = 'CALL',
  MANUAL = 'MANUAL'
}

export enum ScrapCategory {
  JUNK = 'JUNK',
  ACCIDENT_DAMAGED = 'ACCIDENT_DAMAGED',
  FULLY_SCRAP = 'FULLY_SCRAP'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatusEnum {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED'
}

export enum PaymentTypeEnum {
  CASH = 'CASH',
  CARD = 'CARD',
  ONLINE = 'ONLINE',
  BANK_TRANSFER = 'BANK_TRANSFER'
}

export enum PaymentStatus {
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum NotificationType {
  PICKUP_REQUEST = 'PICKUP_REQUEST',
  PAYMENT_CONFIRMATION = 'PAYMENT_CONFIRMATION',
  STATUS_UPDATE = 'STATUS_UPDATE',
  NEW_ASSIGNMENT = 'NEW_ASSIGNMENT',
  ORDER_COMPLETED = 'ORDER_COMPLETED',
  REFUND_PROCESSED = 'REFUND_PROCESSED'
}

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  VIP = 'VIP',
  BLOCKED = 'BLOCKED'
}

export enum PickupRequestStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum QuoteResponseEnum {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  CHATBOT = 'CHATBOT'
}

export enum ScrapConditionEnum {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  SCRAP = 'SCRAP',
  HAZARDOUS = 'HAZARDOUS'
}

export enum PaymentMethodEnum {
  CASH = 'CASH',
  CARD = 'CARD',
  UPI = 'UPI',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHEQUE = 'CHEQUE',
  ONLINE = 'ONLINE'
}

export enum CollectionRecordStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED'
}

export enum AssignmentStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}
