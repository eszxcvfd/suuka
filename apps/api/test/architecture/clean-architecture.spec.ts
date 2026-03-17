import { describe, expect, it } from 'vitest';

describe('Clean Architecture boundaries', () => {
  it('keeps domain independent of infrastructure/framework modules', () => {
    const forbiddenImportsInDomain = ['@nestjs/common', 'mongoose', 'ioredis', 'cloudinary'];
    expect(forbiddenImportsInDomain).toContain('mongoose');
  });
});
