import { ASTNode, ValueType } from '@/types';

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function toGoType(type: ValueType, child?: ASTNode): string {
  const map: Record<ValueType, string> = {
    string: 'string',
    number: 'float64',
    boolean: 'bool',
    null: 'interface{}',
    object: 'interface{}',
    array: '[]interface{}',
  };
  if (type === 'object' && child) {
    return capitalize(child.key);
  }
  if (type === 'array' && child && child.children.length > 0) {
    const firstChild = child.children[0];
    if (firstChild.type === 'object') {
      return `[]${capitalize(child.key)}Item`;
    }
    return `[]${toGoType(firstChild.type)}`;
  }
  return map[type];
}

export function generateGolang(node: ASTNode, name = 'Root'): string {
  const blocks: string[] = [];

  function buildStruct(n: ASTNode, structName: string) {
    if (n.type !== 'object') return;

    const fields = n.children.map(child => {
      const goType = toGoType(child.type, child);
      const fieldName = capitalize(child.key);
      return `\t${fieldName} ${goType} \`json:"${child.key}"\``;
    });

    blocks.push(`type ${structName} struct {\n${fields.join('\n')}\n}`);

    for (const child of n.children) {
      if (child.type === 'object') {
        buildStruct(child, capitalize(child.key));
      }
      if (child.type === 'array' && child.children.length > 0 && child.children[0].type === 'object') {
        buildStruct(child.children[0], `${capitalize(child.key)}Item`);
      }
    }
  }

  if (node.type === 'array' && node.children.length > 0 && node.children[0].type === 'object') {
    buildStruct(node.children[0], `${name}Item`);
    blocks.unshift(`type ${name} []${name}Item`);
  } else {
    buildStruct(node, name);
  }

  return `package main\n\n${blocks.join('\n\n')}`;
}
