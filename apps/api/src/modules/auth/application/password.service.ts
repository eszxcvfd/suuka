import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { loadAuthConfig } from '../../../config/auth.config';

@Injectable()
export class PasswordService {
  async hash(plainText: string): Promise<string> {
    const config = loadAuthConfig();
    return bcrypt.hash(plainText, config.bcryptRounds);
  }

  async matches(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}
