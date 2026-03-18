import { describe, it } from 'vitest';
import { expect } from 'vitest';
import { AuthService } from '../../src/services/auth.service';
import { ApiClient } from '../../src/services/api-client';

describe('mobile auth lifecycle integration baseline', () => {
  it('exposes sign-in, sign-up, and sign-out actions in auth service', () => {
    const authService = new AuthService(new ApiClient('http://localhost:3000/v1'));
    expect(typeof authService.signIn).toBe('function');
    expect(typeof authService.signUp).toBe('function');
    expect(typeof authService.signOut).toBe('function');
  });
});
