import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import styles from './WalletConnect.module.css';

const WalletConnect = () => {
  return (
    <div className={styles.container}>
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted,
        }) => {
          const ready = mounted;
          const connected = ready && account && chain;

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                style: {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <button
                      onClick={openConnectModal}
                      className={styles.connectButton}
                    >
                      <svg
                        className={styles.icon}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <span>连接钱包开始学习</span>
                    </button>
                  );
                }

                return (
                  <div className={styles.accountInfo}>
                    <button
                      onClick={openChainModal}
                      className={styles.chainButton}
                    >
                      {chain.hasIcon && (
                        <div className={styles.chainIcon}>
                          {chain.iconUrl && (
                            <Image
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              width={20}
                              height={20}
                              className={styles.chainIconImage}
                            />
                          )}
                        </div>
                      )}
                      <span>{chain.name}</span>
                    </button>

                    <button
                      onClick={openAccountModal}
                      className={styles.accountButton}
                    >
                      <span>{account.displayName}</span>
                      <span>{account.displayBalance}</span>
                    </button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
};

export default WalletConnect; 