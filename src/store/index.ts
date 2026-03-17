import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AppState, Format } from '@/types';
import { parse } from '@/lib/parsers';
import { buildGraph } from '@/lib/graph/buildGraph';
import { applyDagreLayout, applyTreeLayout } from '@/lib/graph/layout';
import { searchNodes } from '@/lib/graph/search';
import { MAX_INPUT_BYTES, MAX_NODE_COUNT } from '@/lib/parsers/buildAST';

const DEFAULT_JSON = `{
  "store": {
    "name": "Example Store",
    "inventory": [
      { "id": 1, "name": "Widget A", "price": 9.99, "inStock": true },
      { "id": 2, "name": "Widget B", "price": 24.99, "inStock": false }
    ],
    "address": {
      "street": "123 Main St",
      "city": "Singapore",
      "country": "SG"
    }
  }
}`;

let debounceTimer: ReturnType<typeof setTimeout>;

/** Adaptive debounce: larger input → more delay to avoid hammering the main thread */
function getDebounceMs(textLength: number): number {
  if (textLength < 10_000) return 300;
  if (textLength < 100_000) return 600;
  if (textLength < 500_000) return 1000;
  return 1500;
}

function debouncedParse(
  text: string,
  format: Format,
  get: () => AppState,
  set: (partial: Partial<AppState>) => void,
) {
  clearTimeout(debounceTimer);

  // Immediate size check — refuse parsing files that are too huge
  const bytes = new Blob([text]).size;
  if (bytes > MAX_INPUT_BYTES) {
    set({
      parseError: null,
      isLoading: false,
      inputSizeWarning: `File is ${(bytes / 1024 / 1024).toFixed(1)} MB — too large to visualize (limit: ${MAX_INPUT_BYTES / 1024 / 1024} MB). The editor still works but graph rendering is disabled.`,
      nodes: [],
      edges: [],
      ast: null,
    });
    return;
  } else {
    set({ inputSizeWarning: null });
  }

  set({ isLoading: true });

  debounceTimer = setTimeout(() => {
    try {
      const ast = parse(text, format);
      const { collapsedNodes, highlightedNodeIds, viewMode } = get();
      const { nodes, edges } = buildGraph(ast, collapsedNodes, highlightedNodeIds);

      // Count total visible nodes before layout
      const isTruncated = nodes.some(n => n.data.label.startsWith('⚠'));

      // For very large graphs, skip dagre (too slow) and use simple tree layout
      const useSimpleLayout = nodes.length > 1500;
      const layoutFn = (viewMode === 'tree' || useSimpleLayout)
        ? applyTreeLayout
        : applyDagreLayout;

      const layoutNodes = layoutFn(nodes, edges);
      set({
        ast,
        nodes: layoutNodes,
        edges,
        parseError: null,
        isLoading: false,
        isTruncated,
        totalNodeCount: nodes.length,
      });
    } catch (err) {
      set({ parseError: (err as Error).message, nodes: [], edges: [], isLoading: false });
    }
  }, getDebounceMs(text.length));
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // ── Initial state ──────────────────────────────────
      inputText: DEFAULT_JSON,
      format: 'json' as Format,
      ast: null,
      parseError: null,
      nodes: [],
      edges: [],
      collapsedNodes: new Set<string>(),
      viewMode: 'graph' as const,
      theme: 'system' as const,
      editorVisible: true,
      editorWidth: 450,
      selectedNodeId: null,
      searchQuery: '',
      highlightedNodeIds: new Set<string>(),
      isLoading: false,
      isTruncated: false,
      totalNodeCount: 0,
      inputSizeWarning: null,

      // ── Actions ────────────────────────────────────────
      setInput: (text: string) => {
        set({ inputText: text });
        debouncedParse(text, get().format, get, set);
      },

      setFormat: (format: Format) => {
        set({ format });
        debouncedParse(get().inputText, format, get, set);
      },

      toggleCollapse: (nodeId: string) => {
        const collapsed = new Set(get().collapsedNodes);
        if (collapsed.has(nodeId)) {
          collapsed.delete(nodeId);
        } else {
          collapsed.add(nodeId);
        }
        set({ collapsedNodes: collapsed });
        const ast = get().ast;
        if (!ast) return;
        const { highlightedNodeIds, viewMode, nodes: currentNodes } = get();
        const { nodes, edges } = buildGraph(ast, collapsed, highlightedNodeIds);
        const useSimpleLayout = nodes.length > 1500;
        const layoutFn = (viewMode === 'tree' || useSimpleLayout)
          ? applyTreeLayout
          : applyDagreLayout;
        set({ nodes: layoutFn(nodes, edges), edges });
        // suppress unused warning
        void currentNodes;
      },

      setSearchQuery: (q: string) => {
        set({ searchQuery: q });
        const ast = get().ast;
        if (!ast) return;
        const matches = q ? searchNodes(ast, q) : new Set<string>();
        set({ highlightedNodeIds: matches });
        set(state => ({
          nodes: state.nodes.map(n => ({
            ...n,
            data: { ...n.data, isHighlighted: matches.has(n.id) },
          })),
        }));
      },

      selectNode: (id: string | null) => set({ selectedNodeId: id }),

      toggleTheme: () =>
        set(s => {
          const next = s.theme === 'dark' ? 'light' : s.theme === 'light' ? 'system' : 'dark';
          return { theme: next };
        }),

      toggleEditor: () => set(s => ({ editorVisible: !s.editorVisible })),

      setEditorWidth: (w: number) => set({ editorWidth: w }),

      setViewMode: (mode: 'graph' | 'tree') => {
        set({ viewMode: mode });
        const ast = get().ast;
        if (!ast) return;
        const { collapsedNodes, highlightedNodeIds } = get();
        const { nodes, edges } = buildGraph(ast, collapsedNodes, highlightedNodeIds);
        const useSimpleLayout = nodes.length > 1500;
        const layoutFn = (mode === 'tree' || useSimpleLayout)
          ? applyTreeLayout
          : applyDagreLayout;
        set({ nodes: layoutFn(nodes, edges), edges });
      },
    }),
    { name: 'datavis-store' }
  )
);

