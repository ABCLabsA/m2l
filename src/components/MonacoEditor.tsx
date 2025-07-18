import dynamic from 'next/dynamic';

// 动态导入 monaco-editor 相关模块
const MonacoEditorImpl = dynamic(() => import('./MonacoEditorImpl'), {
  ssr: false,
});

interface MonacoEditorProps {
  value: string;
  onChange?: (value: string) => void;
  height?: string;
  theme?: string;
  options?: any;
}

export default function MonacoEditor(props: MonacoEditorProps) {
  return <MonacoEditorImpl {...props} />;
} 