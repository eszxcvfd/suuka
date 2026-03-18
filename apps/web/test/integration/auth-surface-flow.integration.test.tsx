import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('web auth surface flow follow-up', () => {
  const authStorePath = path.resolve(__dirname, '../../src/store/auth.store.ts');
  const mainPath = path.resolve(__dirname, '../../src/main.tsx');
  const signInFormPath = path.resolve(__dirname, '../../src/components/auth/SignInForm.tsx');
  const mediaUploaderPath = path.resolve(__dirname, '../../src/components/media/MediaUploader.tsx');
  const sessionListPath = path.resolve(__dirname, '../../src/components/auth/SessionList.tsx');

  const authStoreText = fs.readFileSync(authStorePath, 'utf8');
  const mainText = fs.readFileSync(mainPath, 'utf8');
  const signInFormText = fs.readFileSync(signInFormPath, 'utf8');
  const mediaUploaderText = fs.readFileSync(mediaUploaderPath, 'utf8');
  const sessionListText = fs.readFileSync(sessionListPath, 'utf8');

  it('wires all auth and dashboard surfaces into the current app flow', () => {
    expect(authStoreText).toContain("'forgotPassword'");
    expect(authStoreText).toContain("'resetPassword'");
    expect(authStoreText).toContain("'verifyEmail'");
    expect(authStoreText).toContain("'media'");
    expect(authStoreText).toContain("'sessions'");
    expect(mainText).toContain('ForgotPasswordPage');
    expect(mainText).toContain('ResetPasswordPage');
    expect(mainText).toContain('VerifyEmailPage');
    expect(mainText).toContain('SessionsPage');
  });

  it('adds pending state hooks to async auth and workspace actions', () => {
    expect(signInFormText).toContain('const [isSubmitting, setIsSubmitting] = useState(false);');
    expect(mediaUploaderText).toContain('const [isUploading, setIsUploading] = useState(false);');
    expect(sessionListText).toContain(
      'const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);',
    );
  });
});
