import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

import type { PropsWithChildren } from 'react';

import { AppPreferencesProvider } from '@/app/providers/AppPreferencesProvider';

const queryClient = new QueryClient();

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppPreferencesProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </AppPreferencesProvider>
    </QueryClientProvider>
  );
}
