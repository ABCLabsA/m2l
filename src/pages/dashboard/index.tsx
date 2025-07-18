import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import styles from '../../styles/Dashboard.module.css';
import { 
  WalletOutlined, 
  TrophyOutlined,
  FireOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { api } from '@/api/Api';
import { CourseBadgeResponseDto } from '@/api/dto/index.dto';
import Image from 'next/image';
import { aptosUtil, AptosUtil } from '@/utils/AptosUtil';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useWalletConnection } from '@/hooks/useWalletConnection';

const Dashboard: NextPage = () => {
  const router = useRouter();
  const { account } = useWallet();
  
  // 启用钱包连接监控
  const walletConnection = useWalletConnection({
    maxRetries: 3,
    retryInterval: 2000,
    disabledPages: ['/login', '/']
  });

  // 区块链数据状态
  const [blockchainData, setBlockchainData] = useState({
    m2lBalance: '0',
    nftCount: 0,
    totalSupply: '0',
    loading: true,
    error: null as string | null
  });

  // 获取当前用户地址
  const userAddress = account?.address?.toString() ? AptosUtil.formatAddress(account.address.toString()) : null;

  const [courseBadage, setCourseBadage] = useState<CourseBadgeResponseDto[]>([]);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // 格式化数值显示
  const formatNumber = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0';
    
    // M2L代币有8位小数，需要除以10^8
    const actualValue = num / 100000000;
    
    if (actualValue >= 1000000) {
      return (actualValue / 1000000).toFixed(1) + 'M';
    } else if (actualValue >= 1000) {
      return (actualValue / 1000).toFixed(1) + 'K';
    } else {
      return actualValue.toFixed(2);
    }
  };

  // 格式化总供应量
  const formatSupply = (value: string): string => {
    const num = parseFloat(value);
    if (isNaN(num)) return '未知';
    
    const actualValue = num / 100000000; // M2L有8位小数
    
    if (actualValue >= 1000000000) {
      return (actualValue / 1000000000).toFixed(1) + 'B';
    } else if (actualValue >= 1000000) {
      return (actualValue / 1000000).toFixed(1) + 'M';
    } else if (actualValue >= 1000) {
      return (actualValue / 1000).toFixed(1) + 'K';
    } else {
      return actualValue.toFixed(2);
    }
  };

  // 动态生成统计数据
  const stats = [
    { 
      label: 'M2L 代币', 
      value: !userAddress ? '未连接' : (blockchainData.loading ? '加载中...' : formatNumber(blockchainData.m2lBalance)),
      icon: <WalletOutlined className={styles.statIcon} />,
      color: '#1890ff'
    },
    { 
      label: '拥有的NFT', 
      value: !userAddress ? '未连接' : (blockchainData.loading ? '...' : blockchainData.nftCount.toString()),
      icon: <TrophyOutlined className={styles.statIcon} />,
      color: '#52c41a'
    },
    { 
      label: '课程证书', 
      value: courseBadage.length.toString(),
      icon: <FireOutlined className={styles.statIcon} />,
      color: '#fa8c16'
    },
    { 
      label: 'M2L总供应量', 
      value: !userAddress ? '未连接' : (blockchainData.loading ? '加载中...' : formatSupply(blockchainData.totalSupply)),
      icon: <ClockCircleOutlined className={styles.statIcon} />,
      color: '#722ed1'
    },
  ];

  const tasks = [
    { name: '完成今日课程单元 (1/1)', reward: '+15 M2L', completed: true },
    { name: '完成练习题题 (5/5)', reward: '+10 M2L', completed: true },
    { name: '分享学习笔记 (0/1)', reward: '+5 M2L', completed: false },
  ];

  const badges = [
    { title: '初学者', icon: '🚀' },
    { title: '连续7天', icon: '⚡' },
    { title: 'Move达人', icon: '🏆' },
    { title: '代码贡献者', icon: '💻' },
    { title: 'NFT创作者', icon: '🔒' },
    { title: '安全专家', icon: '🔒' },
  ];

  // 获取课程徽章数据
  const getCourseBadge = useCallback(async () => {
    try {
      const res = await api.indexController.courseBadge();
      console.log('课程徽章数据:', res);
      setCourseBadage(res.data);
    } catch (error) {
      console.error('获取课程徽章失败:', error);
    }
  }, []);

  // 获取区块链数据
  const getBlockchainData = useCallback(async () => {
    if (!userAddress) {
      setBlockchainData(prev => ({ 
        ...prev, 
        loading: false,
        error: '请先连接钱包查看区块链数据'
      }));
      return { success: false, type: 'no_wallet' };
    }

    try {
      setBlockchainData(prev => ({ ...prev, loading: true, error: null }));
      
      // 并行获取所有区块链数据
      const [userSummary, totalSupply] = await Promise.all([
        aptosUtil.getUserSummary(userAddress),
        aptosUtil.viewTotalCoinSupply()
      ]);

      setBlockchainData({
        m2lBalance: userSummary.m2lBalance,
        nftCount: userSummary.nftCount,
        totalSupply: totalSupply || '0',
        loading: false,
        error: null
      });

      console.log('区块链数据获取成功:', {
        userSummary,
        totalSupply
      });

      return { success: true, type: 'success' };
    } catch (error) {
      console.error('获取区块链数据失败:', error);
      setBlockchainData(prev => ({ 
        ...prev, 
        loading: false,
        error: '获取区块链数据失败，请检查网络连接或稍后重试'
      }));

      return { success: false, type: 'error' };
    }
  }, [userAddress]);

  // 页面初始化
  useEffect(() => {
    // 获取课程徽章（只需要执行一次）
    getCourseBadge();
  }, [getCourseBadge]);

  // 当用户地址变化时获取区块链数据
  useEffect(() => {
    getBlockchainData();
  }, [getBlockchainData]);

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = (completedTasks / totalTasks) * 100;

  return (
    <div className={styles.container}>
      <Head>
        <title>我的信息 - Move To Learn</title>
        <meta content="Move To Learn 我的信息" name="description" />
      </Head>

      <Navbar />
      <Sidebar />

      <main className={styles.main}>
        <div className={styles.content}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h1 className={styles.pageTitle}>我的信息</h1>
            <button
              onClick={getBlockchainData}
              disabled={blockchainData.loading || !userAddress}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                background: (blockchainData.loading || !userAddress) ? '#f5f5f5' : '#fff',
                cursor: (blockchainData.loading || !userAddress) ? 'not-allowed' : 'pointer',
                color: (blockchainData.loading || !userAddress) ? '#999' : '#1890ff'
              }}
            >
              <ReloadOutlined spin={blockchainData.loading} />
              {!userAddress ? '需要连接钱包' : (blockchainData.loading ? '刷新中...' : '刷新数据')}
            </button>
          </div>

          {/* 钱包连接状态显示 */}
          {!userAddress && (
            <div style={{
              background: '#fff7e6',
              border: '1px solid #ffd591',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '16px', color: '#fa8c16', marginBottom: '8px' }}>
                🔗 尚未连接钱包
              </div>
              <div style={{ color: '#666', fontSize: '14px' }}>
                请点击右上角的钱包按钮连接您的 Aptos 钱包以查看区块链数据
              </div>
            </div>
          )}

          {/* 错误信息显示 - 只在连接钱包后且有错误时显示 */}
          {userAddress && blockchainData.error && blockchainData.error !== '请先连接钱包查看区块链数据' && (
            <div style={{
              background: '#fff2f0',
              border: '1px solid #ffccc7',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '24px',
              color: '#ff4d4f'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>⚠️ 数据获取失败</div>
              <div style={{ fontSize: '14px' }}>{blockchainData.error}</div>
            </div>
          )}
          
          <div className={styles.statsContainer}>
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={styles.statCard}
                style={{ borderTop: `3px solid ${stat.color}` }}
              >
                <div className={styles.statIconWrapper} style={{ color: stat.color }}>
                  {stat.icon}
                </div>
                <div className={styles.statValue} style={{ color: stat.color }}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div className={styles.rewardsSection}>
            {/* <div className={styles.dailyTasks}>
              <h2 className={styles.sectionTitle}>
                <TrophyOutlined /> 每日任务
              </h2>
              <div className={styles.taskProgress}>
                <div className={styles.taskProgressBar}>
                  <div 
                    className={styles.taskProgressFill} 
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className={styles.taskProgressText}>
                  {completedTasks}/{totalTasks} 已完成
                </div>
              </div>
              <div className={styles.taskList}>
                {tasks.map((task, index) => (
                  <div key={index} className={styles.taskItem}>
                    <div className={styles.taskLeft}>
                      <div className={`${styles.taskStatus} ${task.completed ? styles.completed : ''}`}>
                        {task.completed && <CheckCircleOutlined />}
                      </div>
                      <span className={styles.taskName}>{task.name}</span>
                    </div>
                    <span className={styles.taskReward}>{task.reward}</span>
                  </div>
                ))}
              </div>
            </div> */}

            <div className={styles.achievementBadges}>
              <h2 className={styles.sectionTitle}>
                <TrophyOutlined /> 成就徽章
              </h2>
              {courseBadage.length > 0 ? (
                <div className={styles.badgeGrid}>
                  {courseBadage.map((badge, index) => (
                    <div key={index} className={styles.badgeItem}>
                      <div className={styles.badgeIcon}>
                        {!imageErrors.has(index) ? (
                          <Image 
                            src={badge.badge}
                            alt={`${badge.courseName}徽章`}
                            width={48}
                            height={48}
                            className={styles.badgeImage}
                            onError={() => {
                              setImageErrors(prev => new Set(prev).add(index));
                            }}
                          />
                        ) : (
                          <div className={styles.badgeFallback}>🏆</div>
                        )}
                      </div>
                      <div className={styles.badgeTitle}>{badge.courseName}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyBadges}>
                  <div className={styles.emptyIcon}>🎯</div>
                  <div className={styles.emptyText}>暂无徽章，马上学习一些课程获取吧！</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 