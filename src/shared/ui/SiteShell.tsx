import { NavLink } from 'react-router-dom';

import type { PropsWithChildren } from 'react';

import { useOrientationMode } from '@/shared/lib/orientation';
import { navMapping } from '@/shared/mappings/nav-mapping';

export function SiteShell({ children }: PropsWithChildren) {
  const orientation = useOrientationMode();
  const isPortrait = orientation === 'portrait';

  return (
    <div className={['relative min-h-screen bg-[color:var(--color-bg-page)] text-[color:var(--color-text-primary)]', isPortrait ? 'px-4 py-4' : 'px-6 py-5'].join(' ')}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-56 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),transparent)]" />
        <div className="absolute left-[-7rem] top-[-5rem] h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(174,196,224,0.22),transparent_68%)] blur-3xl" />
        <div className="absolute right-[-6rem] top-6 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(225,213,194,0.26),transparent_70%)] blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl flex-col gap-5">
        <header className="sticky top-4 z-50 rounded-[1.8rem] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-surface-strong)] shadow-[var(--shadow-soft)] backdrop-blur-md">
          <div
            className={[
              'gap-5',
              isPortrait ? 'flex flex-col p-5' : 'flex items-center justify-between px-6 py-5',
            ].join(' ')}
          >
            <div className="min-w-0 space-y-1">
              <div>
                <h1 className="text-[1.35rem] font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)]">全粤村情数据展示</h1>
              </div>
            </div>

            <nav aria-label="主导航" className={['flex gap-2', isPortrait ? 'flex-wrap' : 'items-center justify-end'].join(' ')}>
              {navMapping.map((item) => (
                <NavLink
                  key={item.path}
                  className={({ isActive }) =>
                    [
                      'rounded-full px-4 py-2 text-sm font-medium transition',
                      isActive
                        ? 'bg-[color:var(--color-bg-soft)] text-[color:var(--color-text-primary)] shadow-[0_10px_24px_rgba(50,69,95,0.08)]'
                        : 'text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-bg-surface)] hover:text-[color:var(--color-text-primary)]',
                    ].join(' ')
                  }
                  to={item.path}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
