"use client"
import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import styles from '../styles/AIChat.module.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const WELCOME_MESSAGE = {
    role: 'assistant' as const,
    content: '你好！我是你的AI助教。我可以帮助你解答问题、提供学习建议，让我们开始对话吧！'
};

const AIChat = () => {
    const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

    const [isClient, setIsClient] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const [forceUpdate, setForceUpdate] = useState(0);

    const scrollToBottom = useCallback(() => {
        requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        });
    }, []);

    const updateAssistantMessage = useCallback((content: string) => {
        setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
                lastMessage.content = content;
            }
            return newMessages;
        });
        
        requestAnimationFrame(() => {
            setForceUpdate(prev => prev + 1);
            scrollToBottom();
        });
    }, [scrollToBottom]);

    const updateAssistantMessageRealtime = useCallback((content: string) => {
        setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
                lastMessage.content = content;
            }
            return newMessages;
        });

        setForceUpdate(prev => prev + 1);
        
        Promise.resolve().then(() => {
            scrollToBottom();
        });
    }, [scrollToBottom]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, forceUpdate, scrollToBottom]);

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const adjustTextareaHeight = () => {
        const textarea = inputRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        if (!isClient || typeof window === 'undefined') {
            console.warn('组件未在客户端完全初始化，忽略请求');
            return;
        }

        const userMessage = input.trim();
        setInput('');
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
        }
        
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);
        setIsWaitingForResponse(true);

        // 添加等待消息
        setMessages(prev => [...prev, { role: 'assistant', content: '...' }]);

        if (typeof AbortController !== 'undefined') {
            abortControllerRef.current = new AbortController();
        }

        try {
            if (typeof window === 'undefined') {
                throw new Error('API调用必须在客户端执行');
            }
            
            const { aiApi } = await import('../api/Api');
            const response = await aiApi.aiAgentController.createSession(userMessage);

            if ((response as any).success === false) {
                const isRateLimit = (response as any).code === 429 || 
                                   (response as any).message?.includes('使用次数已达上限');
                    
                if (isRateLimit) {
                    const errorMessage = `⏰ ${(response as any).message || '您今日的AI助手使用次数已达上限，请明天再试'}

💡 温馨提示：
• 每日使用次数在午夜会重置
• 您可以继续浏览课程内容和完成练习
• 明天就可以继续使用AI助手了`;
                    
                    // 替换等待消息为错误消息
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content === '...') {
                            lastMessage.content = errorMessage;
                        }
                        return newMessages;
                    });
                    return;
                } else {
                    const errorMessage = (response as any).message || '抱歉，AI服务暂时不可用，请稍后再试。';
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content === '...') {
                            lastMessage.content = errorMessage;
                        }
                        return newMessages;
                    });
                    return;
                }
            }

            const assistantMessage = (response as any).data?.content || '抱歉，没有收到有效响应。';
            
            // 替换等待消息为真实消息
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content === '...') {
                    lastMessage.content = assistantMessage;
                }
                return newMessages;
            });
            
        } catch (error) {
            console.error('AI Chat Error:', error);
            
            const isRateLimit = (error as any)?.isRateLimit === true || 
                               (error as any)?.code === 429 ||
                               (error as any)?.response?.status === 429 ||
                               (error instanceof Error && error.message.includes('使用次数已达上限'));
            
            let errorMessage = '';
            
            if (isRateLimit) {
                errorMessage = `⏰ ${error instanceof Error ? error.message : '您今日的AI助手使用次数已达上限，请明天再试'}

💡 温馨提示：
• 每日使用次数在午夜会重置
• 您可以继续浏览课程内容和完成练习
• 明天就可以继续使用AI助手了`;
            } else {
                errorMessage = `抱歉，发生了错误：${error instanceof Error ? error.message : '未知错误'}。请稍后再试。`;
            }
            
            // 替换等待消息为错误消息
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content === '...') {
                    lastMessage.content = errorMessage;
                }
                return newMessages;
            });
        } finally {
            setIsLoading(false);
            setIsWaitingForResponse(false);
            abortControllerRef.current = null;
        }
    };

    const getHint = async () => {
        if (isLoading) return;
        
        setIsLoading(true);
        setIsWaitingForResponse(true);
        
        // 添加等待消息
        setMessages(prev => [...prev, { role: 'assistant', content: '...' }]);

        try {
            const { aiApi } = await import('../api/Api');
            const { buildHintRequest } = await import('../utils/checkpointContext');
            // 构建包含题目信息的提示请求
            const questionWithContext = buildHintRequest('我正在学习Move语言，可以给我一些学习提示或建议吗？');
            const response = await aiApi.aiAgentController.assistantQuestion(questionWithContext);

            if ((response as any).success === false) {
                const isRateLimit = (response as any).code === 429 || 
                                   (response as any).message?.includes('使用次数已达上限');
                    
                if (isRateLimit) {
                    const errorMessage = `⏰ ${(response as any).message || '您今日的AI助手使用次数已达上限，请明天再试'}

💡 温馨提示：
• 每日使用次数在午夜会重置
• 您可以继续浏览课程内容和完成练习
• 明天就可以继续使用AI助手了`;
                    
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content === '...') {
                            lastMessage.content = errorMessage;
                        }
                        return newMessages;
                    });
                    return;
                } else {
                    const errorMessage = (response as any).message || '抱歉，获取提示失败，请稍后再试。';
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content === '...') {
                            lastMessage.content = errorMessage;
                        }
                        return newMessages;
                    });
                    return;
                }
            }

            const hintMessage = (response as any).data?.content || '抱歉，暂时无法提供提示。';
            
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content === '...') {
                    lastMessage.content = hintMessage;
                }
                return newMessages;
            });

        } catch (error: any) {
            console.error('获取提示失败:', error);
            
            const isRateLimit = (error as any)?.isRateLimit === true || 
                               (error as any)?.code === 429 ||
                               (error as any)?.response?.status === 429 ||
                               (error instanceof Error && error.message.includes('使用次数已达上限'));
            
            let errorMessage = '';
            
            if (isRateLimit) {
                errorMessage = `⏰ ${error instanceof Error ? error.message : '您今日的AI助手使用次数已达上限，请明天再试'}

💡 温馨提示：
• 每日使用次数在午夜会重置
• 您可以继续浏览课程内容和完成练习
• 明天就可以继续使用AI助手了`;
            } else {
                errorMessage = `获取提示失败：${error.message || '未知错误'}`;
            }
            
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content === '...') {
                    lastMessage.content = errorMessage;
                }
                return newMessages;
            });
        } finally {
            setIsLoading(false);
            setIsWaitingForResponse(false);
        }
    };

    const analyzeError = async () => {
        if (isLoading) return;
        
        setIsLoading(true);
        setIsWaitingForResponse(true);
        
        // 添加等待消息
        setMessages(prev => [...prev, { role: 'assistant', content: '...' }]);

        try {
            const { aiApi } = await import('../api/Api');
            const { buildErrorAnalysisRequest } = await import('../utils/checkpointContext');
            // 构建包含题目信息和错误信息的分析请求
            const baseQuestion = '我遇到了学习问题，请帮我分析一下错误原因。';
            const errorMsg = '学习过程中遇到错误';
            const questionWithErrorContext = buildErrorAnalysisRequest(errorMsg, baseQuestion);
            const response = await aiApi.aiAgentController.assistantError(questionWithErrorContext, errorMsg);

            if ((response as any).success === false) {
                const isRateLimit = (response as any).code === 429 || 
                                   (response as any).message?.includes('使用次数已达上限');
                    
                if (isRateLimit) {
                    const errorMessage = `⏰ ${(response as any).message || '您今日的AI助手使用次数已达上限，请明天再试'}

💡 温馨提示：
• 每日使用次数在午夜会重置
• 您可以继续浏览课程内容和完成练习
• 明天就可以继续使用AI助手了`;
                    
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content === '...') {
                            lastMessage.content = errorMessage;
                        }
                        return newMessages;
                    });
                    return;
                } else {
                    const errorMessage = (response as any).message || '抱歉，错误分析失败，请稍后再试。';
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content === '...') {
                            lastMessage.content = errorMessage;
                        }
                        return newMessages;
                    });
                    return;
                }
            }

            const analysisMessage = (response as any).data?.content || '抱歉，暂时无法分析错误。';
            
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content === '...') {
                    lastMessage.content = analysisMessage;
                }
                return newMessages;
            });

        } catch (error: any) {
            console.error('错误分析失败:', error);
            
            const isRateLimit = (error as any)?.isRateLimit === true || 
                               (error as any)?.code === 429 ||
                               (error as any)?.response?.status === 429 ||
                               (error instanceof Error && error.message.includes('使用次数已达上限'));
            
            let errorMessage = '';
            
            if (isRateLimit) {
                errorMessage = `⏰ ${error instanceof Error ? error.message : '您今日的AI助手使用次数已达上限，请明天再试'}

💡 温馨提示：
• 每日使用次数在午夜会重置
• 您可以继续浏览课程内容和完成练习
• 明天就可以继续使用AI助手了`;
            } else {
                errorMessage = `错误分析失败：${error.message || '未知错误'}`;
            }
            
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content === '...') {
                    lastMessage.content = errorMessage;
                }
                return newMessages;
            });
        } finally {
            setIsLoading(false);
            setIsWaitingForResponse(false);
        }
    };

    const handleStopStream = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsLoading(false);
        }
    };

    const renderMessage = (message: Message, index: number) => {
        if (message.content === '...') {
            // 渲染等待动画
            return (
                <div key={`${index}-waiting`} className={styles.waitingMessage}>
                    <div className={styles.messageAvatar}>🤖</div>
                    <div className={styles.waitingContent}>
                        <span>AI正在思考</span>
                        <div className={styles.typingIndicator}>
                            <div className={styles.typingDot}></div>
                            <div className={styles.typingDot}></div>
                            <div className={styles.typingDot}></div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div 
                key={`${index}-${message.role}-${forceUpdate}`} 
                className={`${styles.message} ${
                    message.role === 'user' ? styles.userMessage : styles.assistantMessage
                }`}
            >
                <div className={styles.messageAvatar}>
                    {message.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className={styles.messageContent}>
                    {message.role === 'user' ? (
                        message.content
                    ) : (
                        <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                code: ({ className, children, ...props }: any) => {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const isInline = !className;
                                    return !isInline ? (
                                        <pre className={styles.codeBlock}>
                                            <code
                                                className={match ? `language-${match[1]}` : ''}
                                                {...props}
                                            >
                                                {String(children).replace(/\n$/, '')}
                                            </code>
                                        </pre>
                                    ) : (
                                        <code className={styles.inlineCode} {...props}>
                                            {children}
                                        </code>
                                    );
                                }
                            }}
                        >
                            {message.content || (isLoading ? '正在思考中...' : '')}
                        </ReactMarkdown>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={styles.chatContainer}>
            <div className={styles.messagesContainer}>
                {messages.map(renderMessage)}
                <div ref={messagesEndRef} />
            </div>
            
            {/* 快捷操作按钮 */}
            <div className={styles.quickActions}>
                <button 
                    onClick={getHint}
                    disabled={isLoading}
                    className={`${styles.quickActionButton} ${styles.hintButton} ${isLoading ? styles.loading : ''}`}
                >
                    {isLoading ? '' : '💡 获取提示'}
                </button>
                <button 
                    onClick={analyzeError}
                    disabled={isLoading}
                    className={`${styles.quickActionButton} ${styles.errorButton} ${isLoading ? styles.loading : ''}`}
                >
                    {isLoading ? '' : '🔍 分析错误'}
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.inputForm}>
                <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        adjustTextareaHeight();
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="输入您的问题..."
                    className={styles.input}
                    disabled={!isClient || isLoading}
                    rows={1}
                />
                <button 
                    type="submit" 
                    disabled={isLoading || !input.trim() || !isClient}
                    className={`${styles.submitButton} ${isLoading ? styles.loading : ''}`}
                >
                    {!isClient ? '初始化中...' : (isLoading ? '' : '发送')}
                </button>
            </form>
        </div>
    );
};

export default AIChat; 