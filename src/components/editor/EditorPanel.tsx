'use client';

import { useAppStore } from '@/store';
import { CodeEditor } from './CodeEditor';
import { useCallback, useRef, useState } from 'react';

export function EditorPanel() {
  const editorVisible = useAppStore(s => s.editorVisible);
  const editorWidth = useAppStore(s => s.editorWidth);
  const setEditorWidth = useAppStore(s => s.setEditorWidth);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const onDragStart = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = editorWidth;

    const onDragMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startXRef.current;
      const newWidth = Math.max(250, Math.min(800, startWidthRef.current + delta));
      setEditorWidth(newWidth);
    };

    const onDragEnd = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
    };

    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
  }, [editorWidth, setEditorWidth]);

  if (!editorVisible) return null;

  return (
    <div className="editor-panel" style={{ width: editorWidth, flexShrink: 0 }}>
      <CodeEditor />
      <div
        className={`resize-handle ${isDragging ? 'resize-handle-active' : ''}`}
        onMouseDown={onDragStart}
      />
    </div>
  );
}
