// src/utils/inputValidation.js
// Client-side input validation utilities (bilingual ES/EN)

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
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
};

/**
 * Validates contact form data with bilingual support
 * @param {Object} formData - Form data to validate
 * @param {string} [lang='es'] - Active language ('es' or 'en')
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateContactForm = (formData, lang = 'es') => {
  const isEs = String(lang || 'es').toLowerCase().startsWith('es');
  const errors = {};

  if (!formData.name || !formData.name.trim()) {
    errors.name = isEs ? 'El nombre es obligatorio' : 'Name is required';
  } else if (!validateName(formData.name)) {
    errors.name = isEs
      ? 'El nombre debe tener entre 2 y 200 caracteres válidos'
      : 'Name must be between 2 and 200 valid characters';
  }

  if (!formData.email || !formData.email.trim()) {
    errors.email = isEs ? 'El correo electrónico es obligatorio' : 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = isEs
      ? 'Por favor ingresa un correo electrónico válido'
      : 'Please enter a valid email address';
  }

  if (!formData.message || !formData.message.trim()) {
    errors.message = isEs ? 'El mensaje es obligatorio' : 'Message is required';
  } else if (!validateMessage(formData.message)) {
    errors.message = isEs
      ? 'El mensaje debe tener entre 10 y 2000 caracteres'
      : 'Message must be between 10 and 2000 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
