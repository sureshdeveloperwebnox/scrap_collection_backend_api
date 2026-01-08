"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentStatus = exports.CollectionRecordStatus = exports.PaymentMethodEnum = exports.ScrapConditionEnum = exports.QuoteResponseEnum = exports.PickupRequestStatus = exports.CustomerStatus = exports.NotificationType = exports.PaymentStatus = exports.PaymentTypeEnum = exports.PaymentStatusEnum = exports.OrderStatus = exports.ScrapCategory = exports.LeadSourceEnum = exports.VehicleConditionEnum = exports.VehicleTypeEnum = exports.LeadStatus = exports.EmployeeRole = exports.AdminRoleType = exports.UserRole = void 0;
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
    EmployeeRole["ADMIN"] = "ADMIN";
    EmployeeRole["SUPERVISOR"] = "SUPERVISOR";
    EmployeeRole["ACCOUNTANT"] = "ACCOUNTANT";
})(EmployeeRole || (exports.EmployeeRole = EmployeeRole = {}));
var LeadStatus;
(function (LeadStatus) {
    LeadStatus["NEW"] = "NEW";
    LeadStatus["CONTACTED"] = "CONTACTED";
    LeadStatus["QUOTED"] = "QUOTED";
    LeadStatus["CONVERTED"] = "CONVERTED";
    LeadStatus["REJECTED"] = "REJECTED";
})(LeadStatus || (exports.LeadStatus = LeadStatus = {}));
var VehicleTypeEnum;
(function (VehicleTypeEnum) {
    VehicleTypeEnum["CAR"] = "CAR";
    VehicleTypeEnum["BIKE"] = "BIKE";
    VehicleTypeEnum["TRUCK"] = "TRUCK";
    VehicleTypeEnum["BOAT"] = "BOAT";
    VehicleTypeEnum["VAN"] = "VAN";
    VehicleTypeEnum["SUV"] = "SUV";
})(VehicleTypeEnum || (exports.VehicleTypeEnum = VehicleTypeEnum = {}));
var VehicleConditionEnum;
(function (VehicleConditionEnum) {
    VehicleConditionEnum["JUNK"] = "JUNK";
    VehicleConditionEnum["DAMAGED"] = "DAMAGED";
    VehicleConditionEnum["WRECKED"] = "WRECKED";
    VehicleConditionEnum["ACCIDENTAL"] = "ACCIDENTAL";
    VehicleConditionEnum["FULLY_SCRAP"] = "FULLY_SCRAP";
})(VehicleConditionEnum || (exports.VehicleConditionEnum = VehicleConditionEnum = {}));
var LeadSourceEnum;
(function (LeadSourceEnum) {
    LeadSourceEnum["WEBFORM"] = "WEBFORM";
    LeadSourceEnum["CHATBOT"] = "CHATBOT";
    LeadSourceEnum["CALL"] = "CALL";
    LeadSourceEnum["MANUAL"] = "MANUAL";
})(LeadSourceEnum || (exports.LeadSourceEnum = LeadSourceEnum = {}));
var ScrapCategory;
(function (ScrapCategory) {
    ScrapCategory["JUNK"] = "JUNK";
    ScrapCategory["ACCIDENT_DAMAGED"] = "ACCIDENT_DAMAGED";
    ScrapCategory["FULLY_SCRAP"] = "FULLY_SCRAP";
})(ScrapCategory || (exports.ScrapCategory = ScrapCategory = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["ASSIGNED"] = "ASSIGNED";
    OrderStatus["IN_PROGRESS"] = "IN_PROGRESS";
    OrderStatus["COMPLETED"] = "COMPLETED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var PaymentStatusEnum;
(function (PaymentStatusEnum) {
    PaymentStatusEnum["UNPAID"] = "UNPAID";
    PaymentStatusEnum["PAID"] = "PAID";
    PaymentStatusEnum["REFUNDED"] = "REFUNDED";
})(PaymentStatusEnum || (exports.PaymentStatusEnum = PaymentStatusEnum = {}));
var PaymentTypeEnum;
(function (PaymentTypeEnum) {
    PaymentTypeEnum["CASH"] = "CASH";
    PaymentTypeEnum["CARD"] = "CARD";
    PaymentTypeEnum["ONLINE"] = "ONLINE";
    PaymentTypeEnum["BANK_TRANSFER"] = "BANK_TRANSFER";
})(PaymentTypeEnum || (exports.PaymentTypeEnum = PaymentTypeEnum = {}));
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
    NotificationType["NEW_ASSIGNMENT"] = "NEW_ASSIGNMENT";
    NotificationType["ORDER_COMPLETED"] = "ORDER_COMPLETED";
    NotificationType["REFUND_PROCESSED"] = "REFUND_PROCESSED";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var CustomerStatus;
(function (CustomerStatus) {
    CustomerStatus["ACTIVE"] = "ACTIVE";
    CustomerStatus["INACTIVE"] = "INACTIVE";
    CustomerStatus["VIP"] = "VIP";
    CustomerStatus["BLOCKED"] = "BLOCKED";
})(CustomerStatus || (exports.CustomerStatus = CustomerStatus = {}));
var PickupRequestStatus;
(function (PickupRequestStatus) {
    PickupRequestStatus["PENDING"] = "PENDING";
    PickupRequestStatus["ASSIGNED"] = "ASSIGNED";
    PickupRequestStatus["IN_TRANSIT"] = "IN_TRANSIT";
    PickupRequestStatus["COMPLETED"] = "COMPLETED";
    PickupRequestStatus["CANCELLED"] = "CANCELLED";
})(PickupRequestStatus || (exports.PickupRequestStatus = PickupRequestStatus = {}));
var QuoteResponseEnum;
(function (QuoteResponseEnum) {
    QuoteResponseEnum["EMAIL"] = "EMAIL";
    QuoteResponseEnum["SMS"] = "SMS";
    QuoteResponseEnum["CHATBOT"] = "CHATBOT";
})(QuoteResponseEnum || (exports.QuoteResponseEnum = QuoteResponseEnum = {}));
var ScrapConditionEnum;
(function (ScrapConditionEnum) {
    ScrapConditionEnum["JUNK"] = "JUNK";
    ScrapConditionEnum["DAMAGED"] = "DAMAGED";
    ScrapConditionEnum["WRECKED"] = "WRECKED";
    ScrapConditionEnum["ACCIDENTAL"] = "ACCIDENTAL";
    ScrapConditionEnum["FULLY_SCRAP"] = "FULLY_SCRAP";
})(ScrapConditionEnum || (exports.ScrapConditionEnum = ScrapConditionEnum = {}));
var PaymentMethodEnum;
(function (PaymentMethodEnum) {
    PaymentMethodEnum["CASH"] = "CASH";
    PaymentMethodEnum["CARD"] = "CARD";
    PaymentMethodEnum["UPI"] = "UPI";
    PaymentMethodEnum["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethodEnum["CHEQUE"] = "CHEQUE";
    PaymentMethodEnum["ONLINE"] = "ONLINE";
})(PaymentMethodEnum || (exports.PaymentMethodEnum = PaymentMethodEnum = {}));
var CollectionRecordStatus;
(function (CollectionRecordStatus) {
    CollectionRecordStatus["DRAFT"] = "DRAFT";
    CollectionRecordStatus["SUBMITTED"] = "SUBMITTED";
    CollectionRecordStatus["APPROVED"] = "APPROVED";
    CollectionRecordStatus["REJECTED"] = "REJECTED";
    CollectionRecordStatus["COMPLETED"] = "COMPLETED";
})(CollectionRecordStatus || (exports.CollectionRecordStatus = CollectionRecordStatus = {}));
var AssignmentStatus;
(function (AssignmentStatus) {
    AssignmentStatus["PENDING"] = "PENDING";
    AssignmentStatus["IN_PROGRESS"] = "IN_PROGRESS";
    AssignmentStatus["COMPLETED"] = "COMPLETED";
})(AssignmentStatus || (exports.AssignmentStatus = AssignmentStatus = {}));
