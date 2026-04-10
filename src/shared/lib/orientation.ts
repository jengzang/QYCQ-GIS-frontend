import { useEffect, useState } from 'react';

export type OrientationMode = 'portrait' | 'landscape';

export interface OrientationInput {
  height: number;
  mediaMatches?: boolean;
  width: number;
}

export function resolveOrientationMode(input: OrientationInput): OrientationMode {
  if (typeof input.mediaMatches === 'boolean') {
    return input.mediaMatches ? 'portrait' : 'landscape';
  }

  return input.height >= input.width ? 'portrait' : 'landscape';
}

function readOrientationMode(): OrientationMode {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'landscape';
  }

  const mediaQuery = window.matchMedia('(orientation: portrait)');

  return resolveOrientationMode({
    height: window.innerHeight,
    mediaMatches: mediaQuery.matches,
    width: window.innerWidth,
  });
}

export function useOrientationMode(): OrientationMode {
  const [mode, setMode] = useState<OrientationMode>(() => readOrientationMode());

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(orientation: portrait)');
    const updateMode = () => {
      setMode(
        resolveOrientationMode({
          height: window.innerHeight,
          mediaMatches: mediaQuery.matches,
          width: window.innerWidth,
        }),
      );
    };

    updateMode();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateMode);

      return () => mediaQuery.removeEventListener('change', updateMode);
    }

    if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(updateMode);

      return () => mediaQuery.removeListener(updateMode);
    }

    return undefined;
  }, []);

  return mode;
}
