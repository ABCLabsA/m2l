import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';
import { moveLanguageConfiguration, moveTokensProvider } from '../config/monaco-move';

// 预先配置 Monaco
loader.config({ monaco });

// 确保只注册一次
let isRegistered = false;

interface MonacoEditorImplProps {
  value: string;
  onChange?: (value: string) => void;
  height?: string;
  theme?: string;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
}

export default function MonacoEditorImpl({
  value,
  onChange,
  height = '100%',
  theme = 'vs-dark',
  options = {}
}: MonacoEditorImplProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (!isRegistered) {
      // 注册 Move 语言
      monaco.languages.register({ id: 'move' });
      monaco.languages.setLanguageConfiguration('move', moveLanguageConfiguration);
      monaco.languages.setMonarchTokensProvider('move', moveTokensProvider);
      isRegistered = true;
    }

    if (editorRef.current) {
      editor.current = monaco.editor.create(editorRef.current, {
        value,
        language: 'move',
        theme,
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        ...options
      });

      // 将编辑器实例暴露到全局，供checkpointContext使用
      if (typeof window !== 'undefined') {
        (window as any).__current_monaco_editor__ = editor.current;
        // 同时维护一个编辑器列表，以兼容原有的获取方式
        if (!(window as any).__monaco_editors__) {
          (window as any).__monaco_editors__ = [];
        }
        (window as any).__monaco_editors__.push(editor.current);
      }

      editor.current.onDidChangeModelContent(() => {
        if (onChange) {
          onChange(editor.current?.getValue() || '');
        }
      });

      return () => {
        // 清理全局引用
        if (typeof window !== 'undefined') {
          if ((window as any).__current_monaco_editor__ === editor.current) {
            (window as any).__current_monaco_editor__ = null;
          }
          if ((window as any).__monaco_editors__) {
            const index = (window as any).__monaco_editors__.indexOf(editor.current);
            if (index > -1) {
              (window as any).__monaco_editors__.splice(index, 1);
            }
          }
        }
        editor.current?.dispose();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editor.current) {
      const currentValue = editor.current.getValue();
      if (currentValue !== value) {
        editor.current.setValue(value);
        // 更新全局引用
        if (typeof window !== 'undefined') {
          (window as any).__current_monaco_editor__ = editor.current;
        }
      }
    }
  }, [value]);

  return <div ref={editorRef} style={{ height, width: '100%' }} />;
} 