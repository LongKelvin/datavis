import { ASTNode } from '@/types';

export function generateJSONSchema(node: ASTNode): object {
  function nodeToSchema(n: ASTNode): Record<string, unknown> {
    if (n.type === 'object') {
      const properties: Record<string, unknown> = {};
      const required: string[] = [];
      n.children.forEach(child => {
        properties[child.key] = nodeToSchema(child);
        required.push(child.key);
      });
      return { type: 'object', properties, required };
    }
    if (n.type === 'array') {
      const firstChild = n.children[0];
      return {
        type: 'array',
        items: firstChild ? nodeToSchema(firstChild) : {},
      };
    }
    return { type: n.type === 'null' ? 'null' : n.type };
  }

  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    ...nodeToSchema(node),
  };
}
