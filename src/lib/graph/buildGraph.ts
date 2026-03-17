import { ASTNode, GraphNode, GraphEdge } from '@/types';
import { countDescendants } from '@/lib/parsers/buildAST';

function calculateNodeWidth(key: string, value: string): number {
  const contentLength = Math.max(key.length, value.length);
  const width = contentLength * 8 + 48;
  return Math.max(120, Math.min(320, width));
}

function calculateNodeHeight(value: string): number {
  return value ? 64 : 48;
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '…';
}

function astNodeToGraphNode(
  node: ASTNode,
  collapsedNodes: Set<string>,
  highlightedNodeIds: Set<string> = new Set()
): GraphNode {
  const valueStr = node.value !== null && node.value !== undefined ? truncate(String(node.value), 40) : '';
  const width = calculateNodeWidth(node.key, valueStr);
  const height = calculateNodeHeight(valueStr);
  const isCollapsed = collapsedNodes.has(node.id);
  const descendantCount = countDescendants(node);

  return {
    id: node.id,
    type: 'custom',
    position: { x: 0, y: 0 },
    data: {
      label: node.key,
      value: valueStr,
      valueType: node.type,
      isCollapsed,
      childCount: node.children.length,
      isHighlighted: highlightedNodeIds.has(node.id),
      depth: node.depth,
      descendantCount,
    },
    width,
    height,
  };
}

export function buildGraph(
  ast: ASTNode,
  collapsedNodes: Set<string>,
  highlightedNodeIds: Set<string> = new Set()
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  function visit(node: ASTNode) {
    nodes.push(astNodeToGraphNode(node, collapsedNodes, highlightedNodeIds));

    if (node.parent) {
      edges.push({
        id: `${node.parent}->${node.id}`,
        source: node.parent,
        target: node.id,
        type: 'smoothstep',
      });
    }

    if (!collapsedNodes.has(node.id)) {
      node.children.forEach(visit);
    }
  }

  visit(ast);
  return { nodes, edges };
}
