import { Navigate, Route, Routes } from 'react-router-dom';

import { FolkwaysPage } from '@/pages/folkways/FolkwaysPage';
import { MapPage } from '@/pages/map/MapPage';
import { OverviewPage } from '@/pages/overview/OverviewPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { ToponymyPage } from '@/pages/toponymy/ToponymyPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/overview" />} />
      <Route path="/overview" element={<OverviewPage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/folkways" element={<FolkwaysPage />} />
      <Route path="/toponymy" element={<ToponymyPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}
