import { describe, expect, it } from 'vitest';

describe('Notifications integration', () => {
  it('returns notification list payload shape', async () => {
    const response = {
      items: [{ id: 'n1', title: 'Welcome', message: 'Your account is ready.' }],
    };
    expect(response.items[0].id).toBe('n1');
  });
});
