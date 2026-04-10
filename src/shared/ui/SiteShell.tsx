import { NavLink } from 'react-router-dom';

import type { PropsWithChildren } from 'react';

import { useOrientationMode } from '@/shared/lib/orientation';
import { navMapping } from '@/shared/mappings/nav-mapping';

export function SiteShell({ children }: PropsWithChildren) {
  const orientation = useOrientationMode();
  const isPortrait = orientation === 'portrait';

  return (
    <div
      className={[
        'min-h-screen text-[color:var(--color-text-primary)]',
        isPortrait ? 'px-4 py-4' : 'px-6 py-5',
      ].join(' ')}
    >
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl flex-col gap-5">
        <header className="overflow-hidden rounded-[2rem] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-surface)] shadow-[0_28px_80px_rgba(34,116,240,0.12)] backdrop-blur">
          <div
            className={[
              'gap-5',
              isPortrait
                ? 'flex flex-col p-5'
                : 'grid items-end p-6 [grid-template-columns:minmax(0,1fr)_minmax(24rem,28rem)]',
            ].join(' ')}
          >
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.38em] text-[color:var(--color-text-secondary)]">
                QYCQ 村庄 GIS Demo
              </p>
              <div className="space-y-2">
                <h1 className={['font-semibold tracking-tight', isPortrait ? 'text-2xl' : 'text-3xl'].join(' ')}>
                  蓝白领导演示版
                </h1>
                <p
                  className={[
                    'max-w-2xl leading-7 text-[color:var(--color-text-secondary)]',
                    isPortrait ? 'text-sm' : 'text-base',
                  ].join(' ')}
                >
                  先用清晰的 shell、稳定的主导航和方向式布局，把项目的叙事骨架搭起来，再逐步替换成真实数据与地图源。
                </p>
              </div>
            </div>

            <div
              className={['grid gap-2', isPortrait ? 'grid-cols-2' : 'grid-cols-4'].join(' ')}
              role="navigation"
              aria-label="主导航"
            >
              {navMapping.map((item) => (
                <NavLink
                  key={item.path}
                  className={({ isActive }) =>
                    [
                      'group rounded-2xl border px-4 py-3 text-left transition duration-200',
                      'border-[color:var(--color-border-subtle)] bg-white/70 hover:-translate-y-0.5 hover:bg-white',
                      isActive
                        ? 'bg-[color:var(--color-primary)] text-white shadow-[0_18px_40px_rgba(34,116,240,0.3)]'
                        : '',
                    ].join(' ')
                  }
                  to={item.path}
                >
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="mt-1 block text-xs leading-5 opacity-75">{item.hint}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
