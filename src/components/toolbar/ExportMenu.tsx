'use client';

import { useAppStore } from '@/store';
import { exportImage } from '@/lib/export/image';
import { exportSvg } from '@/lib/export/svg';
import { encodeToUrl } from '@/lib/url';
import { useState, useRef, useEffect } from 'react';

export function ExportMenu() {
  const nodes = useAppStore(s => s.nodes);
  const edges = useAppStore(s => s.edges);
  const inputText = useAppStore(s => s.inputText);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as HTMLElement)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleExportPng = () => { exportImage('png'); setOpen(false); };
  const handleExportJpeg = () => { exportImage('jpeg'); setOpen(false); };
  const handleExportSvg = () => { exportSvg(nodes, edges); setOpen(false); };
  const handleShare = () => {
    try {
      const url = encodeToUrl(inputText);
      navigator.clipboard.writeText(url);
      alert('Share URL copied to clipboard!');
    } catch (err) {
      alert((err as Error).message);
    }
    setOpen(false);
  };

  return (
    <div className="dropdown-wrapper" ref={menuRef}>
      <button className="toolbar-btn" onClick={() => setOpen(!open)} title="Export">
        ⬇ Export
      </button>
      {open && (
        <div className="dropdown-menu">
          <button className="dropdown-item" onClick={handleExportPng}>PNG (2× DPI)</button>
          <button className="dropdown-item" onClick={handleExportJpeg}>JPEG</button>
          <button className="dropdown-item" onClick={handleExportSvg}>SVG</button>
          <div className="dropdown-separator" />
          <button className="dropdown-item" onClick={handleShare}>Share URL (copy)</button>
        </div>
      )}
    </div>
  );
}
