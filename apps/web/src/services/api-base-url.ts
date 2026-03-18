const DEFAULT_API_BASE_URL = '/v1';

export function normalizeApiBaseUrl(configuredBaseUrl = import.meta.env.VITE_API_BASE_URL): string {
  const normalizedBaseUrl = configuredBaseUrl?.trim();

  if (!normalizedBaseUrl) {
    return DEFAULT_API_BASE_URL;
  }

  return normalizedBaseUrl.replace(/\/+$/, '');
}
