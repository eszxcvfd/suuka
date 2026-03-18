const DEFAULT_API_BASE_URL = '/v1';

export function normalizeApiBaseUrl(
  configuredBaseUrl = import.meta.env.VITE_API_BASE_URL,
  isProduction = import.meta.env.PROD,
): string {
  const normalizedBaseUrl = configuredBaseUrl?.trim();

  if (!normalizedBaseUrl) {
    if (isProduction) {
      throw new Error('Missing VITE_API_BASE_URL for production web builds');
    }

    return DEFAULT_API_BASE_URL;
  }

  return normalizedBaseUrl.replace(/\/+$/, '');
}
