"use client"

import { useWallet } from '@aptos-labs/wallet-adapter-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import Image from 'next/image';
import { 
  Account, 
  Aptos, 
  AptosConfig, 
  Ed25519PrivateKey, 
  InputViewFunctionData,
} from "@aptos-labs/ts-sdk";
import { aptosConfig } from '@/config';



const navLinks = [
  { href: '/courses', label: '课程' },
  { href: '/community', label: '社区' },
  { href: '/ecosystem', label: '生态系统' },
  { href: '/dashboard', label: '我的学习' },
];

const Navbar = () => {
  const router = useRouter();
  const { disconnect } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [clearAuth, setClearAuth] = useState<(() => void) | null>(null);


  useEffect(() => {
    setMounted(true);
    
    // 在客户端加载认证状态
    if (typeof window !== 'undefined') {
      const loadAuthState = async () => {
        try {
          const { useAuthStore } = await import('@/store/authStore');
          const authState = useAuthStore.getState();
          setIsLoggedIn(authState.isLoggedIn);
          setWalletAddress(authState.walletAddress);
          setClearAuth(() => authState.clearAuth);
          
          // 监听认证状态变化
          const unsubscribe = useAuthStore.subscribe((state) => {
            setIsLoggedIn(state.isLoggedIn);
            setWalletAddress(state.walletAddress);
          });
          
          return unsubscribe;
        } catch (error) {
          console.error('Failed to load auth state:', error);
        }
      };
      
      loadAuthState();
    }
  }, []);

  const handleLogout = async () => {
    try {
      await disconnect();
      if (clearAuth) {
        clearAuth();
      }
      router.push('/');
    } catch (error) {
      console.error('退出登录失败:', error);
      // 即使钱包断开失败，也清除本地认证状态
      if (clearAuth) {
        clearAuth();
      }
      router.push('/');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isDashboard = router.pathname.startsWith('/dashboard');

  // 在客户端渲染之前返回一个占位导航栏
  if (!mounted) {
    return (
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.logo}>
            <Image
              src="/assets/logo.png"
              alt="Move To Learn Logo"
              width={300}
              height={100}
              style={{ width: 'auto', height: '40px' }}
              className="object-contain"
              quality={100}
              priority
            />
          </Link>
          <div className={styles.navRight}>
            <div className={styles.placeholder}></div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.navLeft}>
          <Link href="/" className={styles.logo}>
            <Image
              src="/assets/logo.png"
              alt="Move To Learn Logo"
              width={300}
              height={100}
              style={{ width: 'auto', height: '60px' }}
              className="object-contain"
              quality={100}
              priority
            />
          </Link>
          {isDashboard && (
            <Link href="/" className={styles.backHomeButton}>
              返回首页
            </Link>
          )}
        </div>
        <div className={styles.navCenter}>
          <Link href="/courses" className={`${styles.navLink} ${router.pathname === '/courses' ? styles.active : ''}`}>
            课程
          </Link>
            <Link href="/community" className={`${styles.navLink} ${router.pathname === '/community' ? styles.active : ''}`}>
              社区
            </Link>
          <Link href="https://aptos.dev" className={`${styles.navLink} ${router.pathname === '/ecosystem' ? styles.active : ''}`} target="_blank" rel="noopener noreferrer">
            生态系统
          </Link>
          <Link href="/dashboard" className={`${styles.navLink} ${router.pathname === '/dashboard' ? styles.active : ''}`}>
            我的学习
          </Link>
        </div>
        <div className={styles.navRight}>
          {mounted && (
            <>
              {isLoggedIn ? (
                <div className={styles.userInfo}>
                  <span className={styles.walletAddress}>
                    {formatAddress(walletAddress || '')}
                  </span>
                  <button onClick={handleLogout} className={styles.logoutButton}>
                    退出登录
                  </button>
                </div>
              ) : (
                <Link href="/login" className={styles.loginButton}>
                  连接钱包
                </Link>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

// 初始化 Aptos 客户端
const aptosClientConfig = new AptosConfig({ network: aptosConfig.network });
const aptos = new Aptos(aptosClientConfig);

// 创建账户辅助函数
export const createAccount = async (privateKeyHex?: string) => {
  if (privateKeyHex) {
    const privateKey = new Ed25519PrivateKey(privateKeyHex);
    return Account.fromPrivateKey({ privateKey });
  }
  return Account.generate();
};

// // 初始化学生档案
// export const initializeStudent = async (account: Account) => {
//   try {
//     const builder = new TransactionBuilder(aptos);
//     const rawTxn = await builder.build({
//       sender: AccountAddress.from(account.accountAddress),
//       data: {
//         function: `${aptosConfig.contract.address}::${aptosConfig.contract.moduleName}::initialize_student`,
//         typeArguments: [],
//         functionArguments: []
//       }
//     });

//     const signedTxn = await builder.sign({ signer: account, transaction: rawTxn });
//     const pendingTxn = await aptos.transaction.submit({ transaction: signedTxn });
    
//     return pendingTxn;
//   } catch (error) {
//     console.error("初始化学生档案失败:", error);
//     throw error;
//   }
// };

// // 颁发证书
// export const issueCertificate = async (
//   adminAccount: Account,
//   studentAddress: string,
//   courseId: string,
//   certificateHash: Uint8Array,
//   credits: number
// ) => {
//   try {
//     const builder = new TransactionBuilder(aptos);
//     const rawTxn = await builder.build({
//       sender: AccountAddress.from(adminAccount.accountAddress),
//       data: {
//         function: `${aptosConfig.contract.address}::${aptosConfig.contract.moduleName}::issue_certificate`,
//         typeArguments: [],
//         functionArguments: [
//           studentAddress,
//           courseId,
//           Array.from(certificateHash),
//           credits,
//         ]
//       }
//     });

//     const signedTxn = await builder.sign({ signer: adminAccount, transaction: rawTxn });
//     const pendingTxn = await aptos.transaction.submit({ transaction: signedTxn });
    
//     return pendingTxn;
//   } catch (error) {
//     console.error("颁发证书失败:", error);
//     throw error;
//   }
// };

// 查询学生证书
export const getCertificates = async (studentAddress: string) => {
  try {
    const payload: InputViewFunctionData = {
      function: `${aptosConfig.contract.address}::${aptosConfig.contract.moduleName}::get_certificates`,
      typeArguments: [],
      functionArguments: [studentAddress],
    };
    const resource = await aptos.view({ payload });
    return resource;
  } catch (error) {
    console.error("获取证书失败:", error);
    throw error;
  }
};

// 查询总学分
export const getTotalCredits = async (studentAddress: string) => {
  try {
    const payload: InputViewFunctionData = {
      function: `${aptosConfig.contract.address}::${aptosConfig.contract.moduleName}::get_total_credits`,
      typeArguments: [],
      functionArguments: [studentAddress],
    };
    const resource = await aptos.view({ payload });
    return resource;
  } catch (error) {
    console.error("获取总学分失败:", error);
    throw error;
  }
}; 