import { ASTNode, ValueType } from '@/types';

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function toRustType(type: ValueType, child?: ASTNode): string {
  const map: Record<ValueType, string> = {
    string: 'String',
    number: 'f64',
    boolean: 'bool',
    null: 'Option<()>',
    object: 'serde_json::Value',
    array: 'Vec<serde_json::Value>',
  };
  if (type === 'object' && child) {
    return capitalize(child.key);
  }
  if (type === 'array' && child && child.children.length > 0) {
    const firstChild = child.children[0];
    if (firstChild.type === 'object') {
      return `Vec<${capitalize(child.key)}Item>`;
    }
    return `Vec<${toRustType(firstChild.type)}>`;
  }
  return map[type];
}

export function generateRust(node: ASTNode, name = 'Root'): string {
  const blocks: string[] = ['use serde::{Deserialize, Serialize};', ''];

  function buildStruct(n: ASTNode, structName: string) {
    if (n.type !== 'object') return;

    const fields = n.children.map(child => {
      const rustType = toRustType(child.type, child);
      return `    pub ${child.key}: ${rustType},`;
    });

    blocks.push(`#[derive(Debug, Deserialize, Serialize)]\npub struct ${structName} {\n${fields.join('\n')}\n}`);

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
    blocks.push(`pub type ${name} = Vec<${name}Item>;`);
  } else {
    buildStruct(node, name);
  }

  return blocks.join('\n\n');
}
