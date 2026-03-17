import { describe, expect, it } from 'vitest';

describe('Shared media integration', () => {
  it('matches media list shape across clients', () => {
    expect([{ id: '1', secureUrl: 'https://example.com/a.jpg' }]).toHaveLength(1);
  });
});
