import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';
import { http } from 'wagmi';

export const config = getDefaultConfig({
  appName: 'Move To Learn',
  projectId: 'YOUR_PROJECT_ID', // 需要从 WalletConnect Cloud 获取
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
}); 