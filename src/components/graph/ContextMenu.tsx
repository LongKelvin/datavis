'use client';

import { useAppStore } from '@/store';
import { useCallback, useEffect, useRef } from 'react';

interface ContextMenuProps {
  nodeId: string;
  x: number;
  y: number;
  onClose: () => void;
}

export function ContextMenu({ nodeId, x, y, onClose }: ContextMenuProps) {
  const ast = useAppStore(s => s.ast);
  const toggleCollapse = useAppStore(s => s.toggleCollapse);
  const setSearchQuery = useAppStore(s => s.setSearchQuery);
  const menuRef = useRef<HTMLDivElement>(null);

  // Find the AST node to get its path/value
  const findNode = useCallback((node: typeof ast, targetId: string): typeof ast | null => {
    if (!node) return null;
    if (node.id === targetId) return node;
    for (const child of node.children) {
      const found = findNode(child, targetId);
      if (found) return found;
    }
    return null;
  }, []);

  const targetNode = ast ? findNode(ast, nodeId) : null;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as HTMLElement)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const copyValue = useCallback(() => {
    if (targetNode?.value !== null && targetNode?.value !== undefined) {
      navigator.clipboard.writeText(String(targetNode.value));
    }
    onClose();
  }, [targetNode, onClose]);

  const copyPath = useCallback(() => {
    if (targetNode) {
      navigator.clipboard.writeText(targetNode.path);
    }
    onClose();
  }, [targetNode, onClose]);

  const expandAll = useCallback(() => {
    // Toggle this node to expand
    toggleCollapse(nodeId);
    onClose();
  }, [toggleCollapse, nodeId, onClose]);

  const searchValue = useCallback(() => {
    if (targetNode?.value !== null && targetNode?.value !== undefined) {
      setSearchQuery(String(targetNode.value));
    }
    onClose();
  }, [targetNode, setSearchQuery, onClose]);

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        position: 'fixed',
        left: x,
        top: y,
        zIndex: 1000,
        background: 'var(--node-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: 8,
        padding: '4px 0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        minWidth: 180,
        fontSize: 13,
      }}
    >
      <button className="context-menu-item" onClick={copyValue}>
        Copy value
      </button>
      <button className="context-menu-item" onClick={copyPath}>
        Copy path ({targetNode?.path ?? ''})
      </button>
      <div className="context-menu-separator" />
      <button className="context-menu-item" onClick={expandAll}>
        Expand / Collapse
      </button>
      <div className="context-menu-separator" />
      <button className="context-menu-item" onClick={searchValue}>
        Search for this value
      </button>
    </div>
  );
}
