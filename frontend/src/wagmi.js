import { getDefaultConfig, getDefaultWallets, lightTheme } from "@rainbow-me/rainbowkit";
import { ledgerWallet, metaMaskWallet, rabbyWallet } from "@rainbow-me/rainbowkit/wallets";
import { QueryClient } from "@tanstack/react-query";

export const mainChain = {
    id: 1337,
    name: "Ganache",
    nativeCurrency: { name: "Ganache", symbol: "ETH", decimals: 18 },
    rpcUrls: {
        default: { http: ["HTTP://127.0.0.1:7545"] },
    },
};

// https://cloud.reown.com/app/7d9c001a-e69b-416a-953d-1621bc67bfdc/project/fbbf8852-10a7-4448-8bca-29fb07761799
const projectId = 'f30ad10465133843433cc9753f4ef6e1';

export const createWagmiConfig = () => {
    const chain = mainChain;
    const { wallets } = getDefaultWallets();

    return getDefaultConfig({
        appName: "RainbowKit demo",
        projectId: projectId,
        chains: [chain],
        wallets: [
            ...wallets,
            {
                groupName: "Recommended",
                wallets: [
                    metaMaskWallet,
                    ledgerWallet,
                    rabbyWallet
                ],
            },
        ],
    });
};

export const customTheme = lightTheme({
    accentColor: '#282a36',
    accentColorForeground: '#2b7fff',
    overlayBlur: 'small',
    borderRadius: 'large',
});

export const createQueryClient = () => new QueryClient();