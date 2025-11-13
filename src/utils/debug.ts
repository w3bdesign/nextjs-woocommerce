/**
 * Debug Utility
 *
 * Environment-aware logging that only outputs in development mode.
 * Prevents console noise in production builds.
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Log message (only in development)
 * @param args - Arguments to log (same as console.log)
 */
const log = (...args: any[]): void => {
  if (isDevelopment) {
    console.log(...args);
  }
};

/**
 * Log warning (only in development)
 * @param args - Arguments to warn (same as console.warn)
 */
const warn = (...args: any[]): void => {
  if (isDevelopment) {
    console.warn(...args);
  }
};

/**
 * Log error (always logged, even in production)
 * @param args - Arguments to error (same as console.error)
 */
const error = (...args: any[]): void => {
  console.error(...args);
};

/**
 * Log with a specific category/prefix (only in development)
 * @param category - Category prefix (e.g., '3D', 'Camera', 'Store')
 * @param args - Arguments to log
 */
const logCategory = (category: string, ...args: any[]): void => {
  if (isDevelopment) {
    console.log(`[${category}]`, ...args);
  }
};

/**
 * Log performance timing (only in development)
 * @param label - Label for the timing measurement
 * @param callback - Function to measure
 */
const time = <T>(label: string, callback: () => T): T => {
  if (isDevelopment) {
    console.time(label);
    const result = callback();
    console.timeEnd(label);
    return result;
  }
  return callback();
};

/**
 * Debug utility object
 * Use instead of console.log to ensure development-only logging
 */
export const debug = {
  log,
  warn,
  error,
  category: logCategory,
  time,
} as const;

export default debug;
