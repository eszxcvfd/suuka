import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import crypto from 'node:crypto';
import { loadAuthConfig } from '../../../config/auth.config';

interface AccessPayload {
  email: string;
  sub: string;
}

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async signAccessToken(payload: AccessPayload): Promise<string> {
    const config = loadAuthConfig();
    return this.jwtService.signAsync(payload, {
      expiresIn: config.accessTokenExpiresIn as any,
      secret: config.accessTokenSecret,
    });
  }

  async verifyAccessToken(token: string): Promise<AccessPayload> {
    const config = loadAuthConfig();
    return this.jwtService.verifyAsync<AccessPayload>(token, {
      secret: config.accessTokenSecret,
    });
  }

  generateOpaqueRefreshToken(): string {
    return crypto.randomBytes(48).toString('hex');
  }

  hashOpaqueToken(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
  }
}
