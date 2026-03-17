'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ValueType } from '@/types';
import { useAppStore } from '@/store';

interface CustomNodeData {
  label: string;
  value: string;
  valueType: ValueType;
  isCollapsed: boolean;
  childCount: number;
  isHighlighted: boolean;
  depth: number;
  descendantCount: number;
  [key: string]: unknown;
}

const TYPE_COLORS: Record<ValueType, string> = {
  object: '#7c69f5',
  array: '#1d9e75',
  string: '#185fa5',
  number: '#ba7517',
  boolean: '#993556',
  null: '#5f5e5a',
};

const TYPE_BADGES: Record<ValueType, string> = {
  object: '{}',
  array: '[]',
  string: 'str',
  number: 'num',
  boolean: 'bool',
  null: 'null',
};

export function CustomNode({ data, id }: NodeProps) {
  const d = data as CustomNodeData;
  const { label, value, valueType, isCollapsed, childCount, isHighlighted, descendantCount } = d;
  const toggleCollapse = useAppStore(s => s.toggleCollapse);
  const searchQuery = useAppStore(s => s.searchQuery);

  const accentColor = TYPE_COLORS[valueType];
  const opacity = searchQuery && !isHighlighted ? 0.25 : 1;

  return (
    <div
      className="custom-node"
      style={{
        borderColor: accentColor,
        borderWidth: 2,
        borderStyle: 'solid',
        borderRadius: 8,
        background: isHighlighted ? `${accentColor}18` : 'var(--node-bg)',
        padding: '6px 10px',
        minWidth: 120,
        maxWidth: 320,
        opacity,
        boxShadow: isHighlighted ? `0 0 8px ${accentColor}66` : '0 1px 3px rgba(0,0,0,0.12)',
        transition: 'opacity 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        fontSize: 12,
        fontFamily: 'var(--font-geist-mono), monospace',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: accentColor }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontWeight: 600, color: 'var(--foreground)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </span>
        <span
          style={{
            fontSize: 10,
            padding: '1px 5px',
            borderRadius: 4,
            background: `${accentColor}22`,
            color: accentColor,
            fontWeight: 700,
          }}
        >
          {TYPE_BADGES[valueType]}
        </span>
        {childCount > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); toggleCollapse(id); }}
            style={{
              border: 'none',
              background: 'var(--node-collapse-bg)',
              color: 'var(--foreground)',
              borderRadius: 4,
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 14,
              lineHeight: 1,
            }}
            aria-label={isCollapsed ? 'expand' : 'collapse'}
          >
            {isCollapsed ? '+' : '−'}
          </button>
        )}
      </div>

      {value && (
        <div style={{ color: 'var(--node-value-color)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value}
        </div>
      )}

      {isCollapsed && descendantCount > 0 && (
        <div style={{ color: accentColor, fontSize: 10, marginTop: 2 }}>
          ({descendantCount} hidden)
        </div>
      )}

      <Handle type="source" position={Position.Right} style={{ background: accentColor }} />
    </div>
  );
}
