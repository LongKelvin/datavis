'use client';

import {
  ReactFlow,
  Background,
  MiniMap,
  Controls,
  type Node,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAppStore } from '@/store';
import { CustomNode } from './CustomNode';
import { ContextMenu } from './ContextMenu';
import { useState, useCallback } from 'react';
import { useIsDark } from '@/hooks/useIsDark';

const nodeTypes = { custom: CustomNode };

interface ContextMenuState {
  nodeId: string;
  x: number;
  y: number;
}

export function GraphCanvas() {
  const nodes = useAppStore(s => s.nodes);
  const edges = useAppStore(s => s.edges);
  const selectNode = useAppStore(s => s.selectNode);
  const toggleCollapse = useAppStore(s => s.toggleCollapse);
  const isDark = useIsDark();

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    selectNode(node.id);
    setContextMenu(null);
  }, [selectNode]);

  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    const data = node.data as { childCount: number };
    if (data.childCount > 0) toggleCollapse(node.id);
  }, [toggleCollapse]);

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setContextMenu({ nodeId: node.id, x: event.clientX, y: event.clientY });
  }, []);

  const onPaneClick = useCallback(() => {
    setContextMenu(null);
    selectNode(null);
  }, [selectNode]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        fitView
        attributionPosition="bottom-left"
        colorMode={isDark ? 'dark' : 'light'}
      >
        <Background gap={16} size={1} variant={BackgroundVariant.Dots} />
        <MiniMap
          position="bottom-right"
          style={{ borderRadius: 8 }}
        />
        <Controls position="bottom-left" />
      </ReactFlow>

      {contextMenu && (
        <ContextMenu
          nodeId={contextMenu.nodeId}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
