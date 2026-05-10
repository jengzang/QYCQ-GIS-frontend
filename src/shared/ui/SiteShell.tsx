import { NavLink } from 'react-router-dom';

import type { PropsWithChildren } from 'react';

import { useOrientationMode } from '@/shared/lib/orientation';
import { navMapping } from '@/shared/mappings/nav-mapping';

export function SiteShell({ children }: PropsWithChildren) {
  const orientation = useOrientationMode();
  const isPortrait = orientation === 'portrait';

  return (
    <div className={['relative min-h-screen overflow-hidden text-[color:var(--color-text-primary)]', isPortrait ? 'px-4 py-4' : 'px-6 py-5'].join(' ')}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-6rem] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(112,170,255,0.26),transparent_68%)] blur-2xl" />
        <div className="absolute right-[-7rem] top-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,232,214,0.9),transparent_66%)] blur-2xl" />
        <div className="absolute bottom-[-9rem] left-1/3 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(203,223,255,0.3),transparent_70%)] blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl flex-col gap-5">
        <header className="overflow-hidden rounded-[2.25rem] border border-[color:var(--color-border-subtle)] bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(245,249,255,0.78))] shadow-[var(--shadow-stage)] backdrop-blur-xl">
          <div className={['gap-6', isPortrait ? 'flex flex-col p-5' : 'grid items-end p-6 [grid-template-columns:minmax(0,1fr)_minmax(26rem,30rem)]'].join(' ')}>
            <div className="max-w-3xl space-y-4">
              <div className="space-y-3">
                <h1 className={['max-w-3xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)]', isPortrait ? 'text-[2rem] leading-[1.15]' : 'text-[3.2rem] leading-[1.02]'].join(' ')}>
                  《全粤村情》演示前台
                </h1>
                <p className={['max-w-2xl leading-7 text-[color:var(--color-text-secondary)]', isPortrait ? 'text-sm' : 'text-base'].join(' ')}>
                  以地图主舞台串联村落检索、文化专题与地名叙事，用更接近 Apple × Google 的产品语言承载当前 demo 能力，并为后续真实数据替换保留稳定结构。
                </p>
              </div>
            </div>

            <div className={['grid gap-2.5', isPortrait ? 'grid-cols-2' : 'grid-cols-2'].join(' ')} role="navigation" aria-label="主导航">
              {navMapping.map((item) => (
                <NavLink
                  key={item.path}
                  className={({ isActive }) =>
                    [
                      'group rounded-[1.6rem] border px-4 py-3 text-left transition duration-200',
                      'border-[color:var(--color-border-subtle)] bg-white/72 shadow-[var(--shadow-soft)] backdrop-blur hover:-translate-y-0.5 hover:bg-white',
                      isActive ? 'border-[color:var(--color-border-strong)] bg-[linear-gradient(135deg,#ffffff,#eef5ff)] shadow-[0_20px_40px_rgba(59,130,246,0.16)]' : '',
                    ].join(' ')
                  }
                  to={item.path}
                >
                  <span className="block text-sm font-semibold tracking-[-0.02em]">{item.label}</span>
                  <span className="mt-1.5 block text-xs leading-5 text-[color:var(--color-text-secondary)]">{item.hint}</span>
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
