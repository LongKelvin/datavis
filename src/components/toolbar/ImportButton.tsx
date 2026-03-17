'use client';

import { useAppStore } from '@/store';
import { useCallback, useRef } from 'react';
import { detectFormat } from '@/lib/parsers';

export function ImportButton() {
  const setInput = useAppStore(s => s.setInput);
  const setFormat = useAppStore(s => s.setFormat);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const format = detectFormat(text);
      setFormat(format);
      setInput(text);
    };
    reader.readAsText(file);

    // Reset input so same file can be imported again
    e.target.value = '';
  }, [setInput, setFormat]);

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".json,.yaml,.yml,.xml,.csv,.toml,.txt"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <button className="toolbar-btn" onClick={handleImport} title="Import file">
        ⬆ Import
      </button>
    </>
  );
}
