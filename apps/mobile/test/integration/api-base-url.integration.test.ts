import { describe, expect, it } from 'vitest';
import { normalizeApiBaseUrl } from '../../src/services/api-base-url';

describe('mobile API base URL configuration', () => {
  it('falls back to the local development API path when env is missing', () => {
    expect(normalizeApiBaseUrl()).toBe('http://localhost:3000/v1');
  });

  it('removes a trailing slash from configured env values', () => {
    expect(normalizeApiBaseUrl('https://suuka-api.onrender.com/v1/')).toBe(
      'https://suuka-api.onrender.com/v1',
    );
  });
});
