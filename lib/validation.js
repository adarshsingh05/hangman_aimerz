// lib/validation.js - Comprehensive validation utilities

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password validation regex (at least 6 characters, 1 letter, 1 number)
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;

// Name validation regex (letters, spaces, hyphens, apostrophes)
const NAME_REGEX = /^[a-zA-Z\s\-']{2,50}$/;

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {object} - { isValid: boolean, error?: string }
 */
export function validateEmail(email) {
  if (!email) {
    return { isValid: false, error: "Email is required" };
  }
  
  if (typeof email !== 'string') {
    return { isValid: false, error: "Email must be a string" };
  }
  
  if (email.length > 254) {
    return { isValid: false, error: "Email is too long" };
  }
  
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  
  return { isValid: true };
}

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {object} - { isValid: boolean, error?: string }
 */
export function validatePassword(password) {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }
  
  if (typeof password !== 'string') {
    return { isValid: false, error: "Password must be a string" };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: "Password must be at least 6 characters long" };
  }
  
  if (password.length > 128) {
    return { isValid: false, error: "Password is too long" };
  }
  
  if (!PASSWORD_REGEX.test(password)) {
    return { isValid: false, error: "Password must contain at least one letter and one number" };
  }
  
  return { isValid: true };
}

/**
 * Validates name format
 * @param {string} name - Name to validate
 * @returns {object} - { isValid: boolean, error?: string }
 */
export function validateName(name) {
  if (!name) {
    return { isValid: false, error: "Name is required" };
  }
  
  if (typeof name !== 'string') {
    return { isValid: false, error: "Name must be a string" };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < 2) {
    return { isValid: false, error: "Name must be at least 2 characters long" };
  }
  
  if (trimmedName.length > 50) {
    return { isValid: false, error: "Name is too long" };
  }
  
  if (!NAME_REGEX.test(trimmedName)) {
    return { isValid: false, error: "Name can only contain letters, spaces, hyphens, and apostrophes" };
  }
  
  return { isValid: true };
}

/**
 * Validates game score
 * @param {number} score - Score to validate
 * @returns {object} - { isValid: boolean, error?: string }
 */
export function validateScore(score) {
  if (typeof score !== 'number') {
    return { isValid: false, error: "Score must be a number" };
  }
  
  if (!Number.isInteger(score)) {
    return { isValid: false, error: "Score must be an integer" };
  }
  
  if (score < 0) {
    return { isValid: false, error: "Score cannot be negative" };
  }
  
  if (score > 10000) {
    return { isValid: false, error: "Score is too high" };
  }
  
  return { isValid: true };
}

/**
 * Validates game win status
 * @param {boolean} win - Win status to validate
 * @returns {object} - { isValid: boolean, error?: string }
 */
export function validateWinStatus(win) {
  if (typeof win !== 'boolean') {
    return { isValid: false, error: "Win status must be a boolean" };
  }
  
  return { isValid: true };
}

/**
 * Sanitizes string input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized string
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
}

/**
 * Validates and sanitizes user input
 * @param {object} data - Data to validate
 * @param {object} schema - Validation schema
 * @returns {object} - { isValid: boolean, data?: object, errors?: object }
 */
export function validateAndSanitize(data, schema) {
  const errors = {};
  const sanitizedData = {};
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    // Check if field is required
    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[field] = `${rules.label || field} is required`;
      continue;
    }
    
    // Skip validation if field is not required and empty
    if (!rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      sanitizedData[field] = value;
      continue;
    }
    
    // Sanitize string inputs
    if (typeof value === 'string') {
      sanitizedData[field] = sanitizeString(value);
    } else {
      sanitizedData[field] = value;
    }
    
    // Run field-specific validation
    let validation;
    switch (rules.type) {
      case 'email':
        validation = validateEmail(sanitizedData[field]);
        break;
      case 'password':
        validation = validatePassword(sanitizedData[field]);
        break;
      case 'name':
        validation = validateName(sanitizedData[field]);
        break;
      case 'score':
        validation = validateScore(sanitizedData[field]);
        break;
      case 'boolean':
        validation = validateWinStatus(sanitizedData[field]);
        break;
      default:
        validation = { isValid: true };
    }
    
    if (!validation.isValid) {
      errors[field] = validation.error;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    data: sanitizedData,
    errors
  };
}

/**
 * Common validation schemas
 */
export const VALIDATION_SCHEMAS = {
  LOGIN: {
    email: { type: 'email', required: true, label: 'Email' },
    password: { type: 'password', required: true, label: 'Password' }
  },
  
  SIGNUP: {
    name: { type: 'name', required: true, label: 'Name' },
    email: { type: 'email', required: true, label: 'Email' },
    password: { type: 'password', required: true, label: 'Password' }
  },
  
  SCORE_SUBMIT: {
    score: { type: 'score', required: true, label: 'Score' },
    win: { type: 'boolean', required: true, label: 'Win Status' }
  }
};
