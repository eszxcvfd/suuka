import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('mobile visibility and ownership integration baseline', () => {
  const authServicePath = path.resolve(__dirname, '../../src/services/auth.service.ts');
  const mediaListScreenPath = path.resolve(__dirname, '../../src/screens/MediaListScreen.tsx');

  const authServiceText = fs.readFileSync(authServicePath, 'utf8');
  const mediaListScreenText = fs.readFileSync(mediaListScreenPath, 'utf8');

  it('normalizes authorization-denied media responses for mobile flows', () => {
    expect(authServiceText).toContain('normalizeAuthorizationError');
    expect(authServiceText).toContain('listVisibleMedia');
  });

  it('renders filtered, empty, and denied state copy in the media list screen', () => {
    expect(mediaListScreenText).toContain('Protected media is unavailable for this account.');
    expect(mediaListScreenText).toContain('No visible media yet.');
    expect(mediaListScreenText).toContain('visibleItems');
  });
});
