'use client'
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { aiApi } from '../api/Api';
import styles from '../styles/FloatingAssistant.module.css';
import { buildHintRequest, buildErrorAnalysisRequest } from '../utils/checkpointContext';

// 事件类型定义
export interface AssistantEvent {
  type: 'page_enter' | 'checkpoint_completed' | 'chapter_completed' | 'analyze_error' | 'custom';
  data?: any;
  message?: string;
  errorInfo?: {
    errorMessage: string;
    code?: string;
    checkpointType?: string;
  };
}

// 消息类型定义
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// 预定义的消息模板
const MESSAGE_TEMPLATES = {
  page_enter: [
    '你又来学习啦！',
    '欢迎回来！准备好新的挑战了吗？',
    '学习新知识的时间到了！',
    '今天也要加油学习哦！'
  ],
  checkpoint_completed: [
    '太棒了！检查点完成得很不错！',
    '做得好！继续保持这个节奏！',
    '很棒的解答！你正在稳步前进！',
    '完美！你的学习能力真强！'
  ],
  chapter_completed: [
    '恭喜完成这一章！',
    '章节完成！你真是学习高手！',
    '又攻克了一个难关！继续前进！',
    '这一章掌握得很好！准备迎接新挑战！'
  ],
  analyze_error: [
    '检测到错误，点击分析错误按钮获取详细分析',
    '有错误需要分析，我来帮你找出问题所在！',
    '遇到问题了？让我帮你分析一下错误原因'
  ]
};

interface FloatingAssistantProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  autoShow?: boolean;
  className?: string;
  chapterContent?: string;
  chapterTitle?: string;
}

