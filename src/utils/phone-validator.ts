import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';

/**
 * Validates a phone number using libphonenumber-js
 * @param phoneNumber - The phone number to validate (can include country code like +1, +91, etc.)
 * @param defaultCountry - Optional default country code (e.g., 'US', 'IN') if phone doesn't include country code
 * @returns Object with isValid boolean and error message if invalid
 */
export function validatePhoneNumber(
  phoneNumber: string,
  defaultCountry?: CountryCode
): { isValid: boolean; error?: string; formatted?: string } {
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
    const isValid = isValidPhoneNumber(cleanedPhone, defaultCountry);
    
    if (!isValid) {
      return {
        isValid: false,
        error: 'Please provide a valid phone number with country code (e.g., +1 234 567 8900, +91 98765 43210)'
      };
    }

    // Parse and format the phone number
    const phoneNumberObj = parsePhoneNumber(cleanedPhone, defaultCountry);
    const formatted = phoneNumberObj.formatInternational();

    return {
      isValid: true,
      formatted
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid phone number format. Please include country code (e.g., +1, +91, +44)'
    };
  }
}

/**
 * Joi custom validation function for phone numbers
 */
export const phoneCustomValidation = (value: string, helpers: any) => {
  const validation = validatePhoneNumber(value);
  
  if (!validation.isValid) {
    return helpers.error('any.custom', {
      message: validation.error || 'Phone number must be a valid international phone number with country code (e.g., +1 234 567 8900, +91 98765 43210)'
    });
  }
  
  // Return the formatted phone number
  return validation.formatted || value;
};

