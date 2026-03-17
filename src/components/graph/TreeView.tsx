'use client';

import { ASTNode } from '@/types';
import { useAppStore } from '@/store';

export function TreeView() {
  const ast = useAppStore(s => s.ast);
  const collapsedNodes = useAppStore(s => s.collapsedNodes);
  const toggleCollapse = useAppStore(s => s.toggleCollapse);
  const selectNode = useAppStore(s => s.selectNode);
  const selectedNodeId = useAppStore(s => s.selectedNodeId);
  const highlightedNodeIds = useAppStore(s => s.highlightedNodeIds);
  const searchQuery = useAppStore(s => s.searchQuery);

  if (!ast) {
    return <div className="tree-view-empty">No data to display</div>;
  }

  return (
    <div className="tree-view">
      <TreeNode
        node={ast}
        collapsedNodes={collapsedNodes}
        toggleCollapse={toggleCollapse}
        selectNode={selectNode}
        selectedNodeId={selectedNodeId}
        highlightedNodeIds={highlightedNodeIds}
        searchQuery={searchQuery}
      />
    </div>
  );
}

function TreeNode({
  node,
  collapsedNodes,
  toggleCollapse,
  selectNode,
  selectedNodeId,
  highlightedNodeIds,
  searchQuery,
}: {
  node: ASTNode;
  collapsedNodes: Set<string>;
  toggleCollapse: (id: string) => void;
  selectNode: (id: string | null) => void;
  selectedNodeId: string | null;
  highlightedNodeIds: Set<string>;
  searchQuery: string;
}) {
  const isCollapsed = collapsedNodes.has(node.id);
  const isSelected = selectedNodeId === node.id;
  const isHighlighted = highlightedNodeIds.has(node.id);
  const hasChildren = node.children.length > 0;
  const opacity = searchQuery && !isHighlighted ? 0.3 : 1;

  return (
    <div style={{ marginLeft: node.depth > 0 ? 20 : 0, opacity }}>
      <div
        className={`tree-node ${isSelected ? 'tree-node-selected' : ''} ${isHighlighted ? 'tree-node-highlighted' : ''}`}
        onClick={() => selectNode(node.id)}
      >
        {hasChildren && (
          <button
            className="tree-toggle"
            onClick={(e) => { e.stopPropagation(); toggleCollapse(node.id); }}
          >
            {isCollapsed ? '▶' : '▼'}
          </button>
        )}
        {!hasChildren && <span className="tree-toggle-placeholder" />}

        <span className="tree-key">{node.key}</span>
        <span className={`tree-type type-badge-${node.type}`}>
          {node.type === 'object' ? '{}' : node.type === 'array' ? '[]' : node.type}
        </span>
        {node.value !== null && node.value !== undefined && (
          <span className="tree-value">{String(node.value)}</span>
        )}
      </div>

      {hasChildren && !isCollapsed && (
        <div>
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              collapsedNodes={collapsedNodes}
              toggleCollapse={toggleCollapse}
              selectNode={selectNode}
              selectedNodeId={selectedNodeId}
              highlightedNodeIds={highlightedNodeIds}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}