const FloatingAssistant: React.FC<FloatingAssistantProps> = ({
  position = 'bottom-right',
  autoShow = true,
  className,
  chapterContent,
  chapterTitle
}) => {
  const [isMessageVisible, setIsMessageVisible] = useState(false); // 消息气泡是否显示
  const [isExpanded, setIsExpanded] = useState(false);
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false); // 是否有新消息
  const [currentErrorInfo, setCurrentErrorInfo] = useState<any>(null); // 当前错误信息
  const [isAnalyzing, setIsAnalyzing] = useState(false); // 是否正在分析错误
  
  // 聊天相关状态
  const [isChatMode, setIsChatMode] = useState(false); // 是否在聊天模式
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  // 滚动到聊天底部
  const scrollChatToBottom = () => {
    if (chatMessagesEndRef.current && chatMessagesEndRef.current.parentElement) {
      const messagesContainer = chatMessagesEndRef.current.parentElement;
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  useEffect(() => {
    if (isChatMode) {
      scrollChatToBottom();
    }
  }, [chatMessages, isChatMode]);

  // 打字效果实现
  const typeMessage = (message: string, speed: number = 50) => {
    console.log('Starting typeMessage with:', message);
    
    // 清理之前的状态
    setIsTyping(true);
    setDisplayedMessage('');
    
    // 使用字符数组而不是索引，避免状态竞态
    const characters = message.split('');
    let currentIndex = 0;
    
    const typeNextChar = () => {
      if (currentIndex < characters.length) {
        const char = characters[currentIndex];
        console.log(`Adding character ${currentIndex}: "${char}"`);
        
        // 直接使用索引计算当前应该显示的内容，而不依赖于prev状态
        const currentText = characters.slice(0, currentIndex + 1).join('');
        console.log(`Setting display message to: "${currentText}"`);
        
        setDisplayedMessage(currentText);
        currentIndex++;
        
        typingTimeoutRef.current = setTimeout(typeNextChar, speed);
      } else {
        console.log('Typing completed, final message:', message);
        setIsTyping(false);
        setHasNewMessage(true);
        
        // 最终确保显示完整消息
        setDisplayedMessage(message);
      }
    };
    
    // 立即开始第一个字符
    typeNextChar();
  };

  // 安全获取消息
  const getSafeMessage = (event: AssistantEvent): string => {
    // 如果有自定义消息且消息有效，使用自定义消息
    if (event.message && typeof event.message === 'string' && event.message.trim()) {
      return event.message.trim();
    }
    
    // 根据事件类型选择预设消息
    switch (event.type) {
      case 'page_enter':
        return MESSAGE_TEMPLATES.page_enter[Math.floor(Math.random() * MESSAGE_TEMPLATES.page_enter.length)];
      case 'checkpoint_completed':
        return MESSAGE_TEMPLATES.checkpoint_completed[Math.floor(Math.random() * MESSAGE_TEMPLATES.checkpoint_completed.length)];
      case 'chapter_completed':
        return MESSAGE_TEMPLATES.chapter_completed[Math.floor(Math.random() * MESSAGE_TEMPLATES.chapter_completed.length)];
      case 'analyze_error':
        return MESSAGE_TEMPLATES.analyze_error[Math.floor(Math.random() * MESSAGE_TEMPLATES.analyze_error.length)];
      default:
        return '你好！我是你的学习助手！';
    }
  };

  // 处理助手事件
  const handleAssistantEvent = (event: AssistantEvent) => {
    console.log('FloatingAssistant received event:', event);
    
    // 清除现有的定时器
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    // 如果是分析错误事件，保存错误信息
    if (event.type === 'analyze_error' && event.errorInfo) {
      setCurrentErrorInfo(event.errorInfo);
    }

    setIsMessageVisible(true);
    setIsExpanded(false);
    setIsChatMode(false); // 回到通知模式
    setHasNewMessage(false); // 清除新消息标记

    // 安全获取消息
    const message = getSafeMessage(event);
    console.log('Final message to display:', message);

    // 开始打字效果
    typeMessage(message);
  };

  // 添加等待消息
  const addWaitingMessage = () => {
    const waitingMessage: ChatMessage = {
      id: 'waiting-' + Date.now(),
      role: 'assistant',
      content: '...',
      timestamp: Date.now()
    };
    setChatMessages(prev => [...prev, waitingMessage]);
    
    // 滚动到底部显示等待消息
    setTimeout(() => scrollChatToBottom(), 50);
    
    return waitingMessage.id;
  };

  // 移除等待消息
  const removeWaitingMessage = (waitingId: string) => {
    setChatMessages(prev => prev.filter(msg => msg.id !== waitingId));
  };

  // 修改sendChatMessage函数以添加等待动画
  const sendChatMessage = async () => {
    if (!chatInput.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsLoading(true);
    
    // 滚动到底部显示用户消息
    setTimeout(() => scrollChatToBottom(), 50);

    // 添加等待消息
    const waitingId = addWaitingMessage();

    try {
      const { aiApi } = await import('../api/Api');
      const response = await aiApi.aiAgentController.createSession(userMessage.content);

      console.log('AI响应原始数据:', response);
      const content = (response as any).data?.content;
      
      if (response.success === false) {
        if ((response as any).code === 429) {
          throw new Error(`⏰ 您今日的AI助手使用次数已达上限，请明天再试\n\n💡 温馨提示：\n• 每日使用次数在午夜会重置\n• 您可以继续浏览课程内容和完成练习\n• 明天就可以继续使用AI助手了`);
        } else {
          throw new Error(response.message || '发送失败，请重试');
        }
      }
      
      if (!content) {
        throw new Error('AI助手暂时无法回应，请稍后重试');
      }

      // 移除等待消息并添加真实回复
      removeWaitingMessage(waitingId);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content,
        timestamp: Date.now()
      };
      
      setChatMessages(prev => prev.filter(msg => msg.id !== waitingId).concat(assistantMessage));
      
      // 滚动到底部
      setTimeout(() => scrollChatToBottom(), 100);

    } catch (error: any) {
      console.error('发送消息失败:', error);
      
      removeWaitingMessage(waitingId);
      
      let errorMessage = '抱歉，AI助手暂时无法回应';
      
      if (error.message?.includes('使用次数已达上限')) {
        errorMessage = error.message;
      } else if (error.response?.status === 500) {
        errorMessage = '🔧 服务器正在处理中，请稍后重试\n\n💡 如果问题持续存在，请刷新页面后重试';
      } else if (error.code === 'ECONNRESET' || error.message?.includes('socket hang up')) {
        errorMessage = '⏱️ 请求处理时间较长，请稍后重试\n\n💡 您也可以尝试提出更简洁的问题';
      } else if (error.response?.status >= 400) {
        errorMessage = `❌ 请求失败 (${error.response.status})\n\n💡 请检查网络连接后重试`;
      }
      
      const errorResponseMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessage,
        timestamp: Date.now()
      };
      
      setChatMessages(prev => [...prev, errorResponseMessage]);
      
      // 滚动到底部显示错误消息
      setTimeout(() => scrollChatToBottom(), 100);
    } finally {
      setIsLoading(false);
    }
  };

  // 分析错误功能 - 使用新的专用API
  const analyzeError = async () => {
    if (!currentErrorInfo || isAnalyzing) return;
    
    setIsAnalyzing(true);
    
    try {
      // 切换到聊天模式
      setIsChatMode(true);
      setIsExpanded(true);
      
      // 添加分析请求消息
      const analysisMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: '分析错误',
        timestamp: Date.now()
      };
      
      setChatMessages(prev => [...prev, analysisMessage]);
      
      // 构建包含错误信息和上下文的问题字符串
      const baseQuestion = `我在学习${currentErrorInfo.checkpointType || '课程'}时遇到了问题，请帮我分析一下错误原因。`;
      const questionWithContext = buildErrorAnalysisRequest(currentErrorInfo.errorMessage, baseQuestion);
      
      // 对于代码题，errorMessage已经是编译输出；对于其他类型，errorMessage是错误消息
      const response = await aiApi.aiAgentController.assistantError(questionWithContext, currentErrorInfo.errorMessage);
      
      // 检查响应中的错误信息（429限制等）
      if ((response as any).success === false) {
        const isRateLimit = (response as any).code === 429 || 
                           (response as any).message?.includes('使用次数已达上限');
        
        let content = '';
        if (isRateLimit) {
          content = `⏰ ${(response as any).message || '您今日的AI助手使用次数已达上限，请明天再试'}

💡 温馨提示：
• 每日使用次数在午夜会重置
• 您可以继续浏览课程内容和完成练习
• 明天就可以继续使用AI助手了`;
        } else {
          content = (response as any).message || '抱歉，分析错误时遇到问题，请稍后再试。';
        }
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content,
          timestamp: Date.now()
        };

        setChatMessages(prev => [...prev, errorMessage]);
        return;
      }
      
      // 创建助手消息
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: (response as any).data?.content || '抱歉，分析错误时没有收到有效响应。',
        timestamp: Date.now()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
      
      // 清除错误信息
      setCurrentErrorInfo(null);
      
    } catch (error) {
      console.error('分析错误失败:', error);
      
      // 检查是否是AI使用次数上限错误 - 多种检查方式
      const isRateLimit = (error as any)?.isRateLimit === true || 
                         (error as any)?.code === 429 ||
                         (error as any)?.response?.status === 429 ||
                         (error instanceof Error && error.message.includes('使用次数已达上限'));
      
      let content = '';
      
      if (isRateLimit) {
        content = `⏰ ${error instanceof Error ? error.message : '您今日的AI助手使用次数已达上限，请明天再试'}

💡 温馨提示：
• 每日使用次数在午夜会重置
• 您可以继续浏览课程内容和完成练习
• 明天就可以继续使用AI助手了`;
      } else {
        content = '抱歉，分析错误时发生了问题，请稍后再试。';
      }
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content,
        timestamp: Date.now()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 获取学习提示功能
  const getHint = async () => {
    if (isSending) return;
    
    setIsSending(true);
    
    try {
      // 切换到聊天模式
      setIsChatMode(true);
      setIsExpanded(true);
      
      // 添加提示请求消息
      const hintMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: '获取学习提示',
        timestamp: Date.now()
      };
      
      setChatMessages(prev => [...prev, hintMessage]);
      
      // 添加处理提示消息
      const processingMessage: ChatMessage = {
        id: (Date.now() + 0.5).toString(),
        role: 'assistant',
        content: '正在为您生成学习提示，请稍等...',
        timestamp: Date.now()
      };
      
      setChatMessages(prev => [...prev, processingMessage]);
      
      // 构建包含上下文信息的问题字符串
      const questionWithContext = buildHintRequest('我正在学习Move语言，可以给我一些学习提示或建议吗？');
      
      // 创建包装函数，添加重试机制
      const hintWithRetry = async (retryCount = 0): Promise<any> => {
        try {
          console.log(`尝试获取学习提示，第${retryCount + 1}次尝试`);
          
                // 使用专用的助手提示API
      const response = await aiApi.aiAgentController.assistantQuestion(questionWithContext);
          console.log("response", response);
          
          return response;
        } catch (error) {
          console.error(`获取提示失败，第${retryCount + 1}次尝试:`, error);
          
          // 如果是服务器错误且重试次数小于2次，则重试
          if (retryCount < 2 && (
            (error as any)?.code === 'ERR_BAD_RESPONSE' ||
            (error as any)?.response?.status === 500 ||
            (error as any)?.response?.status === 503
          )) {
            console.log(`准备进行第${retryCount + 2}次重试...`);
            
            // 更新处理提示
            setChatMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content.includes('正在为您生成')) {
                lastMessage.content = `第${retryCount + 1}次尝试失败，正在重试...`;
              }
              return newMessages;
            });
            
            // 等待1秒后重试
            await new Promise(resolve => setTimeout(resolve, 1000));
            return hintWithRetry(retryCount + 1);
          } else {
            throw error;
          }
        }
      };
      
      // 执行获取提示（带重试机制）
      const response = await hintWithRetry();
      
      // 移除处理提示消息
      setChatMessages(prev => prev.filter(msg => !msg.content.includes('正在为您生成') && !msg.content.includes('重试')));
      
      // 检查响应中的错误信息（429限制等）
      if ((response as any).success === false) {
        const isRateLimit = (response as any).code === 429 || 
                           (response as any).message?.includes('使用次数已达上限');
        
        let content = '';
        if (isRateLimit) {
          content = `⏰ ${(response as any).message || '您今日的AI助手使用次数已达上限，请明天再试'}

💡 温馨提示：
• 每日使用次数在午夜会重置
• 您可以继续浏览课程内容和完成练习
• 明天就可以继续使用AI助手了`;
        } else {
          content = (response as any).message || '抱歉，获取提示时遇到问题，请稍后再试。';
        }
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content,
          timestamp: Date.now()
        };

        setChatMessages(prev => [...prev, errorMessage]);
        return;
      }
      
      // 创建助手消息
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: (response as any).data?.content || '抱歉，获取提示时没有收到有效响应。',
        timestamp: Date.now()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('获取提示最终失败:', error);
      
      // 移除处理提示消息
      setChatMessages(prev => prev.filter(msg => !msg.content.includes('正在为您生成') && !msg.content.includes('重试')));
      
      // 检查是否是AI使用次数上限错误 - 多种检查方式
      const isRateLimit = (error as any)?.isRateLimit === true || 
                         (error as any)?.code === 429 ||
                         (error as any)?.response?.status === 429 ||
                         (error instanceof Error && error.message.includes('使用次数已达上限'));
      
      let content = '';
      
      if (isRateLimit) {
        content = `⏰ ${error instanceof Error ? error.message : '您今日的AI助手使用次数已达上限，请明天再试'}

💡 温馨提示：
• 每日使用次数在午夜会重置
• 您可以继续浏览课程内容和完成练习
• 明天就可以继续使用AI助手了`;
      } else if ((error as any)?.code === 'ERR_BAD_RESPONSE') {
        content = `⏰ 获取学习提示超时了

💡 建议：
• 请稍后再试
• 检查网络连接是否稳定
• 如果问题持续，请联系技术支持`;
      } else {
        content = '抱歉，获取提示时发生了问题，请稍后再试。';
      }
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content,
        timestamp: Date.now()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  // 课程内容汇总功能
  const summarizeContent = async () => {
    if (isSending) return;
    
    setIsSending(true);
    
    try {
      // 切换到聊天模式
      setIsChatMode(true);
      setIsExpanded(true);
      
      // 添加汇总请求消息
      const summaryMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: '汇总课程内容',
        timestamp: Date.now()
      };
      
      setChatMessages(prev => [...prev, summaryMessage]);
      
      // 构建汇总请求
      let summaryQuestion = '';
      if (chapterContent && chapterContent.trim()) {
        // 如果有章节内容，进行汇总
        const chapterName = chapterTitle ? `《${chapterTitle}》` : '当前章节';
        summaryQuestion = `请帮我汇总${chapterName}的主要内容和知识点。以下是章节的完整内容：

${chapterContent}

请从以下几个方面进行汇总：
1. 核心概念和知识点
2. 重要示例或代码片段
3. 学习要点和注意事项
4. 实践建议

请用中文回答，结构清晰，重点突出。`;
      } else {
        // 如果没有章节内容，提供通用提示
        summaryQuestion = '抱歉，当前页面没有检测到章节内容。请确保您在章节学习页面中使用此功能。如果您需要学习建议，我可以为您提供一般性的Move语言学习指导。';
      }
      
      // 调用AI Agent API进行内容汇总
      const response = await aiApi.aiAgentController.createSession(summaryQuestion);
      
      // 检查响应中的错误信息（429限制等）
      if ((response as any).success === false) {
        const isRateLimit = (response as any).code === 429 || 
                           (response as any).message?.includes('使用次数已达上限');
        
        let content = '';
        if (isRateLimit) {
          content = `⏰ ${(response as any).message || '您今日的AI助手使用次数已达上限，请明天再试'}

💡 温馨提示：
• 每日使用次数在午夜会重置
• 您可以继续浏览课程内容和完成练习
• 明天就可以继续使用AI助手了`;
        } else {
          content = (response as any).message || '抱歉，汇总内容时遇到问题，请稍后再试。';
        }
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content,
          timestamp: Date.now()
        };

        setChatMessages(prev => [...prev, errorMessage]);
        return;
      }
      
      // 创建助手消息
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: (response as any).data?.content || '抱歉，汇总内容时没有收到有效响应。',
        timestamp: Date.now()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('汇总内容失败:', error);
      
      // 检查是否是AI使用次数上限错误 - 多种检查方式
      const isRateLimit = (error as any)?.isRateLimit === true || 
                         (error as any)?.code === 429 ||
                         (error as any)?.response?.status === 429 ||
                         (error instanceof Error && error.message.includes('使用次数已达上限'));
      
      let content = '';
      
      if (isRateLimit) {
        content = `⏰ ${error instanceof Error ? error.message : '您今日的AI助手使用次数已达上限，请明天再试'}

💡 温馨提示：
• 每日使用次数在午夜会重置
• 您可以继续浏览课程内容和完成练习
• 明天就可以继续使用AI助手了`;
      } else {
        content = '抱歉，汇总内容时发生了问题，请稍后再试。';
      }
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content,
        timestamp: Date.now()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  // 处理输入框键盘事件
  const handleChatKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  // 切换到聊天模式
  const enterChatMode = () => {
    setIsChatMode(true);
    setIsExpanded(true);
    
    // 如果没有聊天记录，添加欢迎消息
    if (chatMessages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: '你好！我是你的AI学习助手。有什么问题我可以帮助你解答吗？',
        timestamp: Date.now()
      };
      setChatMessages([welcomeMessage]);
    }
    
    // 滚动到底部
    setTimeout(() => scrollChatToBottom(), 100);
  };

  // 退出聊天模式
  const exitChatMode = () => {
    setIsChatMode(false);
  };

  // 监听自定义事件
  useEffect(() => {
    const handleEvent = (event: CustomEvent<AssistantEvent>) => {
      handleAssistantEvent(event.detail);
    };

    window.addEventListener('assistant-event', handleEvent as EventListener);
    
    return () => {
      window.removeEventListener('assistant-event', handleEvent as EventListener);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // 页面加载时自动显示欢迎消息
  useEffect(() => {
    if (autoShow) {
      setTimeout(() => {
        handleAssistantEvent({ type: 'page_enter' });
      }, 1000); // 页面加载1秒后显示
    }
  }, [autoShow]);

  // 切换展开状态
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  };

  // 关闭消息气泡
  const handleClose = () => {
    setIsMessageVisible(false);
    setIsExpanded(false);
    setIsChatMode(false);
    setHasNewMessage(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  };

  // 切换消息气泡显示
  const toggleMessage = () => {
    setIsMessageVisible(!isMessageVisible);
    if (!isMessageVisible) {
      setHasNewMessage(false); // 打开时清除新消息标记
    }
  };

  // 修改handleActionClick函数以添加等待动画
  const handleActionClick = async (action: string) => {
    setIsLoading(true);
    
    // 立即切换到聊天模式
    setIsChatMode(true);
    setIsExpanded(true);
    
    // 根据不同操作添加用户消息和等待消息
    let userMessage: ChatMessage;
    
    switch (action) {
      case 'chat':
        setIsLoading(false);
        return;
      case 'analyze':
        userMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: '🔍 分析错误',
          timestamp: Date.now()
        };
        break;
      case 'hint':
        userMessage = {
          id: Date.now().toString(),
          role: 'user',  
          content: '💡 获取学习提示',
          timestamp: Date.now()
        };
        break;
      case 'summary':
        userMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: '📝 内容汇总',
          timestamp: Date.now()
        };
        break;
      default:
        userMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: action,
          timestamp: Date.now()
        };
    }
    
    // 添加用户消息到聊天记录
    setChatMessages(prev => [...prev, userMessage]);
    
    // 滚动到底部显示用户消息
    setTimeout(() => scrollChatToBottom(), 50);
    
    // 添加等待消息
    const waitingId = addWaitingMessage();

    try {
      const { aiApi } = await import('../api/Api');
      let response;

      switch (action) {
        case 'analyze':
          const { buildErrorAnalysisRequest } = await import('../utils/checkpointContext');
          // 构建包含题目信息和错误信息的分析请求
          const baseQuestion = '我遇到了学习问题，请帮我分析一下错误原因。';
          const errorMsg = currentErrorInfo ? currentErrorInfo.errorMessage : '学习过程中遇到错误';
          const questionWithErrorContext = buildErrorAnalysisRequest(errorMsg, baseQuestion);
          response = await aiApi.aiAgentController.assistantError(questionWithErrorContext, errorMsg);
          break;
        case 'hint':
          const { buildHintRequest } = await import('../utils/checkpointContext');
          // 构建包含题目信息的提示请求
          const questionWithContext = buildHintRequest('我正在学习Move语言，可以给我一些学习提示或建议吗？');
          response = await aiApi.aiAgentController.assistantQuestion(questionWithContext);
          break;
        case 'summary':
          // 构建包含章节内容的汇总请求
          let summaryQuestion = '';
          if (chapterContent && chapterContent.trim()) {
            // 如果有章节内容，进行汇总
            const chapterName = chapterTitle ? `《${chapterTitle}》` : '当前章节';
            summaryQuestion = `请帮我汇总${chapterName}的主要内容和知识点。以下是章节的完整内容：

${chapterContent}

请从以下几个方面进行汇总：
1. 核心概念和知识点
2. 重要示例或代码片段
3. 学习要点和注意事项
4. 实践建议

请用中文回答，结构清晰，重点突出。`;
          } else {
            // 如果没有章节内容，提供通用提示
            summaryQuestion = '抱歉，当前页面没有检测到章节内容。请确保您在章节学习页面中使用此功能。如果您需要学习建议，我可以为您提供一般性的Move语言学习指导。';
          }
          response = await aiApi.aiAgentController.createSession(summaryQuestion);
          break;
        default:
          response = await aiApi.aiAgentController.createSession(action);
      }

      console.log('AI响应原始数据:', response);
      const content = (response as any).data?.content;
      
      if (response.success === false) {
        if ((response as any).code === 429) {
          throw new Error(`⏰ 您今日的AI助手使用次数已达上限，请明天再试\n\n💡 温馨提示：\n• 每日使用次数在午夜会重置\n• 您可以继续浏览课程内容和完成练习\n• 明天就可以继续使用AI助手了`);
        } else {
          throw new Error(response.message || '操作失败，请重试');
        }
      }
      
      if (!content) {
        throw new Error('AI助手暂时无法回应，请稍后重试');
      }

      // 移除等待消息并添加真实回复
      removeWaitingMessage(waitingId);
      
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content,
        timestamp: Date.now()
      };
      
      setChatMessages(prev => prev.filter(msg => msg.id !== waitingId).concat(assistantMessage));
      
      // 滚动到底部
      setTimeout(() => scrollChatToBottom(), 100);

    } catch (error: any) {
      console.error('操作失败:', error);
      
      removeWaitingMessage(waitingId);
      
      let errorMessage = '抱歉，AI助手暂时无法回应';
      
      if (error.message?.includes('使用次数已达上限')) {
        errorMessage = error.message;
      } else if (error.response?.status === 500) {
        errorMessage = '🔧 服务器正在处理中，请稍后重试\n\n💡 如果问题持续存在，请刷新页面后重试';
      } else if (error.code === 'ECONNRESET' || error.message?.includes('socket hang up')) {
        errorMessage = '⏱️ 请求处理时间较长，请稍后重试\n\n💡 您也可以尝试提出更简洁的问题';
      } else if (error.response?.status >= 400) {
        errorMessage = `❌ 请求失败 (${error.response.status})\n\n💡 请检查网络连接后重试`;
      }
      
      const errorResponseMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: errorMessage,
        timestamp: Date.now()
      };
      
      setChatMessages(prev => [...prev, errorResponseMessage]);
      
      // 滚动到底部
      setTimeout(() => scrollChatToBottom(), 100);
    } finally {
      setIsLoading(false);
    }
  };

  // 修改renderChatMessage函数以支持等待动画
  const renderChatMessage = (message: ChatMessage) => {
    if (message.content === '...') {
      // 渲染等待动画
      return (
        <div key={message.id} className={styles.waitingMessage}>
          <div className={styles.messageAvatar}>🤖</div>
          <div className={styles.waitingContent}>
            <span>AI正在思考</span>
            <div className={styles.typingIndicatorFloat}>
              <div className={styles.typingDotFloat}></div>
              <div className={styles.typingDotFloat}></div>
              <div className={styles.typingDotFloat}></div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={message.id} className={`${styles.chatMessage} ${message.role === 'user' ? styles.userMessage : styles.assistantMessage}`}>
        <div className={styles.messageAvatar}>
          {message.role === 'user' ? '👤' : '🤖'}
        </div>
        <div className={styles.messageText}>
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.floatingAssistant} ${styles[position]} ${className || ''}`}>
      {/* 消息气泡 - 可切换显示 */}
      {isMessageVisible && (
        <div className={`${styles.messageBubble} ${isExpanded ? styles.expanded : ''} ${isChatMode ? styles.chatMode : ''}`}>
          <div className={styles.messageHeader}>
            <div className={styles.assistantInfo}>
              <div className={styles.avatar}>🤖</div>
              <span className={styles.name}>学习助手</span>
            </div>
            <div className={styles.actions}>
              {!isChatMode && (
                <button 
                  className={styles.chatButton}
                  onClick={enterChatMode}
                  title="开始聊天"
                >
                  💬
                </button>
              )}
              {isChatMode && (
                <button 
                  className={styles.backButton}
                  onClick={exitChatMode}
                  title="返回"
                >
                  ↩
                </button>
              )}
              <button 
                className={styles.expandButton}
                onClick={toggleExpanded}
                title={isExpanded ? "收起" : "展开"}
              >
                {isExpanded ? '−' : '+'}
              </button>
              <button 
                className={styles.closeButton}
                onClick={handleClose}
                title="关闭"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className={styles.messageContent}>
            {!isChatMode ? (
              // 通知模式
              <>
                <p className={styles.message}>
                  {displayedMessage || ''}
                  {isTyping && <span className={styles.cursor}>|</span>}
                </p>
                
                {isExpanded && (
                  <div className={styles.expandedContent}>
                    <div className={styles.quickActions}>
                      <button 
                        className={styles.actionButton}
                        onClick={() => handleActionClick('chat')}
                        disabled={isLoading}
                      >
                        {isLoading ? '' : '💬 聊天'}
                      </button>
                      <button 
                        className={styles.actionButton}
                        onClick={() => handleActionClick('hint')}
                        disabled={isLoading}
                      >
                        {isLoading ? '' : '💡 提示'}
                      </button>
                      {currentErrorInfo && (
                        <button 
                          className={`${styles.actionButton} ${styles.analyzeButton}`}
                          onClick={() => handleActionClick('analyze')}
                          disabled={isLoading}
                        >
                          {isLoading ? '' : '🔍 分析错误'}
                        </button>
                      )}
                      <button 
                        className={styles.actionButton}
                        onClick={() => handleActionClick('summary')}
                        disabled={isLoading}
                      >
                        {isLoading ? '' : '📝 内容汇总'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // 聊天模式
              <div className={styles.chatContainer}>
                <div className={styles.chatMessages}>
                  {chatMessages.map((message) => renderChatMessage(message))}
                  <div ref={chatMessagesEndRef} />
                </div>
                
                <div className={styles.chatInputContainer}>
                  <textarea
                    ref={chatInputRef}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleChatKeyDown}
                    placeholder="输入消息...（按Enter发送）"
                    disabled={isLoading}
                    className={styles.chatInput}
                    rows={1}
                  />
                  <button 
                    onClick={sendChatMessage}
                    disabled={isLoading || !chatInput.trim()}
                    className={`${styles.sendButton} ${isLoading ? styles.loading : ''}`}
                  >
                    {isLoading ? '' : '发送'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 浮动的小头像 - 消息气泡未显示时才显示 */}
      {!isMessageVisible && (
        <div 
          className={`${styles.floatingAvatar} ${hasNewMessage ? styles.hasNewMessage : ''}`} 
          onClick={toggleMessage}
        >
          <div className={styles.avatarIcon}>🤖</div>
          {hasNewMessage && <div className={styles.newMessageIndicator}>!</div>}
          <div className={styles.pulse}></div>
        </div>
      )}
    </div>
  );
};

// 导出事件触发函数，供其他组件使用
export const triggerAssistantEvent = (event: AssistantEvent) => {
  const customEvent = new CustomEvent('assistant-event', { detail: event });
  window.dispatchEvent(customEvent);
};

export default FloatingAssistant; 