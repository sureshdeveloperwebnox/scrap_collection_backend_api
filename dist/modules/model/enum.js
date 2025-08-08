"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = exports.PaymentStatus = exports.OrderStatus = exports.ScrapVehicleType = exports.ScrapCategory = exports.LeadStatus = exports.EmployeeRole = exports.AdminRoleType = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["EMPLOYEE"] = "EMPLOYEE";
    UserRole["CUSTOMER"] = "CUSTOMER";
})(UserRole || (exports.UserRole = UserRole = {}));
var AdminRoleType;
(function (AdminRoleType) {
    AdminRoleType["SUPER_ADMIN"] = "SUPER_ADMIN";
    AdminRoleType["STAFF_ADMIN"] = "STAFF_ADMIN";
})(AdminRoleType || (exports.AdminRoleType = AdminRoleType = {}));
var EmployeeRole;
(function (EmployeeRole) {
    EmployeeRole["COLLECTOR"] = "COLLECTOR";
    EmployeeRole["ADMIN_STAFF"] = "ADMIN_STAFF";
})(EmployeeRole || (exports.EmployeeRole = EmployeeRole = {}));
var LeadStatus;
(function (LeadStatus) {
    LeadStatus["PENDING"] = "PENDING";
    LeadStatus["CONVERTED"] = "CONVERTED";
    LeadStatus["REJECTED"] = "REJECTED";
})(LeadStatus || (exports.LeadStatus = LeadStatus = {}));
var ScrapCategory;
(function (ScrapCategory) {
    ScrapCategory["JUNK"] = "JUNK";
    ScrapCategory["ACCIDENT_DAMAGED"] = "ACCIDENT_DAMAGED";
    ScrapCategory["FULLY_SCRAP"] = "FULLY_SCRAP";
})(ScrapCategory || (exports.ScrapCategory = ScrapCategory = {}));
var ScrapVehicleType;
(function (ScrapVehicleType) {
    ScrapVehicleType["CAR"] = "CAR";
    ScrapVehicleType["MOTORCYCLE"] = "MOTORCYCLE";
    ScrapVehicleType["TRUCK"] = "TRUCK";
    ScrapVehicleType["BUS"] = "BUS";
    ScrapVehicleType["TRAILER"] = "TRAILER";
})(ScrapVehicleType || (exports.ScrapVehicleType = ScrapVehicleType = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["ASSIGNED"] = "ASSIGNED";
    OrderStatus["IN_PROGRESS"] = "IN_PROGRESS";
    OrderStatus["COMPLETED"] = "COMPLETED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["SUCCESSFUL"] = "SUCCESSFUL";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["PICKUP_REQUEST"] = "PICKUP_REQUEST";
    NotificationType["PAYMENT_CONFIRMATION"] = "PAYMENT_CONFIRMATION";
    NotificationType["STATUS_UPDATE"] = "STATUS_UPDATE";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
