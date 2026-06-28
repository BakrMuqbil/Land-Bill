// backend/utils/caseConverter.js

/**
 * تحويل camelCase إلى snake_case
 * مثال: customerName → customer_name
 */
const toSnakeCase = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
};

/**
 * تحويل snake_case إلى camelCase
 * مثال: customer_name → customerName
 */
const toCamelCase = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  }
  return result;
};

/**
 * تحويل مصفوفة كاملة من snake_case إلى camelCase
 */
const toCamelCaseArray = (arr) => {
  if (!Array.isArray(arr)) return arr;
  return arr.map(item => toCamelCase(item));
};

/**
 * تحويل مصفوفة كاملة من camelCase إلى snake_case
 */
const toSnakeCaseArray = (arr) => {
  if (!Array.isArray(arr)) return arr;
  return arr.map(item => toSnakeCase(item));
};

module.exports = {
  toSnakeCase,
  toCamelCase,
  toCamelCaseArray,
  toSnakeCaseArray
};