import { useCallback, useMemo } from 'react';
import { triggerAssistantEvent, AssistantEvent } from '../components/FloatingAssistant';

// 预定义的助手消息类型
export interface AssistantMessageType {
  welcomeToPage: (pageName?: string) => void;
  congratulateSuccess: (achievement?: string) => void;
  encourageOnError: (errorType?: string) => void;
  provideHint: (hint?: string) => void;
  celebrateCompletion: (taskName?: string) => void;
  motivateToLearn: () => void;
  customMessage: (message: string) => void;
}

export const useFloatingAssistant = (): AssistantMessageType => {
  
  const welcomeToPage = useCallback((pageName?: string) => {
    const pageText = pageName || '这个页面';
    const locationText = pageName || '这里';
    const welcomeMessages = [
      `欢迎来到${pageText}！`,
      '你又来学习啦！',
      `在${locationText}开始新的学习旅程吧！`,
      '准备好接受新的挑战了吗？'
    ];
    
    const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    
    triggerAssistantEvent({
      type: 'page_enter',
      message: randomMessage
    });
  }, []);

  const congratulateSuccess = useCallback((achievement?: string) => {
    const achievementText = achievement || '任务';
    const successMessages = [
      `太棒了！${achievementText}完成得很不错！`,
      '做得好！继续保持这个节奏！',
      achievement ? `很棒的表现！在${achievement}上你正在稳步前进！` : '很棒的表现！你正在稳步前进！',
      '完美！你的学习能力真强！'
    ];
    
    const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)];
    
    triggerAssistantEvent({
      type: 'checkpoint_completed',
      message: randomMessage
    });
  }, []);

  const encourageOnError = useCallback((errorType?: string) => {
    const errorText = errorType || '错误';
    const encourageMessages = [
      `别担心，${errorText}很正常！再试试看？`,
      '每个错误都是学习的机会！',
      '调试是成长的必经之路，加油！',
      '遇到困难是好事，说明你正在学习新东西！'
    ];
    
    const randomMessage = encourageMessages[Math.floor(Math.random() * encourageMessages.length)];
    
    triggerAssistantEvent({
      type: 'analyze_error',
      message: randomMessage
    });
  }, []);

  const provideHint = useCallback((hint?: string) => {
    const defaultHints = [
      '需要帮助吗？我可以为你解答学习中的问题！',
      '遇到困难可以尝试从不同角度思考！',
      '仔细阅读提示信息，答案就在其中！',
      '不要着急，一步一步来！'
    ];
    
    const message = hint || defaultHints[Math.floor(Math.random() * defaultHints.length)];
    
    triggerAssistantEvent({
      type: 'custom',
      message: `💡 ${message}`
    });
  }, []);

  const celebrateCompletion = useCallback((taskName?: string) => {
    const taskText = taskName || '任务';
    const completionMessages = [
      `恭喜完成${taskText}！`,
      `${taskText}完成！你真是学习高手！`,
      '又攻克了一个难关！继续前进！',
      `${taskText}掌握得很好！准备迎接新挑战！`
    ];
    
    const randomMessage = completionMessages[Math.floor(Math.random() * completionMessages.length)];
    
    triggerAssistantEvent({
      type: 'chapter_completed',
      message: randomMessage
    });
  }, []);

  const motivateToLearn = useCallback(() => {
    const motivationMessages = [
      '学习贵在坚持，每一小步都是进步！',
      '你的努力不会白费，知识的积累终将开花结果！',
      '保持好奇心，世界等待你去探索！',
      '今天的学习，是明天成功的基础！',
      '相信自己，你有无限的学习潜力！'
    ];
    
    const randomMessage = motivationMessages[Math.floor(Math.random() * motivationMessages.length)];
    
    triggerAssistantEvent({
      type: 'custom',
      message: `🌟 ${randomMessage}`
    });
  }, []);

  const customMessage = useCallback((message: string) => {
    triggerAssistantEvent({
      type: 'custom',
      message: message
    });
  }, []);

  // 使用 useMemo 来稳定化返回的对象，避免每次都重新创建
  return useMemo(() => ({
    welcomeToPage,
    congratulateSuccess,
    encourageOnError,
    provideHint,
    celebrateCompletion,
    motivateToLearn,
    customMessage
  }), [
    welcomeToPage,
    congratulateSuccess,
    encourageOnError,
    provideHint,
    celebrateCompletion,
    motivateToLearn,
    customMessage
  ]);
};

export default useFloatingAssistant; 