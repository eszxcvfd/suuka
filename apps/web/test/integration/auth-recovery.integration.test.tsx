import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('web auth recovery integration baseline', () => {
  const pages = [
    path.resolve(__dirname, '../../src/app/pages/VerifyEmailPage.tsx'),
    path.resolve(__dirname, '../../src/app/pages/ForgotPasswordPage.tsx'),
    path.resolve(__dirname, '../../src/app/pages/ResetPasswordPage.tsx'),
  ];

  it('contains verify and reset pages', () => {
    for (const page of pages) {
      expect(fs.existsSync(page), `${path.basename(page)} should exist`).toBe(true);
    }
  });
});
