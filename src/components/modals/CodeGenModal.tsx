'use client';

import { useState, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/store';
import { generateTypeScript } from '@/lib/codegen/typescript';
import { generateGolang } from '@/lib/codegen/golang';
import { generateRust } from '@/lib/codegen/rust';
import { generatePython } from '@/lib/codegen/python';
import { generateJSONSchema } from '@/lib/codegen/jsonschema';
import { useIsDark } from '@/hooks/useIsDark';

const TABS = [
  { key: 'typescript', label: 'TypeScript', lang: 'typescript' },
  { key: 'golang', label: 'Go', lang: 'go' },
  { key: 'rust', label: 'Rust', lang: 'rust' },
  { key: 'python', label: 'Python', lang: 'python' },
  { key: 'jsonschema', label: 'JSON Schema', lang: 'json' },
] as const;

type TabKey = typeof TABS[number]['key'];

interface CodeGenModalProps {
  open: boolean;
  onClose: () => void;
}

export function CodeGenModal({ open, onClose }: CodeGenModalProps) {
  const ast = useAppStore(s => s.ast);
  const isDark = useIsDark();
  const [activeTab, setActiveTab] = useState<TabKey>('typescript');

  const code = useMemo(() => {
    if (!ast) return '// No data to generate from';

    // Use root's first child if root is a wrapper
    const node = ast.key === 'root' && ast.children.length === 1 ? ast.children[0] : ast;

    switch (activeTab) {
      case 'typescript': return generateTypeScript(node);
      case 'golang': return generateGolang(node);
      case 'rust': return generateRust(node);
      case 'python': return generatePython(node);
      case 'jsonschema': return JSON.stringify(generateJSONSchema(node), null, 2);
    }
  }, [ast, activeTab]);

  const currentTab = TABS.find(t => t.key === activeTab)!;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };

  const downloadFile = () => {
    const extensions: Record<TabKey, string> = {
      typescript: '.ts',
      golang: '.go',
      rust: '.rs',
      python: '.py',
      jsonschema: '.json',
    };
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `generated${extensions[activeTab]}`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal open={open} onClose={onClose} title="Code Generation">
      <div className="codegen-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`codegen-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="codegen-editor">
        <Editor
          height="400px"
          language={currentTab.lang}
          theme={isDark ? 'vs-dark' : 'vs'}
          value={code}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 13,
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
          }}
        />
      </div>
      <div className="codegen-actions">
        <button className="toolbar-btn" onClick={copyToClipboard}>📋 Copy to clipboard</button>
        <button className="toolbar-btn" onClick={downloadFile}>⬇ Download</button>
      </div>
    </Modal>
  );
}
