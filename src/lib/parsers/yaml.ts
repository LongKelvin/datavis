import { ASTNode } from '@/types';
import yaml from 'js-yaml';
import { buildAST } from './buildAST';

export function parseYAML(text: string): ASTNode {
  const raw = yaml.load(text);
  return buildAST(raw, 'root', null, 0);
}
