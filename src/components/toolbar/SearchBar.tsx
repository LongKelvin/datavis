'use client';

import { useAppStore } from '@/store';

export function SearchBar() {
  const searchQuery = useAppStore(s => s.searchQuery);
  const setSearchQuery = useAppStore(s => s.setSearchQuery);
  const highlightedNodeIds = useAppStore(s => s.highlightedNodeIds);

  return (
    <div className="search-bar">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        className="search-input"
        placeholder="Search nodes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchQuery && (
        <>
          <span className="search-count">{highlightedNodeIds.size} matches</span>
          <button
            className="search-clear"
            onClick={() => setSearchQuery('')}
            title="Clear search"
          >
            ✕
          </button>
        </>
      )}
    </div>
  );
}
