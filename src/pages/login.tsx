import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useEffect, useState, useCallback, useRef } from 'react';
import AptosWalletConnect from '../components/AptosWalletConnect';
import styles from '../styles/Login.module.css';
import Image from 'next/image';
import { api } from '@/api/Api';
import toast from 'react-hot-toast';

const Login: NextPage = () => {
  const router = useRouter();
  const { account, connected, disconnect, wallet } = useWallet();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const loginAttemptedRef = useRef(false); // 添加标志防止重复登录

  // 检查登录状态
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkAuthState = async () => {
        try {
          const { useAuthStore } = await import('@/store/authStore');
          const authState = useAuthStore.getState();
          setIsLoggedIn(authState.isLoggedIn);
        } catch (error) {
          console.error('Failed to load auth state:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      checkAuthState();
    } else {
      setIsLoading(false);
    }
  }, []);

  // 使用 useCallback 包装 handleLogin 以避免依赖项警告
  const handleLogin = useCallback(async () => {
    if (!account || isLoggingIn || loginAttemptedRef.current) return;
    
    try {
      setIsLoggingIn(true);
      loginAttemptedRef.current = true; // 设置标志，防止重复登录
      const walletAddress = account.address.toString();
      
      console.log('正在登录，钱包地址:', walletAddress);
      
      const response = await api.authController.login(walletAddress);
      
      if (response.success) {
        const data = response.data;
        const tokenValue = data.token;
        
        // 动态导入 store
        const { useAuthStore } = await import('@/store/authStore');
        useAuthStore.getState().setAuth({
          walletAddress: walletAddress,
          tokenValue,
          isLoggedIn: true,
          user: data.user,
          walletType: wallet?.name || null, // 记录钱包类型
        });

        // 立即更新本地状态
        setIsLoggedIn(true);

        toast.success('登录成功！');
        
        // 获取重定向地址或默认跳转到 dashboard
        const urlParams = new URLSearchParams(window.location.search);
        const redirectPath = urlParams.get('redirect') || '/dashboard';
        router.push(redirectPath);
      } else {
        toast.error('登录失败，请重试');
        await disconnect();
        loginAttemptedRef.current = false; // 重置标志
      }
    } catch (error) {
      console.error('登录失败:', error);
      toast.error('登录失败，请重试');
      await disconnect();
      loginAttemptedRef.current = false; // 重置标志
    } finally {
      setIsLoggingIn(false);
    }
  }, [account, isLoggingIn, router, disconnect]);

  // 处理Aptos钱包连接和登录
  useEffect(() => {
    if (isLoading || isLoggingIn) return;
    
    if (connected && account) {
      if (isLoggedIn) {
        // 已经登录，跳转到首页
        router.push('/');
      } else if (!loginAttemptedRef.current) {
        // 钱包已连接但未登录，且未尝试过登录，进行登录
        handleLogin();
      }
    } else {
      // 钱包未连接时重置标志
      loginAttemptedRef.current = false;
    }
  }, [connected, account, isLoggedIn, isLoading, isLoggingIn, router, handleLogin]);

  return (
    <div className={styles.container}>
      <Head>
        <title>登录 - Move To Learn</title>
        <meta content="连接 Aptos 钱包开始学习" name="description" />
      </Head>

      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>欢迎加入 Move To Learn</h1>
          <p className={styles.subtitle}>连接 Aptos 钱包，开启您的学习之旅</p>
          <div className={styles.benefitsContainer}>
            <div className={styles.benefits}>
              <div className={styles.benefitItem}>
                <span className={styles.icon}>🎓</span>
                <span>免费优质课程</span>
              </div>
              <div className={styles.benefitItem}>
                <span className={styles.icon}>🏆</span>
                <span>学习证明 NFT</span>
              </div>
              <div className={styles.benefitItem}>
                <span className={styles.icon}>🌟</span>
                <span>社区治理权限</span>
              </div>
            </div>
            <div className={styles.logoContainer}>
              <Image
                src="/assets/logo_color.png"
                alt="Move To Learn Logo"
                width={400}
                height={133}
                priority
                className={styles.colorLogo}
              />
            </div>
          </div>

          {isLoggingIn && (
            <div className={styles.statusMessage}>
              正在登录中，请稍候...
            </div>
          )}

          <div className={styles.connectWrapper}>
            <AptosWalletConnect />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login; 