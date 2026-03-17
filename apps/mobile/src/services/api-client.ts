const DEFAULT_API_BASE_URL = 'http://localhost:3000/v1';

export class ApiClient {
  constructor(private readonly baseUrl = DEFAULT_API_BASE_URL) {}

  async post<TResponse>(path: string, body: unknown): Promise<TResponse> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as TResponse;
  }

  async get<TResponse>(path: string): Promise<TResponse> {
    const response = await fetch(`${this.baseUrl}${path}`);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as TResponse;
  }
}
