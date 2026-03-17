import { ASTNode } from '@/types';
import { buildAST } from './buildAST';

// Simple TOML parser - handles basic key-value pairs, tables, and arrays
export function parseTOML(text: string): ASTNode {
  const raw = parseTOMLString(text);
  return buildAST(raw, 'root', null, 0);
}

function parseTOMLString(text: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let currentSection = result;
  const lines = text.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Skip empty lines and comments
    if (!line || line.startsWith('#')) continue;

    // Table header [section]
    const tableMatch = line.match(/^\[([^\]]+)\]$/);
    if (tableMatch) {
      const keys = tableMatch[1].split('.').map(k => k.trim());
      currentSection = result;
      for (const key of keys) {
        if (!(key in currentSection) || typeof currentSection[key] !== 'object') {
          (currentSection as Record<string, unknown>)[key] = {};
        }
        currentSection = (currentSection as Record<string, unknown>)[key] as Record<string, unknown>;
      }
      continue;
    }

    // Array of tables [[section]]
    const arrayTableMatch = line.match(/^\[\[([^\]]+)\]\]$/);
    if (arrayTableMatch) {
      const keys = arrayTableMatch[1].split('.').map(k => k.trim());
      let target: Record<string, unknown> = result;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in target)) {
          target[keys[i]] = {};
        }
        target = target[keys[i]] as Record<string, unknown>;
      }
      const lastKey = keys[keys.length - 1];
      if (!Array.isArray(target[lastKey])) {
        target[lastKey] = [];
      }
      const newObj: Record<string, unknown> = {};
      (target[lastKey] as unknown[]).push(newObj);
      currentSection = newObj;
      continue;
    }

    // Key-value pair
    const kvMatch = line.match(/^([^=]+?)\s*=\s*(.+)$/);
    if (kvMatch) {
      const key = kvMatch[1].trim();
      const value = parseTOMLValue(kvMatch[2].trim());
      (currentSection as Record<string, unknown>)[key] = value;
    }
  }

  return result;
}

function parseTOMLValue(value: string): unknown {
  // String (double or single quoted)
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  // Boolean
  if (value === 'true') return true;
  if (value === 'false') return false;
  // Integer
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  // Float
  if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);
  // Inline array
  if (value.startsWith('[') && value.endsWith(']')) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map(v => parseTOMLValue(v.trim()));
  }
  // Date/datetime
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value;
  // Default: string
  return value;
}
