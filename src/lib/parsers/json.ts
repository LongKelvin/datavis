import { ASTNode } from '@/types';
import { buildAST } from './buildAST';

export function parseJSON(text: string): ASTNode {
  const raw = JSON.parse(text);
  return buildAST(raw, 'root', null, 0);
}
