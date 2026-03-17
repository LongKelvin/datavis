import { ASTNode, ValueType } from '@/types';

export const MAX_NODE_COUNT = 5000;
const MAX_ARRAY_ITEMS_SHOWN = 50; // show first N items of any array
const MAX_DEPTH = 50;             // avoid runaway nesting
export const MAX_INPUT_BYTES = 50 * 1024 * 1024; // 50 MB — above this skip graph, editor still works

export function detectType(value: unknown): ValueType {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  return typeof value as ValueType;
}

/**
 * Iterative (non-recursive) AST builder.
 * Uses an explicit stack so deeply-nested JSON never overflows the call stack.
 * Enforces MAX_NODE_COUNT and MAX_DEPTH.
 * Returns { root, truncated, totalNodes }.
 */
export function buildAST(
  rawValue: unknown,
  key: string,
  parentId: string | null,
  _depth: number,
  _path: string = '$'
): ASTNode {
  const rootId = parentId ? `${parentId}.${key}` : key;
  const rootType = detectType(rawValue);

  // Sentinel root node — filled in by the loop
  const root: ASTNode = {
    id: rootId,
    key,
    value: null,
    type: rootType,
    children: [],
    parent: parentId,
    depth: 0,
    path: '$',
  };

  // Stack items: { node (partially built), rawValue, remaining entries to process }
  type StackItem = {
    node: ASTNode;
    raw: unknown;
    entries: Array<{ k: string; v: unknown; path: string }> | null;
    entryIndex: number;
  };

  let nodeCount = 1;

  // Build top-level node
  function prepareEntries(
    type: ValueType,
    raw: unknown,
    parentPath: string
  ): Array<{ k: string; v: unknown; path: string }> | null {
    if (type === 'object') {
      return Object.entries(raw as Record<string, unknown>).map(([k, v]) => ({
        k,
        v,
        path: `${parentPath}.${k}`,
      }));
    }
    if (type === 'array') {
      const arr = raw as unknown[];
      const shown = arr.length > MAX_ARRAY_ITEMS_SHOWN ? arr.slice(0, MAX_ARRAY_ITEMS_SHOWN) : arr;
      const entries: Array<{ k: string; v: unknown; path: string }> = shown.map((v, i) => ({
        k: String(i),
        v,
        path: `${parentPath}[${i}]`,
      }));
      if (arr.length > MAX_ARRAY_ITEMS_SHOWN) {
        // Push synthetic "...N more" as a placeholder
        entries.push({
          k: `__more__`,
          v: `${arr.length - MAX_ARRAY_ITEMS_SHOWN} more items (${arr.length} total)`,
          path: `${parentPath}[${MAX_ARRAY_ITEMS_SHOWN}+]`,
        });
      }
      return entries;
    }
    return null;
  }

  // Seed the iterative traversal
  const stack: StackItem[] = [
    {
      node: root,
      raw: rawValue,
      entries: prepareEntries(rootType, rawValue, '$'),
      entryIndex: 0,
    },
  ];

  while (stack.length > 0) {
    const top = stack[stack.length - 1];

    if (top.entries === null || top.entryIndex >= top.entries.length) {
      // Done with this node — compute descendant count bottom-up
      let desc = 0;
      for (const c of top.node.children) {
        desc += 1 + (c as ASTNode & { _desc: number })._desc;
      }
      (top.node as ASTNode & { _desc: number })._desc = desc;
      stack.pop();
      continue;
    }

    // Hard cap: stop adding more nodes
    if (nodeCount >= MAX_NODE_COUNT) {
      // Add a single warning leaf and stop this branch
      const remaining = top.entries.length - top.entryIndex;
      if (remaining > 0) {
        const capNode: ASTNode = {
          id: `${top.node.id}.__cap__`,
          key: `⚠ ${remaining} more (display capped at ${MAX_NODE_COUNT} nodes)`,
          value: null,
          type: 'null',
          children: [],
          parent: top.node.id,
          depth: top.node.depth + 1,
          path: top.node.path,
        };
        (capNode as ASTNode & { _desc: number })._desc = 0;
        top.node.children.push(capNode);
      }
      // finish all ancestors
      top.entryIndex = top.entries.length;
      continue;
    }

    const entry = top.entries[top.entryIndex++];
    const childType = detectType(entry.v);
    const childId = `${top.node.id}.${entry.k}`;
    const childDepth = top.node.depth + 1;

    const isPrimitive = childType !== 'object' && childType !== 'array';
    const childValue = isPrimitive ? entry.v : null;

    const child: ASTNode = {
      id: childId,
      key: entry.k,
      value: childValue,
      type: childType,
      children: [],
      parent: top.node.id,
      depth: childDepth,
      path: entry.path,
    };

    top.node.children.push(child);
    nodeCount++;

    if (!isPrimitive && childDepth < MAX_DEPTH) {
      stack.push({
        node: child,
        raw: entry.v,
        entries: prepareEntries(childType, entry.v, entry.path),
        entryIndex: 0,
      });
    } else {
      (child as ASTNode & { _desc: number })._desc = 0;
    }
  }

  return root;
}

/** Read pre-computed descendant count (set during buildAST). O(1). */
export function countDescendants(node: ASTNode): number {
  return (node as ASTNode & { _desc?: number })._desc ?? 0;
}

/** Reconstruct a plain JS value from an ASTNode tree. */
export function astToObject(node: ASTNode): unknown {
  if (node.type === 'object') {
    const obj: Record<string, unknown> = {};
    for (const child of node.children) {
      if (!child.id.endsWith('.__cap__') && !child.id.endsWith('.__more__')) {
        obj[child.key] = astToObject(child);
      }
    }
    return obj;
  }

  if (node.type === 'array') {
    return node.children
      .filter(c => !c.id.endsWith('.__cap__') && c.key !== '__more__')
      .map(child => astToObject(child));
  }

  return node.value;
}
