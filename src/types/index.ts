// ── Type Definitions ─────────────────────────────────────

export type ValueType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';

export type Format = 'json' | 'yaml' | 'xml' | 'csv' | 'toml';

export interface ASTNode {
  id: string;
  key: string;
  value: unknown;
  type: ValueType;
  children: ASTNode[];
  parent: string | null;
  depth: number;
  path: string;
  arrayIndex?: number;
}

export interface GraphNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    value: string;
    valueType: ValueType;
    isCollapsed: boolean;
    childCount: number;
    isHighlighted: boolean;
    depth: number;
    descendantCount: number;
  };
  width?: number;
  height?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
}

export interface AppState {
  // Input
  inputText: string;
  format: Format;

  // Parsed
  ast: ASTNode | null;
  parseError: string | null;

  // Graph
  nodes: GraphNode[];
  edges: GraphEdge[];
  collapsedNodes: Set<string>;

  // View
  viewMode: 'graph' | 'tree';
  theme: 'light' | 'dark' | 'system';
  editorVisible: boolean;
  editorWidth: number;

  // Interaction
  selectedNodeId: string | null;
  searchQuery: string;
  highlightedNodeIds: Set<string>;

  // Performance / warnings
  isLoading: boolean;
  isTruncated: boolean;
  totalNodeCount: number;
  inputSizeWarning: string | null;

  // Actions
  setInput: (text: string) => void;
  setFormat: (format: Format) => void;
  toggleCollapse: (nodeId: string) => void;
  setSearchQuery: (q: string) => void;
  selectNode: (id: string | null) => void;
  toggleTheme: () => void;
  toggleEditor: () => void;
  setEditorWidth: (w: number) => void;
  setViewMode: (mode: 'graph' | 'tree') => void;
}
