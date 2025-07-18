import { useState } from 'react';
import MonacoEditor from './MonacoEditor';
import styles from './MovePlayground.module.css';
import Convert from 'ansi-to-html';
import { api } from '@/api/Api';

const convert = new Convert({
  newline: true,
  escapeXML: true,
  colors: {
    9: '#E06C75', // 红色错误信息
    36: '#56B6C2', // 青色文件路径
  }
});

const defaultMoveCode = `
module playground::hello {
    use std::string;
    use std::string::String;

    public fun hello_world(): String {
        string::utf8(b"HelloWorld")
    }
}
`.trim();

export default function MovePlayground() {
  const [code, setCode] = useState(defaultMoveCode);
  const [compileResult, setCompileResult] = useState<{
    success: boolean;
    output?: string;
    error?: string | null;
  } | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);

  const handleCompile = async () => { 
    setIsCompiling(true);
    try {
      const response = await api.moveController.compile(code) as any;
      if (response.data) {
        setCompileResult({
          success: response.data.success,
          output: response.data.output,
          error: response.data.error
        });
      } else {
        setCompileResult(null);
      }
    } catch (error) {
      setCompileResult({
        success: false,
        error: error instanceof Error ? error.message : '编译过程中发生错误'
      });
    } finally {
      setIsCompiling(false);
    }
  };

  const formatOutput = (text: string) => {
    return { __html: convert.toHtml(text) };
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Move 代码操场</h2>
        <button
          onClick={handleCompile}
          disabled={isCompiling}
          className={styles.button}
        >
          {isCompiling ? '编译中...' : '编译'}
        </button>
      </div>

      <div className={styles.editorContainer}>
        <MonacoEditor
          value={code}
          onChange={setCode}
          height="100%"
        />
      </div>

      {compileResult && (
        <div className={styles.resultContainer}>
          <h3 className={styles.resultTitle}>
            编译{compileResult.success ? '成功' : '失败'}
          </h3>
          {compileResult.output && (
            <pre 
              className={styles.output}
              dangerouslySetInnerHTML={formatOutput(compileResult.output)}
            />
          )}
          {compileResult.error && (
            <pre 
              className={styles.error}
              dangerouslySetInnerHTML={formatOutput(compileResult.error)}
            />
          )}
        </div>
      )}
    </div>
  );
} 