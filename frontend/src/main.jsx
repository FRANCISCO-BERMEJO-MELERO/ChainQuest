import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';

import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import '@rainbow-me/rainbowkit/styles.css';

import { NetworkGuard } from './NetworkGuard';
import {
  createQueryClient,
  createWagmiConfig,
  customTheme,
  mainChain
} from './wagmi';

const wagmiConfig = createWagmiConfig();
const queryClient = createQueryClient();

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={customTheme} initialChain={mainChain}>
          <NetworkGuard />
          <StrictMode>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<App />} />
              </Routes>
            </BrowserRouter>
          </StrictMode>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
