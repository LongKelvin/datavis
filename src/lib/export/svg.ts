import { GraphNode, GraphEdge } from '@/types';

const TYPE_COLORS: Record<string, string> = {
  object: '#7c69f5',
  array: '#1d9e75',
  string: '#185fa5',
  number: '#ba7517',
  boolean: '#993556',
  null: '#5f5e5a',
};

export function getSvgString(nodes: GraphNode[], edges: GraphEdge[]): string {
  if (nodes.length === 0) return '<svg xmlns="http://www.w3.org/2000/svg"></svg>';

  const padding = 40;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const n of nodes) {
    const w = n.width ?? 180;
    const h = n.height ?? 48;
    minX = Math.min(minX, n.position.x);
    minY = Math.min(minY, n.position.y);
    maxX = Math.max(maxX, n.position.x + w);
    maxY = Math.max(maxY, n.position.y + h);
  }

  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;
  const offsetX = -minX + padding;
  const offsetY = -minY + padding;

  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  const edgesSvg = edges.map(e => {
    const src = nodeMap.get(e.source);
    const tgt = nodeMap.get(e.target);
    if (!src || !tgt) return '';

    const srcW = src.width ?? 180;
    const srcH = src.height ?? 48;
    const tgtH = tgt.height ?? 48;

    const x1 = src.position.x + srcW + offsetX;
    const y1 = src.position.y + srcH / 2 + offsetY;
    const x2 = tgt.position.x + offsetX;
    const y2 = tgt.position.y + tgtH / 2 + offsetY;

    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#888" stroke-width="1.5" />`;
  }).join('\n  ');

  const nodesSvg = nodes.map(n => {
    const w = n.width ?? 180;
    const h = n.height ?? 48;
    const x = n.position.x + offsetX;
    const y = n.position.y + offsetY;
    const color = TYPE_COLORS[n.data.valueType] || '#666';

    return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="white" stroke="${color}" stroke-width="2" />
    <text x="${x + 8}" y="${y + 20}" font-family="monospace" font-size="12" fill="#333">${escapeXml(n.data.label)}</text>
    ${n.data.value ? `<text x="${x + 8}" y="${y + 38}" font-family="monospace" font-size="11" fill="#666">${escapeXml(n.data.value)}</text>` : ''}
  </g>`;
  }).join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="white" />
  ${edgesSvg}
  ${nodesSvg}
</svg>`;
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function exportSvg(nodes: GraphNode[], edges: GraphEdge[]) {
  const svgString = getSvgString(nodes, edges);
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = 'diagram.svg';
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
