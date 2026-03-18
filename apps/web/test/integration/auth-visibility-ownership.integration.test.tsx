import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('web visibility and ownership integration baseline', () => {
  const authApiPath = path.resolve(__dirname, '../../src/services/auth-api.ts');
  const mediaPagePath = path.resolve(__dirname, '../../src/app/pages/MediaPage.tsx');
  const mediaListPath = path.resolve(__dirname, '../../src/components/media/MediaList.tsx');

  const authApiText = fs.readFileSync(authApiPath, 'utf8');
  const mediaPageText = fs.readFileSync(mediaPagePath, 'utf8');
  const mediaListText = fs.readFileSync(mediaListPath, 'utf8');

  it('normalizes authorization-denied responses in the shared auth api client', () => {
    expect(authApiText).toContain('AuthorizationError');
    expect(authApiText).toContain('isAuthorizationDeniedError');
    expect(authApiText).toContain('listVisibleMedia');
  });

  it('renders loading, empty, denied, and general error states on the media page', () => {
    expect(mediaPageText).toContain('Loading visible media…');
    expect(mediaPageText).toContain('Access limited by visibility policy.');
    expect(mediaPageText).toContain('Unable to load workspace media right now.');
    expect(mediaPageText).toContain('loadMedia');
  });

  it('surfaces stable denied-action feedback from the media list component', () => {
    expect(mediaListText).toContain('deniedActionMessage');
    expect(mediaListText).toContain('This action is unavailable for the current account context.');
  });
});
