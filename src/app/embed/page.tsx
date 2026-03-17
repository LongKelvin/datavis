'use client';

import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useAppStore } from '@/store';
import { GraphCanvas } from '@/components/graph/GraphCanvas';
import { decodeFromUrl } from '@/lib/url';

export default function EmbedPage() {
  const setInput = useAppStore(s => s.setInput);
  const nodes = useAppStore(s => s.nodes);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check URL hash for data
      if (window.location.hash) {
        try {
          const data = decodeFromUrl(window.location.hash);
          if (data) setInput(data);
        } catch {
          // ignore
        }
      }

      // Check query params
      const params = new URLSearchParams(window.location.search);
      const format = params.get('format');
      if (format) {
        useAppStore.getState().setFormat(format as 'json' | 'yaml' | 'xml' | 'csv' | 'toml');
      }
    }
  }, [setInput]);

  useEffect(() => {
    const { inputText } = useAppStore.getState();
    if (inputText && nodes.length === 0) {
      setInput(inputText);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ReactFlowProvider>
      <div style={{ width: '100vw', height: '100vh' }}>
        <GraphCanvas />
      </div>
    </ReactFlowProvider>
  );
}
