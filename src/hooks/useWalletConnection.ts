import { useEffect, useRef, useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

interface UseWalletConnectionOptions {
  /** 重连尝试次数，默认为3次 */
  maxRetries?: number;
  /** 重连间隔时间（毫秒），默认为2000ms */
  retryInterval?: number;
  /** 是否在特定页面禁用监控，默认为空数组 */
  disabledPages?: string[];
}

export const useWalletConnection = (options: UseWalletConnectionOptions = {}) => {
  const {
    maxRetries = 3,
    retryInterval = 2000,
    disabledPages = ['/login', '/']
  } = options;

  const { connected, account, connect, disconnect, wallet } = useWallet();
  const router = useRouter();
  const { isLoggedIn, walletAddress, walletType, clearAuth } = useAuthStore();
  
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  // 使用 ref 来避免闭包问题
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastWalletNameRef = useRef<string | null>(null);

  // 清理定时器
  const clearReconnectTimeout = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  // 退出登录
  const handleLogout = async () => {
    try {
      console.log('钱包重连失败，开始退出登录...');
      await disconnect();
      clearAuth();
      toast.error('钱包连接已断开，已自动退出登录');
      router.push('/login');
    } catch (error) {
      console.error('退出登录失败:', error);
      clearAuth();
      router.push('/login');
    }
  };

  // 尝试重新连接钱包
  const attemptReconnect = async (walletName: string) => {
    if (isReconnecting || reconnectAttempts >= maxRetries) {
      return false;
    }

    setIsReconnecting(true);
    setReconnectAttempts(prev => prev + 1);

    try {
      console.log(`尝试重连钱包 (${reconnectAttempts + 1}/${maxRetries}):`, walletName);
      await connect(walletName);
      console.log('钱包重连成功');
      toast.success('钱包重连成功');
      setReconnectAttempts(0);
      setIsReconnecting(false);
    

    } catch (error) {
      console.error(`钱包重连失败 (${reconnectAttempts + 1}/${maxRetries}):`, error);
      
      if (reconnectAttempts + 1 >= maxRetries) {
        console.log('达到最大重连次数，退出登录');
        setIsReconnecting(false);
        await handleLogout();
        return false;
      } else {
        // 继续尝试重连
        reconnectTimeoutRef.current = setTimeout(() => {
          attemptReconnect(walletName);
        }, retryInterval);
        return false;
      }
    }
  };

  // 检查是否需要监控（在特定页面禁用监控）
  const shouldMonitor = () => {
    if (!isLoggedIn || !walletAddress) return false;
    if (disabledPages.includes(router.pathname)) return false;
    return true;
  };

  // 监控钱包连接状态
  useEffect(() => {
    if (!shouldMonitor()) {
      clearReconnectTimeout();
      setReconnectAttempts(0);
      setIsReconnecting(false);
      return;
    }

    // 记录当前钱包名称
    if (connected && wallet?.name) {
      lastWalletNameRef.current = wallet.name;
    }

    // 检测钱包断开
    if (!connected && !isReconnecting) {
      // 优先使用存储的钱包类型，然后是会话中的钱包名称
      const reconnectWalletName = walletType || lastWalletNameRef.current;
      
      if (reconnectWalletName) {
        console.log('检测到钱包断开连接，开始重连流程...', reconnectWalletName);
        toast.loading('检测到钱包断开，正在尝试重连...', { id: 'wallet-reconnect' });
        
        // 开始重连流程
        attemptReconnect(reconnectWalletName);
      }
    }

    // 连接成功时清理重连状态
    if (connected && account && isReconnecting) {
      toast.dismiss('wallet-reconnect');
      setIsReconnecting(false);
      setReconnectAttempts(0);
      clearReconnectTimeout();
    }

  }, [connected, account, isLoggedIn, walletAddress, router.pathname, isReconnecting, reconnectAttempts]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearReconnectTimeout();
    };
  }, []);

  return {
    isReconnecting,
    reconnectAttempts,
    maxRetries,
    canRetry: reconnectAttempts < maxRetries,
    manualReconnect: () => {
      const reconnectWalletName = walletType || lastWalletNameRef.current;
      if (reconnectWalletName && !isReconnecting) {
        setReconnectAttempts(0);
        attemptReconnect(reconnectWalletName);
      }
    },
    forceLogout: handleLogout
  };
}; 