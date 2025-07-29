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
  ADMIN_STAFF = 'ADMIN_STAFF'
}

export enum LeadStatus {
  PENDING = 'PENDING',
  CONVERTED = 'CONVERTED',
  REJECTED = 'REJECTED'
}

export enum ScrapCategory {
  JUNK = 'JUNK',
  ACCIDENT_DAMAGED = 'ACCIDENT_DAMAGED',
  FULLY_SCRAP = 'FULLY_SCRAP'
}

export enum ScrapVehicleType {
  CAR = 'CAR',
  MOTORCYCLE = 'MOTORCYCLE',
  TRUCK = 'TRUCK',
  BUS = 'BUS',
  TRAILER = 'TRAILER'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum NotificationType {
  PICKUP_REQUEST = 'PICKUP_REQUEST',
  PAYMENT_CONFIRMATION = 'PAYMENT_CONFIRMATION',
  STATUS_UPDATE = 'STATUS_UPDATE'
}


