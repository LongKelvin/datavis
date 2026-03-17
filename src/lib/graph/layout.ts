import dagre from 'dagre';
import { GraphNode, GraphEdge } from '@/types';

export function applyDagreLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  direction: 'LR' | 'TB' = 'LR'
): GraphNode[] {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: direction, ranksep: 80, nodesep: 40 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach(n => g.setNode(n.id, { width: n.width ?? 180, height: n.height ?? 48 }));
  edges.forEach(e => g.setEdge(e.source, e.target));

  dagre.layout(g);

  return nodes.map(n => {
    const pos = g.node(n.id);
    if (!pos) return n;
    return {
      ...n,
      position: {
        x: pos.x - (n.width ?? 180) / 2,
        y: pos.y - (n.height ?? 48) / 2,
      },
    };
  });
}

export function applyTreeLayout(
  nodes: GraphNode[],
  _edges: GraphEdge[]
): GraphNode[] {
  const nodeWidth = 200;
  const nodeHeight = 48;
  const gapX = 40;
  const gapY = 16;

  return nodes.map((n, index) => ({
    ...n,
    position: {
      x: n.data.depth * (nodeWidth + gapX),
      y: index * (nodeHeight + gapY),
    },
  }));
}
