// lib/frontendValidation.js - Frontend validation utilities

/**
 * Real-time form validation for frontend
 */
export class FormValidator {
  constructor(formElement, validationRules) {
    this.form = formElement;
    this.rules = validationRules;
    this.errors = {};
    this.init();
  }

  init() {
    // Add event listeners for real-time validation
    Object.keys(this.rules).forEach(fieldName => {
      const field = this.form.querySelector(`[name="${fieldName}"]`);
      if (field) {
        field.addEventListener('blur', () => this.validateField(fieldName));
        field.addEventListener('input', () => this.clearFieldError(fieldName));
      }
    });
  }

  validateField(fieldName) {
    const field = this.form.querySelector(`[name="${fieldName}"]`);
    if (!field) return true;

    const value = field.value.trim();
    const rules = this.rules[fieldName];
    const error = this.validateValue(value, rules, fieldName);

    if (error) {
      this.setFieldError(fieldName, error);
      return false;
    } else {
      this.clearFieldError(fieldName);
      return true;
    }
  }

  validateValue(value, rules, fieldName) {
    // Required validation
    if (rules.required && (!value || value.length === 0)) {
      return `${rules.label || fieldName} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value && !rules.required) {
      return null;
    }

    // Email validation
    if (rules.type === 'email') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    // Password validation
    if (rules.type === 'password') {
      if (value.length < 6) {
        return 'Password must be at least 6 characters long';
      }
      if (value.length > 128) {
        return 'Password is too long';
      }
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
      if (!passwordRegex.test(value)) {
        return 'Password must contain at least one letter and one number';
      }
    }

    // Name validation
    if (rules.type === 'name') {
      if (value.length < 2) {
        return 'Name must be at least 2 characters long';
      }
      if (value.length > 50) {
        return 'Name is too long';
      }
      const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
      if (!nameRegex.test(value)) {
        return 'Name can only contain letters, spaces, hyphens, and apostrophes';
      }
    }

    // Min length validation
    if (rules.minLength && value.length < rules.minLength) {
      return `${rules.label || fieldName} must be at least ${rules.minLength} characters long`;
    }

    // Max length validation
    if (rules.maxLength && value.length > rules.maxLength) {
      return `${rules.label || fieldName} must be no more than ${rules.maxLength} characters long`;
    }

    // Custom validation
    if (rules.custom && typeof rules.custom === 'function') {
      const customError = rules.custom(value);
      if (customError) {
        return customError;
      }
    }

    return null;
  }

  setFieldError(fieldName, error) {
    this.errors[fieldName] = error;
    
    const field = this.form.querySelector(`[name="${fieldName}"]`);
    if (field) {
      field.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
      field.classList.remove('border-slate-300', 'focus:border-slate-900', 'focus:ring-slate-900');
    }

    // Show error message
    this.showFieldError(fieldName, error);
  }

  clearFieldError(fieldName) {
    delete this.errors[fieldName];
    
    const field = this.form.querySelector(`[name="${fieldName}"]`);
    if (field) {
      field.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
      field.classList.add('border-slate-300', 'focus:border-slate-900', 'focus:ring-slate-900');
    }

    // Hide error message
    this.hideFieldError(fieldName);
  }

  showFieldError(fieldName, error) {
    const field = this.form.querySelector(`[name="${fieldName}"]`);
    if (!field) return;

    // Remove existing error message
    this.hideFieldError(fieldName);

    // Create error message element
    const errorElement = document.createElement('p');
    errorElement.className = 'text-red-600 dark:text-red-400 text-sm mt-1';
    errorElement.id = `${fieldName}-error`;
    errorElement.textContent = error;

    // Insert after the field
    field.parentNode.insertBefore(errorElement, field.nextSibling);
  }

  hideFieldError(fieldName) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    if (errorElement) {
      errorElement.remove();
    }
  }

  validateForm() {
    let isValid = true;
    
    Object.keys(this.rules).forEach(fieldName => {
      const fieldValid = this.validateField(fieldName);
      if (!fieldValid) {
        isValid = false;
      }
    });

    return isValid;
  }

  getErrors() {
    return { ...this.errors };
  }

  clearAllErrors() {
    Object.keys(this.rules).forEach(fieldName => {
      this.clearFieldError(fieldName);
    });
    this.errors = {};
  }
}

/**
 * Common validation rules for forms
 */
export const VALIDATION_RULES = {
  LOGIN: {
    email: {
      type: 'email',
      required: true,
      label: 'Email'
    },
    password: {
      type: 'password',
      required: true,
      label: 'Password'
    }
  },

  SIGNUP: {
    name: {
      type: 'name',
      required: true,
      label: 'Name'
    },
    email: {
      type: 'email',
      required: true,
      label: 'Email'
    },
    password: {
      type: 'password',
      required: true,
      label: 'Password'
    },
    confirmPassword: {
      type: 'password',
      required: true,
      label: 'Confirm Password',
      custom: (value) => {
        const passwordField = document.querySelector('[name="password"]');
        if (passwordField && value !== passwordField.value) {
          return 'Passwords do not match';
        }
        return null;
      }
    }
  }
};

/**
 * Utility function to create a form validator
 */
export function createFormValidator(formElement, rules) {
  return new FormValidator(formElement, rules);
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
}

/**
 * Format error message for display
 */
export function formatErrorMessage(error) {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && error.message) {
    return error.message;
  }
  
  if (error && error.error) {
    return error.error;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Show global error message
 */
export function showGlobalError(message, containerId = 'error-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Clear existing errors
  container.innerHTML = '';

  // Create error element
  const errorElement = document.createElement('div');
  errorElement.className = 'mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg';
  
  const errorText = document.createElement('p');
  errorText.className = 'text-red-700 dark:text-red-300 text-sm font-medium';
  errorText.textContent = formatErrorMessage(message);
  
  errorElement.appendChild(errorText);
  container.appendChild(errorElement);
}

/**
 * Clear global error message
 */
export function clearGlobalError(containerId = 'error-container') {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '';
  }
}

/**
 * Show success message
 */
export function showSuccessMessage(message, containerId = 'success-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Clear existing messages
  container.innerHTML = '';

  // Create success element
  const successElement = document.createElement('div');
  successElement.className = 'mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg';
  
  const successText = document.createElement('p');
  successText.className = 'text-green-700 dark:text-green-300 text-sm font-medium';
  successText.textContent = message;
  
  successElement.appendChild(successText);
  container.appendChild(successElement);
}
