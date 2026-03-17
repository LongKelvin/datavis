import { ASTNode, ValueType } from '@/types';

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function toTsType(type: ValueType): string {
  const map: Record<ValueType, string> = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    null: 'null',
    object: 'Record<string, unknown>',
    array: 'unknown[]',
  };
  return map[type];
}

function resolveChildType(child: ASTNode, parentName: string): string {
  if (child.type === 'object') {
    return capitalize(child.key);
  }
  if (child.type === 'array') {
    if (child.children.length > 0) {
      const firstChild = child.children[0];
      if (firstChild.type === 'object') {
        return `${capitalize(child.key)}Item[]`;
      }
      return `${toTsType(firstChild.type)}[]`;
    }
    return 'unknown[]';
  }
  return toTsType(child.type);
}

export function generateTypeScript(node: ASTNode, name = 'Root'): string {
  const blocks: string[] = [];

  function buildInterface(n: ASTNode, interfaceName: string) {
    if (n.type === 'object') {
      const fields = n.children.map(child => {
        const childType = resolveChildType(child, interfaceName);
        return `  ${child.key}: ${childType};`;
      });
      blocks.push(`export interface ${interfaceName} {\n${fields.join('\n')}\n}`);

      // Recurse into child objects
      for (const child of n.children) {
        if (child.type === 'object') {
          buildInterface(child, capitalize(child.key));
        }
        if (child.type === 'array' && child.children.length > 0 && child.children[0].type === 'object') {
          buildInterface(child.children[0], `${capitalize(child.key)}Item`);
        }
      }
    }
  }

  if (node.type !== 'object' && node.type !== 'array') {
    return `export type ${name} = ${toTsType(node.type)};`;
  }

  if (node.type === 'array') {
    if (node.children.length > 0 && node.children[0].type === 'object') {
      buildInterface(node.children[0], `${name}Item`);
      blocks.unshift(`export type ${name} = ${name}Item[];`);
    } else {
      return `export type ${name} = ${toTsType(node.children[0]?.type ?? 'null')}[];`;
    }
  } else {
    buildInterface(node, name);
  }

  return blocks.join('\n\n');
}
