const DEFAULT_API_BASE_URL = 'http://localhost:3000/v1';

interface ApiSuccessEnvelope<TData> {
  success: true;
  data: TData;
}

interface ApiErrorEnvelope {
  success: false;
  error?: {
    message?: string;
    status?: number;
  };
}

export class ApiClient {
  private accessToken: string | null = null;

  constructor(private readonly baseUrl = DEFAULT_API_BASE_URL) {}

  setAccessToken(token: string | null): void {
    this.accessToken = token;
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

  async delete<TResponse>(path: string): Promise<TResponse> {
    return this.request<TResponse>(path, {
      method: 'DELETE',
    });
  }

  private async request<TResponse>(path: string, init: RequestInit): Promise<TResponse> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
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
