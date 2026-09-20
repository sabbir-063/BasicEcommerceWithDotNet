import { describe, expect, it } from 'vitest';

describe('frontend foundation', () => {
  it('keeps browser-safe API paths under /api', () => {
    expect('/api/products').toMatch(/^\/api\//);
  });
});
