import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('mobile auth recovery integration baseline', () => {
  const screens = [
    path.resolve(__dirname, '../../src/screens/ForgotPasswordScreen.tsx'),
    path.resolve(__dirname, '../../src/screens/ResetPasswordScreen.tsx'),
    path.resolve(__dirname, '../../src/screens/VerifyEmailScreen.tsx'),
  ];

  it('contains verify and reset screens', () => {
    for (const screen of screens) {
      expect(fs.existsSync(screen), `${path.basename(screen)} should exist`).toBe(true);
    }
  });
});
