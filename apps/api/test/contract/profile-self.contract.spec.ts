import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('profile self contract', () => {
  const contractPath = path.resolve(
    __dirname,
    '../../../../specs/004-user-profile/contracts/openapi.yaml',
  );
  const contractText = fs.readFileSync(contractPath, 'utf8');

  it('documents authenticated owner read and update operations on /profiles/me', () => {
    expect(contractText).toContain('/profiles/me:');
    expect(contractText).toContain(
      "summary: Read the current authenticated user's editable profile",
    );
    expect(contractText).toContain(
      "summary: Update the current authenticated user's profile fields",
    );
    expect(contractText).toContain('displayName:');
    expect(contractText).toContain('bio:');
  });

  it('keeps validation failures explicit for invalid owner profile updates', () => {
    expect(contractText).toContain("'400':");
    expect(contractText).toContain('VALIDATION_ERROR');
    expect(contractText).toContain('EnvelopeOk:');
  });
});
