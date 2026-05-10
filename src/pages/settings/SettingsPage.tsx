import { useAppPreferences, type ThemeMode } from '@/app/providers/AppPreferencesProvider';
import { runtimeConfig } from '@/shared/config/runtime';
import { getAvailableMapStyleOptions } from '@/shared/lib/map-style';
import { PageHero } from '@/shared/ui/PageHero';
import { SiteShell } from '@/shared/ui/SiteShell';
import { SurfaceCard } from '@/shared/ui/SurfaceCard';

const themeOptions: Array<{ description: string; key: ThemeMode; label: string }> = [
  {
    description: '保留当前浅色门户风格，适合白天展示与汇报。',
    key: 'light',
    label: '日间模式',
  },
  {
    description: '切换为深色界面，适合夜间浏览与大屏展示。',
    key: 'dark',
    label: '夜间模式',
  },
];

function SettingsSelect({
  description,
  label,
  onChange,
  options,
  value,
}: {
  description: string;
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <label className="grid gap-3 rounded-[1.45rem] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-surface)] p-5 shadow-[var(--shadow-card)]">
      <div className="space-y-1.5">
        <span className="block text-sm font-semibold text-[color:var(--color-text-primary)]">{label}</span>
        <span className="block text-sm leading-6 text-[color:var(--color-text-secondary)]">{description}</span>
      </div>
      <div className="relative">
        <select
          aria-label={label}
          className="w-full appearance-none rounded-2xl border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-surface-strong)] px-4 py-3 pr-11 text-sm font-medium text-[color:var(--color-text-primary)] shadow-[var(--shadow-soft)] outline-none transition focus:border-[color:var(--color-primary-strong)] focus:ring-2 focus:ring-[color:var(--color-primary-soft)]"
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[color:var(--color-text-tertiary)]">
          ▾
        </span>
      </div>
    </label>
  );
}

export function SettingsPage() {
  const { mapStyleKey, setMapStyleKey, setThemeMode, themeMode } = useAppPreferences();
  const mapStyleOptions = getAvailableMapStyleOptions(runtimeConfig.mapStyleUrl);

  return (
    <SiteShell>
      <div className="grid gap-4">
        <PageHero
          description="统一管理整个站点的地图底图和界面明暗主题。地图页、首页地图总览等所有地图都会读取这里的同一份设置。"
          eyebrow="Global preferences"
          metrics={[
            {
              hint: '当前全站共享的底图来源。',
              label: '当前底图',
              value: mapStyleOptions.find((option) => option.key === mapStyleKey)?.label ?? '未设置',
            },
            {
              hint: '当前界面主题。',
              label: '当前主题',
              value: themeMode === 'dark' ? '夜间' : '日间',
            },
          ]}
          title="设置"
        />

        <SurfaceCard title="地图底图" description="只允许在设置页统一切换；改动后首页与地图页会一起生效。" eyebrow="Map style">
          <SettingsSelect
            description="整个站点的地图底图只认这一处设置，避免首页、地图页出现不同入口和不同状态。"
            label="底图方案"
            onChange={(value) => setMapStyleKey(value as Parameters<typeof setMapStyleKey>[0])}
            options={mapStyleOptions.map((option) => ({ label: option.label, value: option.key }))}
            value={mapStyleKey}
          />
        </SurfaceCard>

        <SurfaceCard title="界面主题" description="只支持日间 / 夜间两种模式，切换后整个页面壳子立即更新。" eyebrow="Theme mode">
          <SettingsSelect
            description="用于切换站点整体明暗风格，不改变地图业务数据，只改变界面外观。"
            label="主题模式"
            onChange={(value) => setThemeMode(value as ThemeMode)}
            options={themeOptions.map((option) => ({ label: option.label, value: option.key }))}
            value={themeMode}
          />
        </SurfaceCard>
      </div>
    </SiteShell>
  );
}
