/**
 * Gets the current environment.
 * @returns The current environment, defaulting to 'production' if not set.
 */
export function getEnvironment(): string {
  return process.env.NODE_ENV ?? 'production';
}

/**
 * Checks if the current environment is development.
 * @returns {boolean} Returns true if the current environment is development, otherwise false.
 */
export function isDevelopment(): boolean {
  return getEnvironment() === 'development';
}

/**
 * Checks if the current environment is production.
 * @returns {boolean} Returns true if the environment is production, false otherwise.
 */
export function isProduction(): boolean {
  return getEnvironment() === 'production';
}
