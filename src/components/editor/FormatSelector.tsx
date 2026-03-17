'use client';

import { useAppStore } from '@/store';
import { Format } from '@/types';

const FORMAT_OPTIONS: { value: Format; label: string }[] = [
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'xml', label: 'XML' },
  { value: 'csv', label: 'CSV' },
  { value: 'toml', label: 'TOML' },
];

export function FormatSelector() {
  const format = useAppStore(s => s.format);
  const setFormat = useAppStore(s => s.setFormat);

  return (
    <select
      className="format-selector"
      value={format}
      onChange={(e) => setFormat(e.target.value as Format)}
    >
      {FORMAT_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
