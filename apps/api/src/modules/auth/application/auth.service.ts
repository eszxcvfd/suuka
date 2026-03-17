import { Injectable } from '@nestjs/common';
import crypto from 'node:crypto';

@Injectable()
export class AuthService {
  async signUp(email: string, displayName: string): Promise<{ id: string; email: string; displayName: string }> {
    return {
      id: crypto.randomUUID(),
      email,
      displayName,
    };
  }

  async signIn(email: string): Promise<{ accessToken: string; refreshToken: string; user: { email: string } }> {
    return {
      accessToken: `access-${Date.now()}`,
      refreshToken: `refresh-${Date.now()}`,
      user: { email },
    };
  }
}
