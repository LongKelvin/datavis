import { ASTNode } from '@/types';

export function searchNodes(root: ASTNode, query: string): Set<string> {
  const q = query.toLowerCase();
  const matches = new Set<string>();

  function visit(node: ASTNode) {
    const keyMatch = node.key.toLowerCase().includes(q);
    const valMatch = node.value !== null && node.value !== undefined && String(node.value).toLowerCase().includes(q);
    if (keyMatch || valMatch) matches.add(node.id);
    node.children.forEach(visit);
  }

  visit(root);
  return matches;
}
