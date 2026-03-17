'use client';

import { useEffect, useState, useCallback } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useAppStore } from '@/store';
import { Toolbar } from '@/components/toolbar/Toolbar';
import { EditorPanel } from '@/components/editor/EditorPanel';
import { GraphCanvas } from '@/components/graph/GraphCanvas';
import { TreeView } from '@/components/graph/TreeView';
import { CodeGenModal } from '@/components/modals/CodeGenModal';
import { ConvertModal } from '@/components/modals/ConvertModal';
import { QueryDrawer } from '@/components/drawers/QueryDrawer';
import { decodeFromUrl } from '@/lib/url';
import { MAX_NODE_COUNT } from '@/lib/parsers/buildAST';

export default function HomePage() {
  const setInput = useAppStore(s => s.setInput);
  const viewMode = useAppStore(s => s.viewMode);
  const theme = useAppStore(s => s.theme);
  const nodes = useAppStore(s => s.nodes);
  const parseError = useAppStore(s => s.parseError);
  const isLoading = useAppStore(s => s.isLoading);
  const isTruncated = useAppStore(s => s.isTruncated);
  const totalNodeCount = useAppStore(s => s.totalNodeCount);

  const [codeGenOpen, setCodeGenOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [queryOpen, setQueryOpen] = useState(false);

  // Load from URL hash on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      try {
        const data = decodeFromUrl(window.location.hash);
        if (data) setInput(data);
      } catch {
        // ignore invalid hash
      }
    }
  }, [setInput]);

  // Initial parse on mount
  useEffect(() => {
    const { inputText } = useAppStore.getState();
    if (inputText && nodes.length === 0) {
      setInput(inputText);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply theme class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('dark', 'light');
    }
  }, [theme]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setCodeGenOpen(false);
      setConvertOpen(false);
      setQueryOpen(false);
    }
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      setCodeGenOpen(true);
    }
    if (e.ctrlKey && e.key === '\\') {
      e.preventDefault();
      useAppStore.getState().toggleEditor();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <ReactFlowProvider>
      <div className="app-container">
        <Toolbar />

        {/* Tools bar */}
        <div className="tools-bar">
          <button className="tools-btn" onClick={() => setCodeGenOpen(true)}>
            {'</>'}  Code Gen
          </button>
          <button className="tools-btn" onClick={() => setConvertOpen(true)}>
            🔄 Convert
          </button>
          <button className="tools-btn" onClick={() => setQueryOpen(!queryOpen)}>
            🔎 Query
          </button>
        </div>

        <div className="main-content">
          <EditorPanel />
          <div className="graph-panel">
            {viewMode === 'graph' ? <GraphCanvas /> : <TreeView />}
          </div>
        </div>

        {/* Truncation banner */}
        {isTruncated && (
          <div className="truncation-banner">
            ⚠ Large data: showing first {totalNodeCount} nodes (capped at {MAX_NODE_COUNT}). The structure is preserved — collapse parent nodes to explore deeper.
          </div>
        )}

        {/* Status bar */}
        <div className="status-bar">
          <span>{isLoading ? '⏳ Parsing…' : `Nodes: ${nodes.length}`}</span>
          {parseError && (
            <span className="status-error">⚠ Parse error</span>
          )}
        </div>

        {/* Modals */}
        <CodeGenModal open={codeGenOpen} onClose={() => setCodeGenOpen(false)} />
        <ConvertModal open={convertOpen} onClose={() => setConvertOpen(false)} />
        <QueryDrawer open={queryOpen} onClose={() => setQueryOpen(false)} />
      </div>
    </ReactFlowProvider>
  );
}
