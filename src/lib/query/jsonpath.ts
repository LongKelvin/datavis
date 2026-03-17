import { JSONPath } from 'jsonpath-plus';

export function runJsonPath(data: object, expression: string): unknown[] {
  return JSONPath({ path: expression, json: data });
}
