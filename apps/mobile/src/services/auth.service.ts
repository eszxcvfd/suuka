import { ApiClient } from './api-client';

interface SignInPayload {
  email: string;
  password: string;
}

interface SignInResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    email: string;
  };
}

export class AuthService {
  constructor(private readonly apiClient: ApiClient) {}

  async signIn(payload: SignInPayload): Promise<SignInResponse> {
    return this.apiClient.post<SignInResponse>('/auth/sign-in', payload);
  }
}
