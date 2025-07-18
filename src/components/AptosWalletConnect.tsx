import React from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import Image from 'next/image';
import styles from './AptosWalletConnect.module.css';

const AptosWalletConnect: React.FC = () => {
  const {
    account,
    connected,
    disconnect,
    wallet,
    wallets,
    connect,
  } = useWallet();

  const handleConnect = async (walletName: string) => {
    try {
      await connect(walletName);
    } catch (error) {
      console.error('连接钱包失败:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('断开钱包失败:', error);
    }
  };

  if (connected && account) {
    return (
      <div className={styles.connectedWallet}>
        <div className={styles.walletInfo}>
          {wallet?.icon && (
            <Image 
              src={wallet.icon} 
              alt={wallet.name || 'Wallet'} 
              width={24}
              height={24}
              className={styles.walletIcon}
            />
          )}
          <div className={styles.accountInfo}>
            <span className={styles.walletName}>{wallet?.name}</span>
            <span className={styles.accountAddress}>
              {`${account.address.toString().slice(0, 6)}...${account.address.toString().slice(-4)}`}
            </span>
          </div>
        </div>
        <button 
          onClick={handleDisconnect}
          className={styles.disconnectButton}
        >
          断开连接
        </button>
      </div>
    );
  }

  return (
    <div className={styles.walletSelection}>
      <h3>选择 Aptos 钱包</h3>
      <div className={styles.walletList}>
        {wallets.map((wallet) => (
          <button
            key={wallet.name}
            onClick={() => handleConnect(wallet.name)}
            className={styles.walletButton}
            disabled={!wallet.readyState}
          >
            {wallet.icon && (
              <Image 
                src={wallet.icon} 
                alt={wallet.name} 
                width={24}
                height={24}
                className={styles.walletIcon}
              />
            )}
            <span>{wallet.name}</span>
            {!wallet.readyState && (
              <span className={styles.notInstalled}>未安装</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AptosWalletConnect; 