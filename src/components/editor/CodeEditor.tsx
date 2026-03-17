'use client';

import dynamic from 'next/dynamic';
import { useAppStore } from '@/store';
import { Format } from '@/types';
import { useMemo } from 'react';
import { useIsDark } from '@/hooks/useIsDark';

// Lazy-load Monaco to avoid SSR issues and improve initial load time
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

function formatToMonacoLang(format: Format): string {
  const map: Record<Format, string> = {
    json: 'json',
    yaml: 'yaml',
    xml: 'xml',
    csv: 'plaintext',
    toml: 'plaintext',
  };
  return map[format];
}

// Thresholds for degrading Monaco features on large files
const LARGE_FILE_CHARS = 200_000;   // 200 KB chars
const HUGE_FILE_CHARS  = 500_000;   // 500 KB chars — disable validation too

export function CodeEditor() {
  const inputText = useAppStore(s => s.inputText);
  const format = useAppStore(s => s.format);
  const setInput = useAppStore(s => s.setInput);
  const parseError = useAppStore(s => s.parseError);
  const inputSizeWarning: string | null = useAppStore(s => s.inputSizeWarning);
  const isLoading: boolean = useAppStore(s => s.isLoading);
  const isDark = useIsDark();

  const language = formatToMonacoLang(format);

  const isLarge = inputText.length > LARGE_FILE_CHARS;
  const isHuge  = inputText.length > HUGE_FILE_CHARS;

  const monacoOptions = useMemo(() => ({
    minimap: { enabled: false },
    fontSize: 13,
    lineNumbers: isLarge ? ('off' as const) : ('on' as const),
    wordWrap: isLarge ? ('off' as const) : ('on' as const),
    scrollBeyondLastLine: false,
    automaticLayout: true,
    formatOnPaste: !isLarge,
    tabSize: 2,
    // Disable all expensive validation/decorators for huge files
    validate: !isHuge,
    renderValidationDecorations: isHuge ? ('off' as const) : ('on' as const),
    // Disable token-based coloring for huge files (renders as plain text)
    tokenColorization: { enabled: !isHuge },
    // Limit how many chars Monaco processes per frame
    stopRenderingLineAfter: isHuge ? 500 : 10_000,
    // Turn off link detection on large files (expensive scan)
    links: !isLarge,
    // Turn off code folding on large files
    folding: !isLarge,
    // Reduce render overhead
    renderLineHighlight: isLarge ? ('none' as const) : ('line' as const),
  }), [isLarge, isHuge]);

  return (
    <div className="code-editor-wrapper">
      {isLoading && (
        <div className="editor-loading-bar" />
      )}
      {inputSizeWarning && (
        <div className="parse-error parse-error-warning">
          <span className="parse-error-icon">⚠</span>
          {inputSizeWarning}
        </div>
      )}
      {isLarge && !inputSizeWarning && (
        <div className="editor-large-notice">
          Large file ({(inputText.length / 1024).toFixed(0)} KB) — some editor features disabled for performance
        </div>
      )}
      <Editor
        value={inputText}
        language={isHuge ? 'plaintext' : language}
        theme={isDark ? 'vs-dark' : 'vs'}
        onChange={(val) => setInput(val ?? '')}
        options={monacoOptions}
      />
      {parseError && (
        <div className="parse-error">
          <span className="parse-error-icon">⚠</span>
          {parseError}
        </div>
      )}
    </div>
  );
}
