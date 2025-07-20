import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Account, Ed25519PrivateKey, PrivateKey, PrivateKeyVariants } from '@aptos-labs/ts-sdk';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import styles from '../../styles/Course.module.css';

import { api } from '@/api/Api';
import { AdminSignResponseDto, ChapterDto, CourseDetailDto } from '../../api/ApiType';
import { useAuthStore } from '@/store/authStore';
import ApiResponse from '@/api/common';
import { AptosUtil, aptosUtil } from '@/utils/AptosUtil';
import { useWalletConnection } from '@/hooks/useWalletConnection';


interface Progress {
  totalChapters: number;
  completedCount: number;
  progressPercentage: number;   
  nextChapter: ChapterDto | null;
  completedChapterIds: string[];
}

const CourseDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [course, setCourse] = useState<CourseDetailDto | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [gettingCertificate, setGettingCertificate] = useState(false);
  const { user } = useAuthStore();
  const { account, signTransaction, connected, wallets, connect } = useWallet();
  
  // 启用钱包连接监控
  const walletConnection = useWalletConnection({
    maxRetries: 3,
    retryInterval: 2000,
    disabledPages: ['/login', '/']
  });

  // 连接钱包处理函数
  const handleConnectWallet = async () => {
    try {
      // 获取之前记录的钱包类型
      const { useAuthStore } = await import('@/store/authStore');
      const storedWalletType = useAuthStore.getState().walletType;
      
      let targetWallet;
      
      // 如果有记录的钱包类型，优先尝试连接该钱包
      if (storedWalletType) {
        targetWallet = wallets.find(wallet => 
          wallet.name === storedWalletType && wallet.readyState
        );
        
        if (targetWallet) {
          console.log(`尝试重连之前使用的钱包: ${storedWalletType}`);
        } else {
          console.log(`之前使用的钱包 ${storedWalletType} 不可用，将选择其他钱包`);
        }
      }
      
      // 如果没有记录的钱包或该钱包不可用，选择第一个可用的钱包
      if (!targetWallet) {
        targetWallet = wallets.find(wallet => wallet.readyState);
      }
      
      if (targetWallet) {
        await connect(targetWallet.name);
        
        // 更新认证存储中的钱包类型
        useAuthStore.getState().setAuth({
          walletType: targetWallet.name
        });
        
        toast.success(`钱包连接成功！(${targetWallet.name})`);
      } else {
        toast.error('未检测到可用的钱包，请先安装钱包扩展');
      }
    } catch (error) {
      console.error('连接钱包失败:', error);
      toast.error('连接钱包失败，请重试');
    }
  };

  const fetchCourseAndProgress = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      // 获取课程详情
      const response = await api.courseController.getCourseById(id as string)
      
      const result = response as any;
      console.log("result", result);
      if (result.data) {
        const courseData = result.data;
        console.log("courseData", courseData);
        setCourse(courseData);
        
        // 如果用户已购买，计算进度
        if (courseData.userCourseBuy) {
          const newProgress = {
            totalChapters: courseData.chapters.length,
            completedCount: courseData.userProgressLength || 0,
            progressPercentage: ((courseData.userProgressLength || 0) / courseData.chapters.length) * 100,
            nextChapter: courseData.chapters.find((ch: any) => 
              !(courseData.userProgress || []).some((p: any) => p.completed && p.id === ch.id)
            ) || null,
            completedChapterIds: (courseData.userProgress || [])
              .filter((p: any) => p.completed)
              .map((p: any) => p.id)
          };
          setProgress(newProgress);
        }
      }
    } catch (err) {
      setError('加载课程失败，请稍后重试');
      console.error('获取课程详情失败:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourseAndProgress();
  }, [fetchCourseAndProgress]);

  // 购买课程
  const handlePurchase = async () => {
    if (!course || purchasing) return;
    
    try {
      setPurchasing(true);
      // 调用购买API
      const response = await api.courseController.buyCourse(course.id)
      
      const result = (await response) as any;
      
      console.log("result", result);
      if (result.success) {
        // 更新课程状态
        console.log("result.data", result.data);
        setCourse(prev => ({...prev, ...result.data}));
        
        // 显示成功消息
        toast.success('购买成功！');
      }
    } catch (err) {
      console.error('购买失败:', err);
      toast.error('购买失败，请稍后重试');
    } finally {
      setPurchasing(false);
    }
  };

  const handleCertificate = async () => {
    if (!course || gettingCertificate) return;
    
    // 检查钱包连接状态
    if (!account?.address) {
      toast.error('请先连接钱包才能获取证书');
      return;
    }
    
    try {
      setGettingCertificate(true);
      console.log('开始获取证书...');
      const userAddress = account.address.toString();
      const formmatedAddress = AptosUtil.formatAddress(userAddress);
      // 使用 toast.promise 来管理整个证书获取流程
      await toast.promise(
        (async () => {
          // 1. 调用后端API获取预准备的交易和管理员签名
          const response = await api.contractAdminAuthController.getNonce({
            courseId: course.id,
            userAddress: userAddress,
            points: course.finishReward
          })

          const result = response as ApiResponse<AdminSignResponseDto>;
          console.log("result", result);
          console.log("publicKeyLength", result.data.publicKey.length);
          if (!result.success) {
            throw new Error(result.message);
          } 

          // 2. 生成简单交易（不是多重签名交易）
          const transaction = await aptosUtil.generateCertificateTransaction(
            userAddress,
            course.id, 
            course.title, 
            course.finishReward, 
            result.data.nonce, 
            result.data.publicKey.map(str => parseInt(str, 10)),
            // course.badge || ''
          );
          
          console.log("生成的交易:", transaction);
          
          // 3. 用户签名交易
          const signedTransaction = await signTransaction({
            transactionOrPayload: transaction,
            asFeePayer: true
          });
          console.log("签名结果:", signedTransaction);
          
          // 4. 提交交易到区块链
          const submitResult = await aptosUtil.client.transaction.submit.simple({
            transaction: transaction,
            senderAuthenticator: signedTransaction.authenticator
          });
          // const submitResult = await aptosUtil.client.signAndSubmitTransaction({
          //   signer: generateAccount,
          //   transaction: transaction
          // });
          // console.log("交易提交结果:", submitResult);
          
          // 5. 等待交易确认
          const committedTransaction = await aptosUtil.client.transaction.waitForTransaction({
            transactionHash: submitResult.hash,
            options: {
              timeoutSecs: 60,
              checkSuccess: true
            }
          });
          
          console.log("交易确认:", committedTransaction);
          
          // 6. 更新后端证书状态
          const updateResponse = await api.contractAdminAuthController.updateCertificate(course.id);
          const updateResult = updateResponse as ApiResponse<null>;
          
          if (!updateResult.success) {
            console.warn('证书状态更新失败:', updateResult.message);
            // 不抛出错误，因为区块链交易已经成功
          }
          
          // 7. 刷新课程数据
          await fetchCourseAndProgress();
          
          return '证书获取成功！';
        })(),
        {
          loading: '正在获取证书...',
          success: '恭喜！证书获取成功，已记录在区块链上！',
          error: (err) => {
            console.error('获取证书过程中发生错误:', err);
            if (err instanceof Error) {
              if (err.message.includes('User rejected') || err.message.includes('用户取消')) {
                return '用户取消了签名操作';
              } else {
                return `获取证书失败: ${err.message}`;
              }
            }
            return '获取证书失败，请稍后重试';
          }
        }
      );
        
    } catch (error) {
      // toast.promise 已经处理了错误显示，这里不需要额外处理
      console.error('获取证书失败:', error);
    } finally {
      setGettingCertificate(false);
    }
  };
  
  // 判断章节是否可访问
  const isChapterAccessible = (chapterOrder: number) => {
    if (!course) return false;
    
    // 第一章总是可访问的
    if (chapterOrder === 1) return true;
    
    // 如果前一章节已完成，则当前章节可访问
    return (course.learnedChapterLength || 0) >= chapterOrder - 1;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Head>
          <title>加载中... - Move To Learn</title>
        </Head>
        <Navbar />
        <Sidebar />
        <main className={styles.main}>
          <div className={styles.loading}>加载中...</div>
        </main>
      </div>
    );
  }

  if (error || !course) {
    console.log("error", error);
    console.log("course", course);
    return (
      <div className={styles.container}>
        <Head>
          <title>课程加载失败 - Move To Learn</title>
        </Head>
        <Navbar />
        <Sidebar />
        <main className={styles.main}>
          <div className={styles.error}>
            {error || '课程不存在'}
            <Link href="/dashboard/courses" className={styles.backLink}>
              返回课程列表
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{course.title} - Move To Learn</title>
        <meta content={course.description} name="description" />
      </Head>

      <Navbar />
      <Sidebar />

      <main className={styles.main}>
        <div className={styles.breadcrumb}>
          <Link href="/dashboard">主页</Link> &gt; 
          <Link href="/dashboard/courses">课程</Link> &gt; 
          <span>{course.title}</span>
        </div>
        
        <div className={styles.courseHeader}>
          <div className={styles.courseInfo}>
            <div className={styles.courseBasicInfo}>
              <h1>{course.title}</h1>
              <p>{course.description}</p>
            </div>
            <div className={styles.courseActions}>
              <div className={styles.courseType}>
                {course.type && typeof course.type === 'object' && course.type.name ? course.type.name : '未分类'} 课程
              </div>
              {!course.userBrought && (
                <button 
                  className={styles.purchaseButton}
                  onClick={handlePurchase}
                  disabled={purchasing}
                >
                  {purchasing ? (
                    <span className={styles.purchaseLoading}>
                      <LoadingSpinner size="small" color="white" />
                      <span>购买中...</span>
                    </span>
                  ) : '免费获取'}
                </button>
              )}
              {course.userBrought && (
                <div className={styles.purchaseStatus}>
                  已获得课程访问权限
                </div>
              )}
            </div>
          </div>
          
          <div className={styles.courseProgress}>
            {course.userBrought  && (
              <>
                <div className={styles.progressCard}>
                  <div className={styles.progressTitle}>学习进度</div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ width: `${(course.learnedChapterLength || 0) / (course.totalChapterLength || 0) * 100}%` }}
                    ></div>
                  </div>
                  <div className={styles.progressStats}>
                    <div>已完成: {course.learnedChapterLength}/{course.totalChapterLength} 章节</div>
                    <div>{Math.round((course.learnedChapterLength || 0) / (course.totalChapterLength || 0) * 100)}%</div>
                  </div>
                  {course.chapters && course.chapters.length > 0 && (course.learnedChapterLength || 0) < (course.chapters.length || 0) && (
                    <Link href={`/chapters/${course.chapters[course.learnedChapterLength || 0]?.id}`} className={styles.continueButton}>
                      继续学习
                    </Link>
                  )}
                  {
                    course.userBrought && course.totalChapterLength === course.learnedChapterLength && course.certificateIssued && (
                      <div className={styles.certificateStatus}>
                        已获取证书
                      </div>
                    )
                  }
                  {
                    course.userBrought && course.totalChapterLength === course.learnedChapterLength && !course.certificateIssued && (
                      !connected ? (
                        <div className={styles.walletNotConnected}>
                          <div className={styles.walletNotConnectedText}>
                            请先连接钱包
                          </div>
                          <button 
                            className={styles.connectWalletButton}
                            onClick={handleConnectWallet}
                          >
                            连接钱包
                          </button>
                        </div>
                      ) : (
                        <button 
                          className={styles.certificateButton} 
                          onClick={() => handleCertificate()}
                          disabled={gettingCertificate}
                        >
                          {gettingCertificate ? (
                            <span className={styles.certificateLoading}>
                              <LoadingSpinner size="small" color="white" />
                              <span>获取证书中...</span>
                            </span>
                          ) : '获取证书'}
                        </button>
                      )
                    )
                  }
                </div>
                {course.badge && (
                  <div className={styles.badgeContainer}>
                    <div className={styles.badgeWrapper}>
                      <Image 
                        src={course.badge}
                        alt="课程徽章"
                        width={80}
                        height={80}
                        className={`${styles.badgeImage} ${(course.learnedChapterLength || 0) / (course.totalChapterLength || 0) === 1 ? '' : styles.grayscale}`}
                      />
                      <div className={styles.badgeInfo}>
                        <h3>课程徽章</h3>
                        <p>{(course.learnedChapterLength || 0) / (course.totalChapterLength || 0) === 1 ? '恭喜获得课程徽章！' : '完成所有章节即可获得徽章'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* <div className={styles.badgeContainer}>
              <div className={styles.badgeWrapper}>
                <CourseBadge 
                  type={course.type} 
                  isEarned={progress?.progressPercentage === 100}
                  size={80}
                />
                <div className={styles.badgeInfo}>
                  <h3>课程徽章</h3>
                  <p>{progress?.progressPercentage === 100 ? '恭喜获得课程徽章！' : '完成所有章节即可获得徽章'}</p>
                </div>
              </div>
            </div> */}
          </div>
        </div>

        <div className={styles.chaptersContainer}>
          <h2 className={styles.chaptersTitle}>课程章节</h2>
          <div className={styles.chaptersList}>
            {course.chapters?.map((chapter) => {  
              // chapter.id 在 course.userProgress 中
              const isCompleted = chapter.progress?.completed
              const isAccessible = isChapterAccessible(chapter.order);
              
              return (
                <div key={chapter.id} className={`${styles.chapterItem} ${isCompleted ? styles.completed : ''}`}>
                  <div className={styles.chapterOrder}>{chapter.order}</div>
                  <div className={styles.chapterContent}>
                    <h3>{chapter.title}</h3>
                    <p>{chapter.description}</p>
                  </div>
                  <div className={styles.chapterActions}>
                    {isAccessible ? (
                      <Link href={`/chapters/${chapter.id}`} className={styles.startButton}>
                        {isCompleted ? '复习' : '开始学习'}
                      </Link>
                    ) : (
                      <span className={styles.lockedButton}>请先完成前置章节</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseDetail; 