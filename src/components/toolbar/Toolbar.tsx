'use client';

import { useAppStore } from '@/store';
import { FormatSelector } from '@/components/editor/FormatSelector';
import { ImportButton } from './ImportButton';
import { ExportMenu } from './ExportMenu';
import { SearchBar } from './SearchBar';

export function Toolbar() {
  const theme = useAppStore(s => s.theme);
  const toggleTheme = useAppStore(s => s.toggleTheme);
  const toggleEditor = useAppStore(s => s.toggleEditor);
  const editorVisible = useAppStore(s => s.editorVisible);
  const viewMode = useAppStore(s => s.viewMode);
  const setViewMode = useAppStore(s => s.setViewMode);

  const themeIcon = theme === 'dark' ? '☀️' : theme === 'light' ? '🌙' : '🖥️';

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <div className="toolbar-logo">
          <span className="logo-icon">◆</span>
          <span className="logo-text">DataVis</span>
        </div>
        <FormatSelector />
        <div className="toolbar-separator" />
        <ImportButton />
        <ExportMenu />
      </div>

      <div className="toolbar-center">
        <SearchBar />
      </div>

      <div className="toolbar-right">
        <div className="view-toggle">
          <button
            className={`view-toggle-btn ${viewMode === 'graph' ? 'active' : ''}`}
            onClick={() => setViewMode('graph')}
            title="Graph view"
          >
            Graph
          </button>
          <button
            className={`view-toggle-btn ${viewMode === 'tree' ? 'active' : ''}`}
            onClick={() => setViewMode('tree')}
            title="Tree view"
          >
            Tree
          </button>
        </div>
        <button className="toolbar-btn" onClick={toggleTheme} title="Toggle theme">
          {themeIcon}
        </button>
        <button className="toolbar-btn" onClick={toggleEditor} title="Toggle editor">
          {editorVisible ? '⛶' : '☐'}
        </button>
      </div>
    </div>
  );
}
