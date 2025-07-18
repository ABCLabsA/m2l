import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';
import { http } from 'wagmi';
import { Network } from "@aptos-labs/ts-sdk";

export const rainbowConfig = getDefaultConfig({
  appName: 'Move To Learn',
  projectId: 'YOUR_PROJECT_ID', // 需要从 WalletConnect Cloud 获取
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

// 环境变量类型检查
const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`缺少必要的环境变量: ${name}`);
  }
  return value;
};

// 网络映射
const networkMap: Record<string, Network> = {
  'mainnet': Network.MAINNET,
  'testnet': Network.TESTNET,
  'devnet': Network.DEVNET,
};

// Aptos配置对象
export const aptosConfig = {
  contract: {
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
    moduleName: process.env.NEXT_PUBLIC_MODULE_NAME || '',
  },
  network: networkMap[
    (process.env.NEXT_PUBLIC_NETWORK || 'devnet').toLowerCase()
  ] || Network.DEVNET,
} as const;

// 类型导出
export type AptosConfig = typeof aptosConfig; 
