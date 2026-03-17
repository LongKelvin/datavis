'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useAppStore } from '@/store';
import { astToObject } from '@/lib/parsers/buildAST';
import { runJsonPath } from '@/lib/query/jsonpath';
import { useIsDark } from '@/hooks/useIsDark';

interface QueryDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function QueryDrawer({ open, onClose }: QueryDrawerProps) {
  const ast = useAppStore(s => s.ast);
  const isDark = useIsDark();
  const [queryType, setQueryType] = useState<'jsonpath'>('jsonpath');
  const [expression, setExpression] = useState('$.store.inventory[*].name');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleRun = () => {
    if (!ast) {
      setError('No data loaded');
      return;
    }

    try {
      const obj = astToObject(ast);
      if (queryType === 'jsonpath') {
        const results = runJsonPath(obj as object, expression);
        setResult(JSON.stringify(results, null, 2));
        setError('');
      }
    } catch (err) {
      setError((err as Error).message);
      setResult('');
    }
  };

  if (!open) return null;

  return (
    <div className="query-drawer">
      <div className="query-drawer-header">
        <h3>Query Engine</h3>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>
      <div className="query-drawer-body">
        <div className="query-controls">
          <select
            className="format-selector"
            value={queryType}
            onChange={(e) => setQueryType(e.target.value as 'jsonpath')}
            title="Query type"
          >
            <option value="jsonpath">JSONPath</option>
          </select>
          <input
            type="text"
            className="search-input query-input"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="$.store.inventory[*].name"
          />
          <button className="toolbar-btn query-run-btn" onClick={handleRun}>
            ▶ Run
          </button>
        </div>

        {error && <div className="parse-error">{error}</div>}

        {result && (
          <div className="query-result">
            <Editor
              height="200px"
              language="json"
              theme={isDark ? 'vs-dark' : 'vs'}
              value={result}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 12,
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
