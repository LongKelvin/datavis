'use client';

import { useState, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/store';
import { astToObject } from '@/lib/parsers/buildAST';
import yaml from 'js-yaml';
import { XMLBuilder } from 'fast-xml-parser';
import Papa from 'papaparse';
import { Format } from '@/types';
import { useIsDark } from '@/hooks/useIsDark';

const CONVERSION_FORMATS: { value: Format; label: string; lang: string }[] = [
  { value: 'json', label: 'JSON', lang: 'json' },
  { value: 'yaml', label: 'YAML', lang: 'yaml' },
  { value: 'xml', label: 'XML', lang: 'xml' },
  { value: 'csv', label: 'CSV', lang: 'plaintext' },
];

interface ConvertModalProps {
  open: boolean;
  onClose: () => void;
}

export function ConvertModal({ open, onClose }: ConvertModalProps) {
  const ast = useAppStore(s => s.ast);
  const isDark = useIsDark();
  const [targetFormat, setTargetFormat] = useState<Format>('yaml');

  const converted = useMemo(() => {
    if (!ast) return '// No data to convert';

    try {
      const obj = astToObject(ast);

      switch (targetFormat) {
        case 'json':
          return JSON.stringify(obj, null, 2);
        case 'yaml':
          return yaml.dump(obj);
        case 'xml': {
          const builder = new XMLBuilder({ ignoreAttributes: false, format: true });
          return builder.build(obj);
        }
        case 'csv': {
          if (Array.isArray(obj) && obj.length > 0 && typeof obj[0] === 'object') {
            return Papa.unparse(obj as Record<string, unknown>[]);
          }
          return '// CSV conversion requires root to be an array of flat objects';
        }
        default:
          return '';
      }
    } catch (err) {
      return `// Conversion error: ${(err as Error).message}`;
    }
  }, [ast, targetFormat]);

  const currentFormat = CONVERSION_FORMATS.find(f => f.value === targetFormat)!;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(converted);
  };

  return (
    <Modal open={open} onClose={onClose} title="Format Conversion">
      <div className="codegen-tabs">
        {CONVERSION_FORMATS.map(fmt => (
          <button
            key={fmt.value}
            className={`codegen-tab ${targetFormat === fmt.value ? 'active' : ''}`}
            onClick={() => setTargetFormat(fmt.value)}
          >
            {fmt.label}
          </button>
        ))}
      </div>
      <div className="codegen-editor">
        <Editor
          height="400px"
          language={currentFormat.lang}
          theme={isDark ? 'vs-dark' : 'vs'}
          value={converted}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 13,
            scrollBeyondLastLine: false,
          }}
        />
      </div>
      <div className="codegen-actions">
        <button className="toolbar-btn" onClick={copyToClipboard}>📋 Copy to clipboard</button>
      </div>
    </Modal>
  );
}
