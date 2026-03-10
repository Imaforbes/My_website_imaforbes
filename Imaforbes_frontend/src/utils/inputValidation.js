// src/utils/inputValidation.js
// Client-side input validation utilities

/**
 * Validates an email address
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates a name (2-200 characters, alphanumeric and spaces)
 * @param {string} name - Name to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 200) return false;
  // Allow letters, numbers, spaces, and common punctuation
  const nameRegex = /^[a-zA-Z0-9\s\u00C0-\u017F.,'-]+$/;
  return nameRegex.test(trimmed);
};

/**
 * Validates a message (10-2000 characters)
 * @param {string} message - Message to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateMessage = (message) => {
  if (!message || typeof message !== 'string') return false;
  const trimmed = message.trim();
  return trimmed.length >= 10 && trimmed.length <= 2000;
};

/**
 * Sanitizes a string by removing potentially dangerous characters
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers like onclick=
};

/**
 * Validates contact form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateContactForm = (formData) => {
  const errors = {};

  // Validate name
  if (!formData.name || !formData.name.trim()) {
    errors.name = 'Name is required';
  } else if (!validateName(formData.name)) {
    errors.name = 'Name must be between 2 and 200 characters and contain only letters, numbers, and spaces';
  }

  // Validate email
  if (!formData.email || !formData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Validate message
  if (!formData.message || !formData.message.trim()) {
    errors.message = 'Message is required';
  } else if (!validateMessage(formData.message)) {
    errors.message = 'Message must be between 10 and 2000 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates URL to prevent malicious URLs
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    // If URL constructor fails, check if it's a relative path
    return /^\/[a-zA-Z0-9_\/\-\.]+$/.test(url);
  }
};

/**
 * Escapes HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
export const escapeHtml = (str) => {
  if (!str || typeof str !== 'string') return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, (m) => map[m]);
};

