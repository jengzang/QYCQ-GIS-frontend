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
        <div className="absolute inset-x-0 top-0 h-56 bg-[image:var(--color-shell-top-glow)]" />
        <div className="absolute left-[-7rem] top-[-5rem] h-52 w-52 rounded-full bg-[image:var(--color-shell-orb-left)] blur-3xl" />
        <div className="absolute right-[-6rem] top-6 h-56 w-56 rounded-full bg-[image:var(--color-shell-orb-right)] blur-3xl" />
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

            <div className={[
              'rounded-[1.35rem] border border-[color:var(--color-border-subtle)] bg-[image:var(--color-nav-shell)] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_12px_26px_rgba(70,81,91,0.08)]',
              isPortrait ? 'w-full' : '',
            ].join(' ')}>
              <nav aria-label="主导航" className={['flex gap-2', isPortrait ? 'flex-wrap' : 'items-center justify-end'].join(' ')}>
                {navMapping.map((item) => (
                  <NavLink
                    key={item.path}
                    className={({ isActive }) =>
                      [
                        'rounded-[1.05rem] border px-4 py-2.5 text-sm font-medium transition duration-200',
                        isActive
                          ? 'border-[color:var(--color-map-mode-active-border)] bg-[linear-gradient(180deg,var(--color-map-mode-active-bg),var(--color-map-mode-active-bg-strong))] text-[color:var(--color-map-mode-active-text)] shadow-[0_12px_28px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.18)]'
                          : 'border-transparent text-[color:var(--color-text-secondary)] hover:-translate-y-[1px] hover:border-[color:var(--color-nav-hover-border)] hover:bg-[color:var(--color-nav-hover-bg)] hover:text-[color:var(--color-nav-hover-text)] hover:shadow-[0_10px_22px_rgba(86,88,79,0.08)]',
                      ].join(' ')
                    }
                    to={item.path}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
