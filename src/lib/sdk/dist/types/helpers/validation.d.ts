/**
 * @fileoverview Input validation utilities for the Mixcore SDK
 *
 * This module provides comprehensive validation functions for SDK inputs including
 * parameter validation, database name validation, and data integrity checks.
 * These validations help prevent common errors and ensure data quality.
 *
 * @author Mixcore Team
 * @version 0.0.1-dev.21+
 */
/**
 * Validates that a value is not null, undefined, or empty string
 *
 * This function checks for the presence of required parameters and throws
 * a descriptive error if the value is missing. It's used throughout the SDK
 * to ensure all required parameters are provided before making API calls.
 *
 * @param value - The value to validate
 * @param paramName - Name of the parameter for error messages
 * @throws {ValidationError} When value is null, undefined, or empty string
 *
 * @example
 * ```typescript
 * // Valid usage
 * validateRequired('users', 'databaseName'); // passes
 * validateRequired(123, 'userId'); // passes
 * validateRequired(false, 'isActive'); // passes (boolean false is valid)
 *
 * // Invalid usage (throws ValidationError)
 * validateRequired(null, 'email'); // throws: "email is required"
 * validateRequired(undefined, 'password'); // throws: "password is required"
 * validateRequired('', 'username'); // throws: "username cannot be empty"
 * validateRequired('   ', 'token'); // throws: "token cannot be empty" (trimmed)
 * ```
 */
export declare function validateRequired(value: any, paramName: string): void;
/**
 * Validates database system names according to Mixcore naming conventions
 *
 * Database system names must follow specific rules to ensure compatibility
 * with the Mixcore API and prevent security issues. This function validates
 * the name format and characters used.
 *
 * Validation Rules:
 * - Must not be empty or only whitespace
 * - Must be between 1 and 100 characters
 * - Can contain letters, numbers, underscores, and hyphens
 * - Cannot start or end with special characters
 * - Cannot contain consecutive special characters
 *
 * @param name - The database system name to validate
 * @throws {ValidationError} When name doesn't meet requirements
 *
 * @example
 * ```typescript
 * // Valid database names
 * validateDatabaseSystemName('users'); // passes
 * validateDatabaseSystemName('user_profiles'); // passes
 * validateDatabaseSystemName('product-categories'); // passes
 * validateDatabaseSystemName('mix_database_2024'); // passes
 *
 * // Invalid database names (throws ValidationError)
 * validateDatabaseSystemName(''); // empty
 * validateDatabaseSystemName('user@profiles'); // invalid character @
 * validateDatabaseSystemName('_users'); // starts with underscore
 * validateDatabaseSystemName('users-'); // ends with hyphen
 * validateDatabaseSystemName('user__profiles'); // consecutive underscores
 * validateDatabaseSystemName('a'.repeat(101)); // too long
 * ```
 */
export declare function validateDatabaseSystemName(name: string): void;
/**
 * Validates that a string meets minimum length requirements
 *
 * This function ensures that string parameters (like passwords, tokens, etc.)
 * meet minimum length requirements for security and functionality purposes.
 *
 * @param value - The string value to validate
 * @param minLength - Minimum required length
 * @param paramName - Name of the parameter for error messages
 * @throws {ValidationError} When string is too short
 *
 * @example
 * ```typescript
 * // Valid usage
 * validateMinLength('password123', 8, 'password'); // passes
 * validateMinLength('valid_token_string', 10, 'accessToken'); // passes
 *
 * // Invalid usage (throws ValidationError)
 * validateMinLength('short', 8, 'password'); // throws: "password must be at least 8 characters long"
 * validateMinLength('', 1, 'username'); // throws: "username must be at least 1 characters long"
 *
 * // Special cases
 * validateMinLength('   padded   ', 5, 'data'); // passes (doesn't trim by default)
 * ```
 */
export declare function validateMinLength(value: string, minLength: number, paramName: string): void;
/**
 * Validates that a value is a non-null object
 *
 * This function ensures that data parameters are valid objects that can be
 * processed by the API. It checks for proper object type and rejects primitives,
 * arrays, functions, and other non-object types.
 *
 * @param obj - The value to validate as an object
 * @param paramName - Name of the parameter for error messages
 * @throws {ValidationError} When value is not a valid object
 *
 * @example
 * ```typescript
 * // Valid usage
 * validateObject({ name: 'John', age: 30 }, 'userData'); // passes
 * validateObject({ id: 1 }, 'updateData'); // passes
 * validateObject({}, 'emptyObject'); // passes (empty object is valid)
 *
 * // Invalid usage (throws ValidationError)
 * validateObject(null, 'data'); // throws: "data must be a valid object"
 * validateObject(undefined, 'userData'); // throws: "userData is required"
 * validateObject('string', 'data'); // throws: "data must be a valid object"
 * validateObject([1, 2, 3], 'data'); // throws: "data must be a valid object"
 * validateObject(123, 'data'); // throws: "data must be a valid object"
 * validateObject(function() {}, 'data'); // throws: "data must be a valid object"
 * ```
 */
export declare function validateObject(obj: any, paramName: string): void;
