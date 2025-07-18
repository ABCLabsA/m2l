export interface CheckpointContext {
  checkpointType?: 'CHOICE' | 'TEXT' | 'CODE';
  checkpointQuestion?: string;
  checkpointOptions?: {[key: string]: string};
  code?: string;
  baseCode?: string;
}

/**
 * 调试函数：测试代码获取功能
 * 在浏览器控制台调用此函数来测试代码获取是否正常工作
 */
export function debugGetMonacoContent(): void {
  console.log('=== Monaco 编辑器代码获取调试 ===');
  
  // 检查全局编辑器实例
  if (typeof window !== 'undefined') {
    console.log('1. 检查全局编辑器实例:');
    console.log('   __current_monaco_editor__:', (window as any).__current_monaco_editor__);
    console.log('   __monaco_editors__:', (window as any).__monaco_editors__);
    console.log('   monaco 对象:', (window as any).monaco);
    
    // 尝试获取代码内容
    const code = getMonacoEditorContent();
    console.log('2. 获取到的代码内容:');
    if (code) {
      console.log('   代码长度:', code.length);
      console.log('   代码内容:', code);
    } else {
      console.log('   未获取到代码内容');
    }
    
    // 获取检查点上下文
    const context = getCurrentCheckpointContext();
    console.log('3. 检查点上下文:', context);
  }
  
  console.log('=== 调试完成 ===');
}

// 在开发环境中暴露调试函数到全局
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugGetMonacoContent = debugGetMonacoContent;
  (window as any).getCurrentCheckpointContext = getCurrentCheckpointContext;
  (window as any).getMonacoEditorContent = getMonacoEditorContent;
  console.log('调试函数已暴露到全局：debugGetMonacoContent(), getCurrentCheckpointContext(), getMonacoEditorContent()');
}

/**
 * 从DOM获取当前检查点的具体内容
 */
export function getCurrentCheckpointContext(): CheckpointContext | null {
  try {
    if (typeof window === 'undefined') return null;
    
    // 查找检查点容器
    const checkpointContainer = document.querySelector('[class*="checkPoint"]');
    if (!checkpointContainer) return null;

    const context: CheckpointContext = {};

    // 检查是否是选择题
    const radioInputs = checkpointContainer.querySelectorAll('input[type="radio"]');
    if (radioInputs.length > 0) {
      context.checkpointType = 'CHOICE';
      
      // 获取题目问题 - 查找包含问题的元素
      const questionElement = checkpointContainer.querySelector('p strong') || 
                             checkpointContainer.querySelector('.question p') ||
                             checkpointContainer.querySelector('h3 + div p');
      if (questionElement) {
        context.checkpointQuestion = questionElement.textContent?.trim();
      }

      // 获取所有选项
      const options: {[key: string]: string} = {};
      const optionElements = checkpointContainer.querySelectorAll('label');
      
      optionElements.forEach(label => {
        const optionText = label.textContent?.trim();
        if (optionText) {
          // 匹配 "A. 选项内容" 格式
          const match = optionText.match(/^([A-Z])\.\s*(.+)$/);
          if (match) {
            options[match[1]] = match[2];
          }
        }
      });
      
      if (Object.keys(options).length > 0) {
        context.checkpointOptions = options;
      }
    }

    // 检查是否是代码题
    const monacoEditor = checkpointContainer.querySelector('.monaco-editor') || 
                        checkpointContainer.querySelector('[data-mode-id]') ||
                        checkpointContainer.querySelector('textarea');
    
    if (monacoEditor) {
      context.checkpointType = 'CODE';
      
      // 获取代码题的题目描述
      const questionElement = checkpointContainer.querySelector('h3 + p') ||
                             checkpointContainer.querySelector('p:not(:has(strong))');
      if (questionElement && !questionElement.querySelector('strong')) {
        context.checkpointQuestion = questionElement.textContent?.trim();
      }

      // 尝试获取当前代码内容
      const currentCode = getMonacoEditorContent();
      if (currentCode) {
        context.code = currentCode;
      }
    }

    return Object.keys(context).length > 0 ? context : null;
  } catch (error) {
    console.error('获取检查点上下文失败:', error);
    return null;
  }
}

/**
 * 获取Monaco编辑器的当前代码内容（改进版本）
 */
