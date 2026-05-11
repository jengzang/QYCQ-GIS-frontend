import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test } from 'vitest';

import { AppPreferencesProvider } from '@/app/providers/AppPreferencesProvider';
import { SettingsPage } from '@/pages/settings/SettingsPage';

const villagePointSizeModeStorageKey = 'qycq-village-point-size-mode';

function renderSettingsPage() {
  return render(
    <MemoryRouter initialEntries={['/settings']}>
      <AppPreferencesProvider>
        <SettingsPage />
      </AppPreferencesProvider>
    </MemoryRouter>,
  );
}

describe('SettingsPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('renders village point size mode options from global preferences', () => {
    renderSettingsPage();

    const select = screen.getByRole('combobox', { name: '村庄点大小' });
    expect(select).toHaveValue('fixed');
    expect(screen.getByRole('option', { name: '固定大小' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '按人口数量' })).toBeInTheDocument();
  });

  test('persists village point size mode changes to localStorage', () => {
    renderSettingsPage();

    fireEvent.change(screen.getByRole('combobox', { name: '村庄点大小' }), {
      target: { value: 'population' },
    });

    expect(window.localStorage.getItem(villagePointSizeModeStorageKey)).toBe('population');
  });
});
