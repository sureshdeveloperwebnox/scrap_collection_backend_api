import { parsePhoneNumber, isValidPhoneNumber, CountryCode, parsePhoneNumberWithError } from 'libphonenumber-js';

/**
 * Validates a phone number using libphonenumber-js
 * Requirements:
 * - Accept and store in E.164 format only
 * - Reject invalid length and invalid area codes
 * - Handle Argentina (AR) mobile prefix +54 9
 * 
 * Examples:
 * Argentina (AR): +54 9 11 1234 5678 (Mobile), +54 11 1234 5678 (Landline)
 * USA (US): +1 202 555 0123
 * India (IN): +91 98765 43210
 * 
 * @param phoneNumber - The phone number to validate in E.164 or international format
 * @param countryCode - Optional country code for validation
 */
export function validatePhoneNumber(
  phoneNumber: string,
  countryCode?: CountryCode
): { isValid: boolean; error?: string; formatted?: string; country?: CountryCode; type?: string } {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return {
      isValid: false,
      error: 'Phone number is required'
    };
  }

  const cleanedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber.replace(/\D/g, '')}`;

  try {
    // 1. Parse the number
    const phoneNumberObj = parsePhoneNumberWithError(cleanedPhone, countryCode);

    // 2. Check if valid
    if (!phoneNumberObj.isValid()) {
      return {
        isValid: false,
        error: `Invalid phone number for ${phoneNumberObj.country || 'the selected country'}. Please check the length and area code.`
      };
    }

    // 3. Argentina Specific Rule: Mobile numbers MUST have the '9' prefix after +54
    // libphonenumber-js handles the '9' internally when parsing, 
    // but we should ensure it's stored correctly if it's a mobile number.
    if (phoneNumberObj.country === 'AR') {
      const isMobile = phoneNumberObj.getType() === 'MOBILE';
      const nationalNumber = phoneNumberObj.nationalNumber;

      // If it's Argentina and not already containing the mobile prefix in E.164 but is intended to be mobile
      // Actually, libphonenumber-js's E.164 for AR mobile includes the 9.
      // Example: +5491123456789
    }

    return {
      isValid: true,
      formatted: phoneNumberObj.format('E.164'),
      country: phoneNumberObj.country,
      type: phoneNumberObj.getType()
    };

  } catch (error: any) {
    let message = 'Invalid phone number format.';
    if (error.message === 'INVALID_COUNTRY') message = 'Invalid country code provided.';
    if (error.message === 'TOO_SHORT') message = 'Phone number is too short.';
    if (error.message === 'TOO_LONG') message = 'Phone number is too long.';
    if (error.message === 'NOT_A_NUMBER') message = 'Phone number must contain digits.';

    return {
      isValid: false,
      error: message
    };
  }
}

/**
 * Joi custom validation function for phone numbers
 * Ensures output is always E.164
 */
export const phoneCustomValidation = (value: string, helpers: any) => {
  const validation = validatePhoneNumber(value);

  if (!validation.isValid) {
    return helpers.message(validation.error || 'Invalid phone number');
  }

  // Return the E.164 formatted phone number for storage
  return validation.formatted;
};

