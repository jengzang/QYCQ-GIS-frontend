import { resolveOrientationMode } from '@/shared/lib/orientation';

describe('orientation resolver', () => {
  test('prefers the media query result when present', () => {
    expect(resolveOrientationMode({ height: 900, mediaMatches: true, width: 1200 })).toBe(
      'portrait',
    );
  });

  test('falls back to comparing height and width', () => {
    expect(resolveOrientationMode({ height: 1280, width: 800 })).toBe('portrait');
    expect(resolveOrientationMode({ height: 800, width: 1280 })).toBe('landscape');
  });
});

