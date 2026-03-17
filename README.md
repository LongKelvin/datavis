# DataVis

**Live Demo:** https://datavis-r5fn1mkd6-kelvin-projects.vercel.app/

---

## Overview

DataVis is a privacy-first, browser-based visualization tool designed to transform structured data into interactive graph representations.

It supports multiple input formats and allows users to explore data structures visually using either a graph view or a tree view — all processed entirely in the browser with zero server interaction.

---

## Key Highlights

- No backend processing — all data stays local
- Instant parsing and visualization
- Supports multiple data formats
- Developer-friendly features like code generation and querying
- Designed to handle large datasets safely

---

## Features

### Multi-format Input
Supports automatic detection and parsing of:
- JSON
- YAML
- XML
- CSV
- TOML

### Visualization Modes
- **Graph View** — Interactive node graph using Dagre layout
- **Tree View** — Collapsible hierarchical structure

### Editor Experience
- Monaco Editor integration
- Syntax highlighting
- Real-time validation
- 300ms debounced parsing

### Performance Optimization
- Iterative AST builder (prevents stack overflow)
- Maximum 5,000 nodes rendered
- Adaptive debounce for large inputs
- Graceful degradation for files >200KB

### Data Exploration
- Node search with highlight/fade behavior
- Expand/collapse node subtrees

### Code Generation
Generate models from data:
- TypeScript interfaces
- Go structs
- Rust (Serde)
- Python (Pydantic)
- JSON Schema

### Data Transformation
Convert between formats:
- JSON ↔ YAML ↔ XML ↔ CSV

### Query Support
- JSONPath queries (e.g. `$.store.inventory[*].name`)
- Inline result visualization

### Export Options
- PNG (2x DPI)
- JPEG
- SVG
- Shareable compressed URL (no backend)

### UI/UX
- Dark / Light / System themes
- Fully client-side rendering

### Embedding
- `/embed` route for iframe usage
- URL-encoded data support

### Privacy
- Zero data egress
- Uses URL hash (`#fragment`) for sharing — never sent to server

---

## Tech Stack

| Layer | Technology |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Graph Rendering | @xyflow/react |
| Layout Engine | dagre |
| Editor | Monaco Editor |
| State Management | Zustand |
| Parsing | js-yaml, fast-xml-parser, papaparse |
| Compression | pako |
| Export | html-to-image |
| Query Engine | jsonpath-plus |
| Styling | Tailwind CSS v4 |

---

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open in browser:
http://localhost:3000

---

## Production Build

```bash
npm run build
npm start
```

---

## Project Structure

```
src/
├── app/            # Next.js App Router + global styles
├── components/     # UI components (editor, graph, toolbar, modals)
├── hooks/          # Custom hooks (e.g. theme handling)
├── lib/
│   ├── parsers/    # AST builder + format parsers
│   ├── graph/      # Graph builder + layout logic
│   ├── codegen/    # Code generators
│   ├── export/     # Export utilities
│   ├── query/      # JSONPath engine
│   └── url.ts      # Share URL compression
├── store/          # Zustand state management
└── types/          # Shared TypeScript types
```

---

## Use Cases

- Debugging complex JSON structures
- Visualizing API responses
- Generating type-safe models
- Learning data structures interactively
- Sharing structured data visually without exposing raw files

---

## Notes & Recommendations

- For very large datasets, consider pre-filtering input before visualization
- Graph view can become dense — switch to tree view for deep structures
- JSONPath queries are powerful but can be expensive on large datasets

---

## Future Improvements (Suggestions)

- Virtualized graph rendering for >10k nodes
- Plugin system for custom parsers/codegen
- Save/load workspace state locally
- Diff mode (compare two JSON structures)

---

## License

MIT License — see [LICENSE](LICENSE) for details.

**Copyright (c) 2026 Kelvin Long**

You are free to use, modify, and distribute this software under the MIT license terms.
