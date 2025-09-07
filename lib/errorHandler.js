
export function createErrorResponse(message, statusCode = 500, details = {}) {
  return {
    error: message,
    statusCode,
    timestamp: new Date().toISOString(),
    ...details
  };
}


export function handleApiError(error, context = 'Unknown') {
  console.error(`[${context}] Error:`, error);
  
  // Database connection errors
  if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
    return createErrorResponse(
      'Database connection failed. Please try again later.',
      503,
      { type: 'DATABASE_ERROR' }
    );
  }
  
  // Validation errors
  if (error.name === 'ValidationError') {
    const validationErrors = Object.values(error.errors).map(err => err.message);
    return createErrorResponse(
      'Validation failed',
      400,
      { type: 'VALIDATION_ERROR', details: validationErrors }
    );
  }
  
  // Duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return createErrorResponse(
      `${field} already exists`,
      409,
      { type: 'DUPLICATE_ERROR', field }
    );
  }
  
  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return createErrorResponse(
      'Invalid authentication token',
      401,
      { type: 'AUTH_ERROR' }
    );
  }
  
  if (error.name === 'TokenExpiredError') {
    return createErrorResponse(
      'Authentication token has expired',
      401,
      { type: 'AUTH_ERROR' }
    );
  }
  
  // Rate limiting errors
  if (error.statusCode === 429) {
    return createErrorResponse(
      'Too many requests. Please try again later.',
      429,
      { type: 'RATE_LIMIT_ERROR' }
    );
  }
  
  // Default server error
  return createErrorResponse(
    'An unexpected error occurred. Please try again later.',
    500,
    { type: 'INTERNAL_ERROR' }
  );
}

/**
 * Validates request body and returns standardized error if invalid
 * @param {object} body - Request body
 * @param {object} schema - Validation schema
 * @returns {object|null} - Error response or null if valid
 */
export function validateRequestBody(body, schema) {
  if (!body || typeof body !== 'object') {
    return createErrorResponse(
      'Request body is required and must be a valid JSON object',
      400,
      { type: 'VALIDATION_ERROR' }
    );
  }
  
  const missingFields = [];
  const invalidFields = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = body[field];
    
    // Check required fields
    if (rules.required && (value === undefined || value === null || value === '')) {
      missingFields.push(field);
    }
    
    // Check field types
    if (value !== undefined && value !== null && rules.type) {
      const expectedType = rules.type;
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      
      if (expectedType !== actualType) {
        invalidFields.push(`${field} must be of type ${expectedType}`);
      }
    }
  }
  
  if (missingFields.length > 0 || invalidFields.length > 0) {
    return createErrorResponse(
      'Invalid request data',
      400,
      {
        type: 'VALIDATION_ERROR',
        missingFields,
        invalidFields
      }
    );
  }
  
  return null;
}

/**
 * Creates a standardized API response
 * @param {object} data - Response data
 * @param {number} statusCode - HTTP status code
 * @param {object} headers - Additional headers
 * @returns {object} - Standardized response
 */
export function createApiResponse(data, statusCode = 200, headers = {}) {
  return {
    data,
    statusCode,
    timestamp: new Date().toISOString(),
    success: statusCode >= 200 && statusCode < 300,
    ...headers
  };
}

/**
 * Async error wrapper for API routes
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Wrapped function with error handling
 */
export function asyncHandler(fn) {
  return async (req, res, ...args) => {
    try {
      await fn(req, res, ...args);
    } catch (error) {
      const errorResponse = handleApiError(error, fn.name);
      
      if (res && res.status) {
        // Next.js API route
        return res.status(errorResponse.statusCode).json(errorResponse);
      }
      
      // Fallback for other environments
      console.error('Unhandled error:', errorResponse);
      throw error;
    }
  };
}

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  LOGIN: { requests: 5, window: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  SIGNUP: { requests: 3, window: 60 * 60 * 1000 }, // 3 requests per hour
  GAME: { requests: 100, window: 60 * 1000 }, // 100 requests per minute
  SCORE: { requests: 50, window: 60 * 1000 } // 50 requests per minute
};

/**
 * Simple in-memory rate limiter (for production, use Redis)
 */
const rateLimitStore = new Map();

export function checkRateLimit(identifier, limit) {
  const now = Date.now();
  const windowStart = now - limit.window;
  
  // Get or create rate limit data
  let rateLimitData = rateLimitStore.get(identifier) || { requests: [], lastCleanup: now };
  
  // Clean up old requests
  if (now - rateLimitData.lastCleanup > limit.window) {
    rateLimitData.requests = rateLimitData.requests.filter(time => time > windowStart);
    rateLimitData.lastCleanup = now;
  }
  
  // Check if limit exceeded
  if (rateLimitData.requests.length >= limit.requests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: rateLimitData.requests[0] + limit.window
    };
  }
  
  // Add current request
  rateLimitData.requests.push(now);
  rateLimitStore.set(identifier, rateLimitData);
  
  return {
    allowed: true,
    remaining: limit.requests - rateLimitData.requests.length,
    resetTime: now + limit.window
  };
}

/**
 * Security headers for API responses
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'"
};
