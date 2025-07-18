import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

// 不需要认证的路由
const notProtectedRoutes = ['/login', '/register', '/'];

interface RouteGuardProps {
  children: React.ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // 只在客户端运行认证检查
    if (typeof window !== 'undefined') {
      const checkAuth = async () => {
        try {
          const { useAuthStore } = await import('@/store/authStore');
          const authState = useAuthStore.getState();
          setIsLoggedIn(authState.isLoggedIn);
          
          // 设置监听器来响应认证状态变化
          const unsubscribe = useAuthStore.subscribe((state) => {
            setIsLoggedIn(state.isLoggedIn);
          });
          
          setIsLoading(false);
          
          return unsubscribe;
        } catch (error) {
          console.error('Failed to load auth store:', error);
          setIsLoading(false);
        }
      };
      
      checkAuth();
    } else {
      // 服务端渲染时，假设未登录但不显示加载状态
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !notProtectedRoutes.includes(router.pathname) && !isLoggedIn) {
      console.log('未登录，重定向到登录页');
      router.push({
        pathname: '/login',
        query: { redirect: router.pathname }
      });
    }
  }, [isLoggedIn, router, isLoading]);

  // 在加载期间显示子组件，避免闪烁
  return <>{children}</>;
} 