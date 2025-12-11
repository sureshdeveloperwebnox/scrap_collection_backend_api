"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.phoneCustomValidation = void 0;
exports.validatePhoneNumber = validatePhoneNumber;
const libphonenumber_js_1 = require("libphonenumber-js");
/**
 * Validates a phone number using libphonenumber-js
 * @param phoneNumber - The phone number to validate (can include country code like +1, +91, etc.)
 * @param defaultCountry - Optional default country code (e.g., 'US', 'IN') if phone doesn't include country code
 * @returns Object with isValid boolean and error message if invalid
 */
function validatePhoneNumber(phoneNumber, defaultCountry) {
    if (!phoneNumber || typeof phoneNumber !== 'string') {
        return {
            isValid: false,
            error: 'Phone number is required and must be a string'
        };
    }
    // Remove any whitespace
    const cleanedPhone = phoneNumber.trim();
    // Check if phone number is valid
    try {
        const isValid = (0, libphonenumber_js_1.isValidPhoneNumber)(cleanedPhone, defaultCountry);
        if (!isValid) {
            return {
                isValid: false,
                error: 'Please provide a valid phone number with country code (e.g., +1 234 567 8900, +91 98765 43210)'
            };
        }
        // Parse and format the phone number
        const phoneNumberObj = (0, libphonenumber_js_1.parsePhoneNumber)(cleanedPhone, defaultCountry);
        const formatted = phoneNumberObj.formatInternational();
        return {
            isValid: true,
            formatted
        };
    }
    catch (error) {
        return {
            isValid: false,
            error: 'Invalid phone number format. Please include country code (e.g., +1, +91, +44)'
        };
    }
}
/**
 * Joi custom validation function for phone numbers
 */
const phoneCustomValidation = (value, helpers) => {
    const validation = validatePhoneNumber(value);
    if (!validation.isValid) {
        return helpers.error('any.custom', {
            message: validation.error || 'Phone number must be a valid international phone number with country code (e.g., +1 234 567 8900, +91 98765 43210)'
        });
    }
    // Return the formatted phone number
    return validation.formatted || value;
};
exports.phoneCustomValidation = phoneCustomValidation;