function getMonacoEditorContent(): string | null {
  try {
    // 方法1: 通过全局暴露的当前编辑器实例获取（最可靠）
    if (typeof window !== 'undefined' && (window as any).__current_monaco_editor__) {
      const editor = (window as any).__current_monaco_editor__;
      if (editor && typeof editor.getValue === 'function') {
        const code = editor.getValue();
        if (code && code.trim().length > 0) {
          return code;
        }
      }
    }

    // 方法2: 通过全局编辑器列表获取
    if (typeof window !== 'undefined' && (window as any).__monaco_editors__) {
      const editors = (window as any).__monaco_editors__;
      if (editors && editors.length > 0) {
        // 获取最后一个编辑器实例（通常是最新的）
        const editor = editors[editors.length - 1];
        if (editor && typeof editor.getValue === 'function') {
          const code = editor.getValue();
          if (code && code.trim().length > 0) {
            return code;
          }
        }
      }
    }

    // 方法3: 通过Monaco全局对象获取
    if (typeof window !== 'undefined' && (window as any).monaco) {
      const monaco = (window as any).monaco;
      if (monaco.editor && typeof monaco.editor.getEditors === 'function') {
        const editors = monaco.editor.getEditors();
        if (editors && editors.length > 0) {
          const code = editors[0].getValue();
          if (code && code.trim().length > 0) {
            return code;
          }
        }
      }
    }

    // 方法4: 通过查找所有可能的编辑器实例
    if (typeof window !== 'undefined') {
      // 尝试从window上的编辑器实例获取
      const editorInstances = ['monacoEditor', 'editor', '__monaco_editor__'];
      for (const instanceName of editorInstances) {
        const editor = (window as any)[instanceName];
        if (editor && typeof editor.getValue === 'function') {
          const code = editor.getValue();
          if (code && code.trim().length > 0) {
            return code;
          }
        }
      }
    }

    // 方法5: 通过DOM查找编辑器并尝试多种方式获取内容（作为最后的fallback）
    // 注意：这种方法可能只获取到可见的代码行，不推荐使用
    const editorContainer = document.querySelector('.monaco-editor') ||
                           document.querySelector('[class*="monaco"]') ||
                           document.querySelector('[data-mode-id]');
    
    if (editorContainer) {
      // 尝试从data属性获取
      const dataValue = editorContainer.getAttribute('data-value');
      if (dataValue) {
        return dataValue;
      }

      // 尝试从textarea获取
      const textarea = editorContainer.querySelector('textarea') ||
                      document.querySelector('textarea[class*="monaco"]');
      if (textarea) {
        const value = (textarea as HTMLTextAreaElement).value;
        if (value && value.trim().length > 0) {
          return value;
        }
      }

      // 警告：这种方法可能只获取到可见的代码行
      console.warn('正在使用DOM方式获取代码内容，可能只能获取到可见的代码行');
      const viewLines = editorContainer.querySelectorAll('.view-line');
      if (viewLines.length > 0) {
        const lines: string[] = [];
        viewLines.forEach(line => {
          const text = line.textContent || '';
          lines.push(text);
        });
        const code = lines.join('\n');
        if (code.trim().length > 0) {
          return code;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('获取Monaco编辑器内容失败:', error);
    return null;
  }
}

/**
 * 构建包含检查点具体内容的提示请求
 */
export function buildHintRequest(customQuestion?: string): string {
  const context = getCurrentCheckpointContext();
  const baseQuestion = customQuestion || '请你给我一些学习提示或建议吗？';
  
  if (!context) {
    return baseQuestion;
  }

  let questionWithContext = baseQuestion + '\n\n【当前题目信息】\n';
  
  if (context.checkpointType === 'CHOICE') {
    questionWithContext += '题目类型：选择题\n';
    
    if (context.checkpointQuestion) {
      questionWithContext += `题目：${context.checkpointQuestion}\n`;
    }
    
    if (context.checkpointOptions && Object.keys(context.checkpointOptions).length > 0) {
      questionWithContext += '选项：\n';
      Object.entries(context.checkpointOptions).forEach(([key, value]) => {
        questionWithContext += `  ${key}. ${value}\n`;
      });
    }
    
    questionWithContext += '\n请针对这道选择题给我一些解题提示，但不要直接告诉我答案。';
    
  } else if (context.checkpointType === 'CODE') {
    questionWithContext += '题目类型：代码练习\n';
    
    if (context.checkpointQuestion) {
      questionWithContext += `题目要求：${context.checkpointQuestion}\n`;
    }
    
    if (context.code) {
      questionWithContext += `我当前的代码：\n\`\`\`move\n${context.code}\n\`\`\`\n`;
    }
    
    questionWithContext += '\n请针对这个代码练习给我一些编程提示和建议。';
  }
  
  return questionWithContext;
}

/**
 * 获取用户在选择题中选择的选项
 */
export function getUserSelectedOption(): string | null {
  try {
    if (typeof window === 'undefined') return null;
    
    const checkpointContainer = document.querySelector('[class*="checkPoint"]');
    if (!checkpointContainer) return null;

    // 查找被选中的radio按钮
    const selectedRadio = checkpointContainer.querySelector('input[type="radio"]:checked') as HTMLInputElement;
    if (!selectedRadio) return null;

    // 获取选项值（通常是 A, B, C, D）
    const optionKey = selectedRadio.value;
    
    // 获取对应的选项文本
    const label = selectedRadio.closest('label');
    if (label) {
      const optionText = label.textContent?.trim();
      if (optionText) {
        // 提取选项内容，去掉"A. "前缀
        const match = optionText.match(/^([A-Z])\.\s*(.+)$/);
        if (match) {
          return `${match[1]}. ${match[2]}`;
        }
      }
    }

    return optionKey;
  } catch (error) {
    console.error('获取用户选择失败:', error);
    return null;
  }
}

/**
 * 构建选择题错误分析请求（用户选择了错误选项）
 */
export function buildChoiceErrorAnalysisRequest(customQuestion?: string): string {
  const context = getCurrentCheckpointContext();
  const baseQuestion = customQuestion || '我的选择题答错了，请帮我分析一下。';
  
  let analysisQuestion = baseQuestion + '\n\n【当前题目信息】\n';
  analysisQuestion += '题目类型：选择题\n';
  
  if (context?.checkpointQuestion) {
    analysisQuestion += `题目：${context.checkpointQuestion}\n`;
  }
  
  if (context?.checkpointOptions && Object.keys(context.checkpointOptions).length > 0) {
    analysisQuestion += '选项：\n';
    Object.entries(context.checkpointOptions).forEach(([key, value]) => {
      analysisQuestion += `  ${key}. ${value}\n`;
    });
  }
  
  // 获取用户选择的选项
  const userChoice = getUserSelectedOption();
  if (userChoice) {
    analysisQuestion += `\n【我的选择】\n我选择了：${userChoice}\n`;
  }
  
  analysisQuestion += '\n【结果】\n答案不正确\n';
  analysisQuestion += '\n请分析我为什么选错了，这个选项为什么不正确，正确的思路应该是什么？不要直接告诉我答案，而是引导我思考。';
  
  return analysisQuestion;
}

/**
 * 构建代码题错误分析请求（包含编译输出）
 */
export function buildCodeErrorAnalysisRequest(compileOutput: string, customQuestion?: string): string {
  const context = getCurrentCheckpointContext();
  const baseQuestion = customQuestion || '我的代码编译失败了，请帮我分析一下。';
  
  let analysisQuestion = baseQuestion + '\n\n【当前题目信息】\n';
  analysisQuestion += '题目类型：代码练习\n';
  
  if (context?.checkpointQuestion) {
    analysisQuestion += `题目要求：${context.checkpointQuestion}\n`;
  }
  
  // 获取完整的代码内容 - 优先使用改进后的获取方法
  const currentCode = getMonacoEditorContent();
  if (currentCode) {
    analysisQuestion += `\n【我的完整代码】\n\`\`\`move\n${currentCode}\n\`\`\`\n`;
  } else if (context?.code) {
    // 如果无法获取到完整代码，使用上下文中的代码（可能不完整）
    analysisQuestion += `\n【我的代码】\n\`\`\`move\n${context.code}\n\`\`\`\n`;
    console.warn('无法获取到完整的代码内容，使用上下文中的代码，可能不完整');
  } else {
    // 如果完全无法获取代码，添加说明
    analysisQuestion += `\n【代码获取失败】\n无法获取到当前代码内容。\n`;
  }
  
  analysisQuestion += `\n【编译输出】\n\`\`\`\n${compileOutput}\n\`\`\`\n`;
  analysisQuestion += '\n请分析我的代码哪里有问题，编译错误是什么意思，如何修复？请提供具体的修改建议。';
  
  return analysisQuestion;
}

/**
 * 构建包含错误信息和检查点内容的分析请求（通用版本，自动检测类型）
 */
export function buildErrorAnalysisRequest(errorMessage: string, customQuestion?: string): string {
  const context = getCurrentCheckpointContext();
  
  if (context?.checkpointType === 'CHOICE') {
    // 选择题使用专门的分析请求
    return buildChoiceErrorAnalysisRequest(customQuestion);
  } else if (context?.checkpointType === 'CODE') {
    // 代码题使用编译输出分析请求
    return buildCodeErrorAnalysisRequest(errorMessage, customQuestion);
  } else {
    // 通用格式
    const baseQuestion = customQuestion || '我遇到了错误，请帮我分析一下。';
    return baseQuestion + '\n\n【错误信息】\n' + errorMessage + '\n\n请分析错误原因并提供具体的解决建议。';
  }
}
