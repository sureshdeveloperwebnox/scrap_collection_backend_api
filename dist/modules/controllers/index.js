"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./auth.controller"), exports);
__exportStar(require("./hello.controller"), exports);
__exportStar(require("./country.controller"), exports);
__exportStar(require("./lead.controller"), exports);
__exportStar(require("./vehicle-type.controller"), exports);
__exportStar(require("./vehicle-name.controller"), exports);
__exportStar(require("./collector-assignment.controller"), exports);
__exportStar(require("./customer.controller"), exports);
__exportStar(require("./employee.controller"), exports);
__exportStar(require("./order.controller"), exports);
__exportStar(require("./pickup-request.controller"), exports);
__exportStar(require("./payment.controller"), exports);
__exportStar(require("./review.controller"), exports);
__exportStar(require("./scrapyard.controller"), exports);
__exportStar(require("./scrap-category.controller"), exports);
__exportStar(require("./scrap-name.controller"), exports);
__exportStar(require("./upload.controller"), exports);
__exportStar(require("./city.controller"), exports);
__exportStar(require("./role.controller"), exports);
