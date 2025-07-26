import '@rainbow-me/rainbowkit/styles.css';
import { connectorsForWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { createConfig, WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { Network } from '@aptos-labs/ts-sdk';
import type { AppProps } from 'next/app';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import '../styles/globals.css';
import { mainnet, sepolia } from 'wagmi/chains';
import { http } from 'wagmi';
import { okxWallet } from '@rainbow-me/rainbowkit/wallets';
import Head from 'next/head';
import RouteGuard from '@/components/RouteGuard';

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  
  const connectors = connectorsForWallets(
    [
      {
        groupName: '推荐',
        wallets: [okxWallet],
      },
    ],
    {
      appName: 'Move To Learn',
      projectId: 'YOUR_PROJECT_ID',
    }
  );

  const wagmiConfig = createConfig({
    connectors,
    chains: [mainnet, sepolia],
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
  });

  return (
    <RouteGuard>
      <AptosWalletAdapterProvider
        autoConnect={false}
        dappConfig={{ 
          network: Network.MAINNET,
        }}
        onError={(error) => {
          // 只在开发环境下打印详细错误信息
          if (process.env.NODE_ENV === 'development') {
            console.error('Aptos钱包适配器错误:', error);
          }
          
          // 处理常见的钱包连接错误
          if (error.message?.includes("Couldn't open prompt") || 
              error.message?.includes("No wallet selected") ||
              error.message?.includes("Wallet not found")) {
            // 这些是正常的钱包状态，不需要显示错误
            return;
          }
          
          // 其他错误可以显示给用户
          console.warn('钱包连接问题:', error.message);
        }}
      >
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              <Head>
                <link rel="icon" href="/assets/aptos.png" />
                <link rel="apple-touch-icon" href="/assets/aptos.png" />
              </Head>
              <Component {...pageProps} />
              <Toaster 
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#4caf50',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 4000,
                    iconTheme: {
                      primary: '#f44336',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </AptosWalletAdapterProvider>
    </RouteGuard>
  );
}
