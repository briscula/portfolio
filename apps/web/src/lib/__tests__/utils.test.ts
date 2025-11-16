import { cn } from '../utils';

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('should ignore falsy values', () => {
    expect(cn('a', false, 'b', null, 'c', undefined)).toBe('a b c');
  });

  it('should trim whitespace', () => {
    expect(cn(' a ', ' b ')).toBe('a b');
  });

  it('should handle a mix of strings and falsy values', () => {
    const isActive = false;
    const hasError = true;
    expect(cn('base', isActive && 'active', hasError && 'error')).toBe('base error');
  });
});
