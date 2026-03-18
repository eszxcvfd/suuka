const DEFAULT_API_BASE_URL = 'http://localhost:3000/v1';

export function normalizeApiBaseUrl(
  configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL,
): string {
  const normalizedBaseUrl = configuredBaseUrl?.trim();

  if (!normalizedBaseUrl) {
    return DEFAULT_API_BASE_URL;
  }

  return normalizedBaseUrl.replace(/\/+$/, '');
}
