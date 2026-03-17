import { ASTNode } from '@/types';
import Papa from 'papaparse';
import { buildAST } from './buildAST';

export function parseCSV(text: string): ASTNode {
  const result = Papa.parse(text, { header: true, skipEmptyLines: true });
  return buildAST(result.data, 'root', null, 0);
}
