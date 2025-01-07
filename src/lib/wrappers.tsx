import { NextUIProvider } from '@nextui-org/system';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { BrowserRouter } from 'react-router-dom';
import { createConfig, http } from 'wagmi';
import { arbitrum, sepolia } from 'wagmi/chains';

const wagmiConfig = createConfig({
    chains: [arbitrum, sepolia],
    transports: {
        [arbitrum.id]: http(),
        [sepolia.id]: http(),
    },
});

const rainbowConfig = getDefaultConfig({
    appName: 'Ratio1',
    projectId: 'YOUR_PROJECT_ID',
    chains: [arbitrum, sepolia],
    ssr: false,
});

export function Wrappers({ children }: { children: React.ReactNode }) {
    return (
        <BrowserRouter>
            <NextUIProvider>{children}</NextUIProvider>
        </BrowserRouter>
    );
}
