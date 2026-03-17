import { ASTNode, Format } from '@/types';
import { parseJSON } from './json';
import { parseYAML } from './yaml';
import { parseXML } from './xml';
import { parseCSV } from './csv';
import { parseTOML } from './toml';

const PARSERS: Record<Format, (text: string) => ASTNode> = {
  json: parseJSON,
  yaml: parseYAML,
  xml: parseXML,
  csv: parseCSV,
  toml: parseTOML,
};

export function parse(text: string, format: Format): ASTNode {
  return PARSERS[format](text);
}

export function detectFormat(text: string): Format {
  const trimmed = text.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json';
  if (trimmed.startsWith('<')) return 'xml';
  if (trimmed.includes(',') && trimmed.split('\n')[0].includes(',')) return 'csv';
  // Check for TOML markers
  if (trimmed.includes('[') && trimmed.includes('=') && !trimmed.startsWith('{')) return 'toml';
  // Default to YAML
  return 'yaml';
}
