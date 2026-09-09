import { describe, expect, it } from 'vitest';
import { toSlug } from '@/lib/slug';

describe('toSlug', () => {
  it('kebab-cases a display name', () => {
    expect(toSlug('St Vinnies — Kingston')).toBe('st-vinnies-kingston');
  });

  it('folds ampersands and accents', () => {
    expect(toSlug('Røde & Co')).toBe('rode-and-co');
  });

  it('handles numbers and empties safely', () => {
    expect(toSlug('123 Test 4')).toBe('123-test-4');
    expect(toSlug('')).toBe('');
  });
});
