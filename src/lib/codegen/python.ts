import { ASTNode, ValueType } from '@/types';

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function toPythonType(type: ValueType, child?: ASTNode): string {
  const map: Record<ValueType, string> = {
    string: 'str',
    number: 'float',
    boolean: 'bool',
    null: 'None',
    object: 'dict',
    array: 'list',
  };
  if (type === 'object' && child) {
    return capitalize(child.key);
  }
  if (type === 'array' && child && child.children.length > 0) {
    const firstChild = child.children[0];
    if (firstChild.type === 'object') {
      return `list[${capitalize(child.key)}Item]`;
    }
    return `list[${toPythonType(firstChild.type)}]`;
  }
  return map[type];
}

export function generatePython(node: ASTNode, name = 'Root'): string {
  const blocks: string[] = ['from pydantic import BaseModel', ''];

  function buildModel(n: ASTNode, modelName: string) {
    if (n.type !== 'object') return;

    // Build child models first (forward references)
    for (const child of n.children) {
      if (child.type === 'object') {
        buildModel(child, capitalize(child.key));
      }
      if (child.type === 'array' && child.children.length > 0 && child.children[0].type === 'object') {
        buildModel(child.children[0], `${capitalize(child.key)}Item`);
      }
    }

    const fields = n.children.map(child => {
      const pyType = toPythonType(child.type, child);
      return `    ${child.key}: ${pyType}`;
    });

    blocks.push(`\nclass ${modelName}(BaseModel):\n${fields.join('\n')}`);
  }

  if (node.type === 'array' && node.children.length > 0 && node.children[0].type === 'object') {
    buildModel(node.children[0], `${name}Item`);
    blocks.push(`\n${name} = list[${name}Item]`);
  } else {
    buildModel(node, name);
  }

  return blocks.join('\n');
}
