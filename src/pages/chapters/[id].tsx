import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import styles from '../../styles/Chapter.module.css';
import { api } from '@/api/Api';
import { toast } from 'react-hot-toast';
import MonacoEditor from '../../components/MonacoEditor';
import FloatingAssistant, { triggerAssistantEvent } from '../../components/FloatingAssistant';
import { useWalletConnection } from '@/hooks/useWalletConnection';

interface CheckPointOption {
  question: string;
  options: {
    [key: string]: string;
  };
}

interface CheckPoint {
  id: string;
  chapterId: string;
  type: 'CHOICE' | 'TEXT' | 'CODE';
  options: CheckPointOption | null;
  baseCode?: string;
  createdAt: string;
  updatedAt: string;
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  content: string | null;
  order: number;
  courseId: string;
  nextChapterId: string | null;
  checkPoints: CheckPoint[];
  course: {
    id: string;
    title: string;
    type: 'AI' | 'WEB3';
  };
}

// 选择题组件
interface ChoiceQuestionProps {
  checkPoint: CheckPoint;
  onAnswer: (checkPointId: string, answer: string) => void;
  onSubmit: (checkPointId: string, answer: string) => Promise<void>;
  selectedAnswer?: string;
  isSubmitted?: boolean;
  isPassed?: boolean;
}

