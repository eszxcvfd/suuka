import { normalizeApiBaseUrl } from './api-base-url';

const DEFAULT_API_BASE_URL = normalizeApiBaseUrl();

interface ApiSuccessEnvelope<TData> {
  success: true;
  data: TData;
}

interface ApiErrorEnvelope {
  success: false;
  error?: {
    code?: 'FORBIDDEN' | 'MISSING_SCOPE' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'USERNAME_TAKEN';
    message?: string;
    status?: number;
  };
}

export class AuthorizationError extends Error {
  constructor(
    message: string,
    readonly code:
      | 'FORBIDDEN'
      | 'MISSING_SCOPE'
      | 'NOT_FOUND'
      | 'VALIDATION_ERROR'
      | 'USERNAME_TAKEN',
    readonly status?: number,
  ) {
    super(message);
  }
}

export class ApiClient {
  private static sharedAccessToken: string | null = null;

  constructor(private readonly baseUrl = DEFAULT_API_BASE_URL) {}

  setAccessToken(token: string | null): void {
    ApiClient.sharedAccessToken = token;
  }

  async post<TResponse>(path: string, body: unknown): Promise<TResponse> {
    return this.request<TResponse>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async get<TResponse>(path: string): Promise<TResponse> {
    return this.request<TResponse>(path, {
      method: 'GET',
    });
  }

  async patch<TResponse>(path: string, body: unknown): Promise<TResponse> {
    return this.request<TResponse>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete<TResponse>(path: string): Promise<TResponse> {
    return this.request<TResponse>(path, {
      method: 'DELETE',
    });
  }

  private async request<TResponse>(path: string, init: RequestInit): Promise<TResponse> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        ...(ApiClient.sharedAccessToken
          ? { Authorization: `Bearer ${ApiClient.sharedAccessToken}` }
          : {}),
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    });

    let payload: ApiSuccessEnvelope<TResponse> | ApiErrorEnvelope | undefined;
    try {
      payload = (await response.json()) as ApiSuccessEnvelope<TResponse> | ApiErrorEnvelope;
    } catch {
      payload = undefined;
    }

    if (!response.ok) {
      if (payload && 'error' in payload && payload.error?.code && payload.error?.message) {
        throw new AuthorizationError(
          payload.error.message,
          payload.error.code,
          payload.error.status,
        );
      }
      if (payload && 'error' in payload && payload.error?.message) {
        throw new Error(payload.error.message);
      }
      throw new Error(`Request failed with status ${response.status}`);
    }

    if (!payload || !('success' in payload) || payload.success !== true) {
      throw new Error('Unexpected API response format');
    }

    return payload.data;
  }
}

export function isAuthorizationDeniedError(error: unknown): error is AuthorizationError {
  return error instanceof AuthorizationError;
}
