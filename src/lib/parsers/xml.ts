import { ASTNode } from '@/types';
import { XMLParser } from 'fast-xml-parser';
import { buildAST } from './buildAST';

export function parseXML(text: string): ASTNode {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const raw = parser.parse(text);
  return buildAST(raw, 'root', null, 0);
}
