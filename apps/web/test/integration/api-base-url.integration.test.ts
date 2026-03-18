import { describe, expect, it } from 'vitest';
import { normalizeApiBaseUrl } from '../../src/services/api-base-url';

describe('web API base URL configuration', () => {
  it('falls back to the relative API path when env is missing', () => {
    expect(normalizeApiBaseUrl(undefined, false)).toBe('/v1');
  });

  it('removes a trailing slash from configured env values', () => {
    expect(normalizeApiBaseUrl('https://suuka-api.onrender.com/v1/', true)).toBe(
      'https://suuka-api.onrender.com/v1',
    );
  });

  it('throws in production when env is missing', () => {
    expect(() => normalizeApiBaseUrl('', true)).toThrow(
      'Missing VITE_API_BASE_URL for production web builds',
    );
  });
});