const ChoiceQuestion: React.FC<ChoiceQuestionProps> = ({ 
  checkPoint, 
  onAnswer, 
  onSubmit, 
  selectedAnswer,
  isSubmitted = false,
  isPassed = false
}) => {
  const [selected, setSelected] = useState<string>(selectedAnswer || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSelect = (option: string) => {
    if (isSubmitted && isPassed) return; // 如果已通过，不允许再选择
    setSelected(option);
    onAnswer(checkPoint.id, option);
  };

  const handleSubmit = async () => {
    if (!selected || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      await onSubmit(checkPoint.id, selected);
    } catch (error) {
      console.error('提交答案失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.checkPoint}>
      <h3>检查点</h3>
      <div className={styles.question}>
        <p><strong>{checkPoint.options?.question}</strong></p>
        <div className={styles.options}>
          {Object.entries(checkPoint.options?.options || {}).map(([key, value]) => (
            <div key={key} className={`${styles.option} ${isSubmitted && isPassed ? styles.disabled : ''}`}>
              <label>
                <input
                  type="radio"
                  name={`checkpoint-${checkPoint.id}`}
                  value={key}
                  checked={selected === key}
                  onChange={() => handleSelect(key)}
                  disabled={isSubmitted && isPassed}
                />
                <span className={styles.optionText}>
                  <strong>{key}.</strong> {value}
                </span>
              </label>
            </div>
          ))}
        </div>
        
        {/* 提交按钮和状态显示 */}
        <div className={styles.checkPointActions}>
          {!isSubmitted && (
            <button 
              onClick={handleSubmit}
              disabled={!selected || isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? '提交中...' : '提交答案'}
            </button>
          )}
          
          {isSubmitted && (
            <div className={`${styles.result} ${isPassed ? styles.passed : styles.failed}`}>
              {isPassed ? (
                <>
                  <span className={styles.resultIcon}>✓</span>
                  <span>检查点通过！</span>
                </>
              ) : (
                <>
                  <span className={styles.resultIcon}>✗</span>
                  <span>答案不正确，请重新尝试</span>
                </>
              )}
            </div>
          )}
          
          {/* 如果检查点已通过但未提交，显示已通过状态 */}
          {!isSubmitted && isPassed && (
            <div className={`${styles.result} ${styles.passed}`}>
              <span className={styles.resultIcon}>✓</span>
              <span>此检查点已通过</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 代码编辑检查点组件
interface CodeQuestionProps {
  checkPoint: CheckPoint;
  onCodeChange: (checkPointId: string, code: string) => void;
  onSubmit: (checkPointId: string, code: string) => Promise<void>;
  currentCode?: string;
  isSubmitted?: boolean;
  isPassed?: boolean;
  output?: string;
  cleanAnsiCodes: (text: string) => string;
}

const CodeQuestion: React.FC<CodeQuestionProps> = ({
  checkPoint,
  onCodeChange,
  onSubmit,
  currentCode,
  isSubmitted = false,
  isPassed = false,
  output,
  cleanAnsiCodes
}) => {
  const [code, setCode] = useState<string>(currentCode || checkPoint.baseCode || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCodeChange = (newCode: string) => {
    if (isSubmitted && isPassed) return; // 如果已通过，不允许再编辑
    setCode(newCode);
    onCodeChange(checkPoint.id, newCode);
  };

  const handleSubmit = async () => {
    if (!code.trim() || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      await onSubmit(checkPoint.id, code);
    } catch (error) {
      console.error('提交代码失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (isSubmitted && isPassed) return;
    const resetCode = checkPoint.baseCode || '';
    setCode(resetCode);
    onCodeChange(checkPoint.id, resetCode);
  };

  return (
    <div className={styles.checkPoint}>
      <h3>代码练习</h3>
      <p>{checkPoint.options?.question}</p>
      <div className={styles.codeQuestion}>
        <div className={styles.codeEditor}>
          <MonacoEditor
            value={code}
            onChange={handleCodeChange}
            height="400px"
            options={{
              readOnly: isSubmitted && isPassed,
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true
            }}
          />
        </div>
        
        {/* 编译输出显示 */}
        {output && (
          <div className={styles.outputSection}>
            <h4>编译输出：</h4>
            <pre className={`${styles.output} ${isPassed ? styles.success : styles.error}`}>
              {cleanAnsiCodes(output)}
            </pre>
          </div>
        )}
        
        {/* 操作按钮区域 */}
        <div className={styles.codeActions}>
          {(!isSubmitted || !isPassed) && (
            <>
              <button 
                onClick={handleReset}
                className={styles.resetButton}
                disabled={isSubmitting}
              >
                重置代码
              </button>
              <button 
                onClick={handleSubmit}
                disabled={!code.trim() || isSubmitting}
                className={styles.submitButton}
              >
                {isSubmitting ? '编译中...' : '提交代码'}
              </button>
            </>
          )}
          
          {isSubmitted && (
            <div className={`${styles.result} ${isPassed ? styles.passed : styles.failed}`}>
              {isPassed ? (
                <>
                  <span className={styles.resultIcon}>✓</span>
                  <span>代码编译通过！</span>
                </>
              ) : (
                <>
                  <span className={styles.resultIcon}>✗</span>
                  <span>代码编译失败，请检查输出信息并重新提交</span>
                </>
              )}
            </div>
          )}
          
          {/* 如果检查点已通过但未提交，显示已通过状态 */}
          {!isSubmitted && isPassed && (
            <div className={`${styles.result} ${styles.passed}`}>
              <span className={styles.resultIcon}>✓</span>
              <span>此检查点已通过</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChapterPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  
  // 启用钱包连接监控
  const walletConnection = useWalletConnection({
    maxRetries: 3,
    retryInterval: 2000,
    disabledPages: ['/login', '/']
  });
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [checkPointAnswers, setCheckPointAnswers] = useState<{[key: string]: string}>({});
  const [checkPointStates, setCheckPointStates] = useState<{
    [key: string]: { 
      isSubmitted: boolean; 
      isPassed: boolean; 
      isCorrect?: boolean;
      message?: string;
      output?: string;
    }
  }>({});
  const [isChapterPassed, setIsChapterPassed] = useState(false);

  // 处理ANSI颜色代码，将其转换为可读格式
  const cleanAnsiCodes = (text: string): string => {
    if (!text) return '';
    
    // 移除ANSI颜色代码和转义序列
    let cleaned = text
      .replace(/\x1b\[[0-9;]*m/g, '')  // 移除颜色代码
      .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '')  // 移除其他转义序列
      .replace(/\u001b\[[0-9;]*m/g, '')  // 移除unicode转义序列
      .replace(/\[\d{1,2}m/g, '');  // 移除简化的颜色代码
    
    // 清理多余的空行但保留结构
    cleaned = cleaned
      .replace(/\n\s*\n\s*\n/g, '\n\n')  // 将多个空行合并为两个
      .replace(/^\s+|\s+$/g, '');  // 移除首尾空白
    
    // 如果包含错误信息，提取关键部分
    if (cleaned.includes('error:') || cleaned.includes('Error:')) {
      // 保留构建信息但简化
      const lines = cleaned.split('\n');
      const cleanedLines = lines.map(line => {
        // 保留重要的错误信息行
        if (line.includes('error:') || 
            line.includes('Error:') || 
            line.includes('Expected') || 
            line.includes('Unexpected') ||
            line.includes('┌─') ||
            line.includes('│') ||
            line.match(/^\d+\s*│/)) {
          return line;
        }
        // 简化构建依赖信息
        if (line.includes('INCLUDING DEPENDENCY') || line.includes('BUILDING')) {
          return line;
        }
        return line;
      });
      
      return cleanedLines.join('\n');
    }
    
    return cleaned;
  };

  // 获取钱包地址
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadWalletAddress = async () => {
        try {
          const { useAuthStore } = await import('@/store/authStore');
          const authState = useAuthStore.getState();
          setWalletAddress(authState.walletAddress);
          
          // 监听钱包地址变化
          const unsubscribe = useAuthStore.subscribe((state) => {
            setWalletAddress(state.walletAddress);
          });
          
          return unsubscribe;
        } catch (error) {
          console.error('Failed to load wallet address:', error);
        }
      };
      
      loadWalletAddress();
    }
  }, []);

  useEffect(() => {
    const fetchChapter = async () => {
      if (!id || !walletAddress) return;

      try {
        const response = await api.chapterController.getChapterById(id as string);
        if (response.data) {
          const chapterData = {
            id: response.data.id,
            title: response.data.title,
            description: response.data.description,
            content: response.data.content || null,
            order: response.data.order,
            courseId: response.data.courseId,
            nextChapterId: response.data.nextChapterId || null,
            course: {
              id: response.data.course?.id || '',
              title: response.data.course?.title || '',
              type: (response.data.course as any)?.type || 'AI'
            },
            checkPoints: (response.data as any).checkPoints?.map((cp: any) => ({
              id: cp.id,
              chapterId: cp.chapterId,
              type: cp.type,
              options: cp.options,
              baseCode: cp.baseCode,
              createdAt: cp.createdAt,
              updatedAt: cp.updatedAt
            })) || []
          };
          
          setChapter(chapterData);
          
          // 检查检查点是否已通过 - 一个章节只有一个检查点
          if (chapterData.checkPoints.length > 0) {
            const status = await checkCheckPointStatus(chapterData.id);
            console.log("status", status);
            
            // 如果章节已通过，设置章节通过状态，但保持检查点可交互
            // API返回的是布尔值，true表示章节已通过
            if (status === true) {
              setIsChapterPassed(true);
              console.log("章节已通过，用户可直接进入下一章，但检查点依然可交互");
            } else {
              setIsChapterPassed(false);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching chapter:', error);
      }
    };

    fetchChapter();
  }, [id, walletAddress]);

  // 检查检查点通过状态
  const checkCheckPointStatus = async (chapterId: string) => {
    try {
      const response = await api.checkpointController.checkPointIsPassed(chapterId);
      console.log("response", response);
      // API直接返回布尔值，true表示该章节已通过
      return response
    } catch (error) {
      console.error('检查检查点状态失败:', error);
    }
  };

  // 处理检查点答案
  const handleCheckPointAnswer = (checkPointId: string, answer: string) => {
    setCheckPointAnswers(prev => ({
      ...prev,
      [checkPointId]: answer
    }));
  };

  // 处理代码检查点的代码更改
  const handleCodeChange = (checkPointId: string, code: string) => {
    setCheckPointAnswers(prev => ({
      ...prev,
      [checkPointId]: code
    }));
  };

  // 渲染检查点
  const renderCheckPoints = () => {
    if (!chapter?.checkPoints || chapter.checkPoints.length === 0) {
      return null;
    }
    

    return (
      <div className={styles.checkPoints}>
        {chapter.checkPoints.map((checkPoint) => {
          if (checkPoint.type === 'CHOICE') {
            const checkPointState = checkPointStates[checkPoint.id] || { isSubmitted: false, isPassed: false };
            return (
              <ChoiceQuestion
                key={checkPoint.id}
                checkPoint={checkPoint}
                onAnswer={handleCheckPointAnswer}
                onSubmit={submitCheckPointAnswer}
                selectedAnswer={checkPointAnswers[checkPoint.id]}
                isSubmitted={checkPointState.isSubmitted}
                isPassed={checkPointState.isPassed}
              />
            );
          } else if (checkPoint.type === 'CODE') {
            const checkPointState = checkPointStates[checkPoint.id] || { isSubmitted: false, isPassed: false };
            return (
              <CodeQuestion
                key={checkPoint.id}
                checkPoint={checkPoint}
                onCodeChange={handleCodeChange}
                onSubmit={submitCheckPointAnswer}
                currentCode={checkPointAnswers[checkPoint.id]}
                isSubmitted={checkPointState.isSubmitted}
                isPassed={checkPointState.isPassed}
                output={checkPointState.output}
                cleanAnsiCodes={cleanAnsiCodes}
              />
            );
          }
          // 可以在这里添加其他类型的检查点渲染
          return null;
        })}
      </div>
    );
  };

  const submitCheckPointAnswer = async (checkPointId: string, answer: string) => {
    try {
      // 使用正确的API调用方法，传递答案作为content参数
      const response = await api.checkpointController.commitCheckpointAnswer(checkPointId, answer);
      
      // 获取当前检查点信息
      const currentCheckPoint = chapter?.checkPoints.find(cp => cp.id === checkPointId);
      
      // 根据检查点类型判断是否通过
      let isPassed = false;

        // 对于代码类型，使用isCorrect字段判断
      isPassed = response?.isCorrect || response?.correct || false;
      
      const isCorrect = response?.isCorrect || response?.correct || false;
      const message = response?.msg || response?.message || '';
      const output = response?.output || response?.compileOutput || '';
      
      // 更新检查点状态
      setCheckPointStates(prev => ({
        ...prev,
        [checkPointId]: {
          isSubmitted: true,
          isPassed: isPassed,
          isCorrect: isCorrect,
          message: message,
          output: output
        }
      }));

      if (isPassed) {
        toast.success('检查点通过！');
        // 触发检查点完成事件
        triggerAssistantEvent({ type: 'checkpoint_completed' });
      } else {
        toast.error(message || (currentCheckPoint?.type === 'CODE' ? '代码编译失败，请查看输出信息并重新提交' : '答案不正确，请重新尝试'));
        // 触发分析错误事件
        if (currentCheckPoint) {
          triggerAssistantEvent({ 
            type: 'analyze_error',
            errorInfo: {
              // 对于代码题，使用编译输出作为错误信息；对于其他类型，使用消息
              errorMessage: currentCheckPoint.type === 'CODE' ? (output || message || '代码编译失败') : (message || '答案不正确'),
              code: currentCheckPoint.type === 'CODE' ? (checkPointAnswers[checkPointId] || currentCheckPoint.baseCode || '') : undefined,
              checkpointType: currentCheckPoint.type
            }
          });
        }
        // 失败时，立即允许重新提交
        setCheckPointStates(prev => ({
          ...prev,
          [checkPointId]: {
            isSubmitted: false,
            isPassed: false,
            isCorrect: isCorrect,
            message: message,
            output: output
          }
        }));
      }
    } catch (error) {
      console.error('提交答案失败:', error);
      toast.error('提交失败，请重试');
    }
  };

  // 检查是否所有检查点都已通过
  const areAllCheckPointsPassed = () => {
    console.log("areAllCheckPointsPassed检查: isChapterPassed =", isChapterPassed);
    
    // 如果章节已通过，直接允许进入下一章
    if (isChapterPassed) {
      console.log("章节已通过，允许进入下一章");
      return true;
    }
    
    if (!chapter?.checkPoints || chapter.checkPoints.length === 0) {
      return true; // 如果没有检查点，默认通过
    }
    
    // 检查章节的所有检查点是否都已通过
    return chapter.checkPoints.every(checkPoint => {
      const state = checkPointStates[checkPoint.id];
      if (!state) return false;
      
      // 根据检查点类型使用不同的判断逻辑
      if (checkPoint.type === 'CODE') {
        // 代码类型使用isCorrect字段
        return state.isCorrect === true;
      } else {
        // 其他类型使用isPassed字段
        return state.isPassed === true;
      }
    });
  };

  const handleNextChapter = async () => {
    if (!chapter || isUpdatingProgress) return;

    // 检查是否所有检查点都已通过
    if (!areAllCheckPointsPassed()) {
      toast.error('请先完成所有检查点再继续');
      return;
    }

    try {
      setIsUpdatingProgress(true);
      
      // 触发章节完成事件
      triggerAssistantEvent({ type: 'chapter_completed' });

      // 如果有下一章，跳转到下一章
      if (chapter.nextChapterId) {
              // 更新当前章节的完成状态
      await api.userProgressController.update(
        chapter.courseId,
        chapter.id
      );

        router.push(`/chapters/${chapter.nextChapterId}`);
      } else {
        // 更新当前章节的完成状态
        await api.userProgressController.finish(
          chapter.courseId,
          chapter.id
        );
        router.push(`/courses/${chapter.courseId}`);
      }
    } catch (error) {
      console.error('更新进度失败:', error);
      // 即使更新进度失败，也允许用户继续
      if (chapter.nextChapterId) {
        router.push(`/chapters/${chapter.nextChapterId}`);
      } else {
        router.push(`/courses/${chapter.courseId}`);
      }
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  if (!chapter) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{chapter.title} - Move To Learn</title>
      </Head>
      <Navbar />
      <div className={styles.content}>
        <Sidebar />
        <main className={styles.main}>
          <h1>{chapter.title}</h1>
          <div className={styles.chapterContent}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {chapter.content || ''}
            </ReactMarkdown>
            <div>
              {/* 章节已通过提示 */}
              {isChapterPassed && (
                <div className={styles.chapterPassedNotice}>
                  <span className={styles.passedIcon}>✓</span>
                  <div>
                    <strong>此章节已通过</strong>
                    <p>你可以直接进入下一章，或继续练习下方的检查点。</p>
                  </div>
                </div>
              )}
              {renderCheckPoints()}
            </div>
          </div>
          <button 
            onClick={handleNextChapter}
            className={styles.nextButton}
            disabled={isUpdatingProgress || !areAllCheckPointsPassed()}
          >
            {isUpdatingProgress ? '更新进度中...' : 
             !areAllCheckPointsPassed() ? '请完成检查点' :
             isChapterPassed ? (chapter.nextChapterId ? '下一章 (章节已通过)' : '返回课程 (章节已通过)') :
             (chapter.nextChapterId ? '下一章' : '返回课程')}
          </button>
        </main>
      </div>
      
      {/* 浮窗助手 */}
      <FloatingAssistant 
        position="bottom-right" 
        autoShow={true} 
        chapterContent={chapter.content || ''}
        chapterTitle={chapter.title}
      />
    </div>
  );
};

export default ChapterPage; 