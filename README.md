# DataVis

A privacy-first, browser-based tool that transforms structured data into interactive graph visualizations. Paste JSON, YAML, XML, CSV, or TOML and instantly explore the structure as a zoomable, pannable node graph or collapsible tree — no server, no uploads, everything runs in your browser.

## Features

- **5 input formats** — JSON, YAML, XML, CSV, TOML with auto-detection on paste
- **Graph & Tree views** — hierarchical node graph (dagre layout) or collapsible tree inspector
- **Monaco editor** — syntax highlighting, live validation, 300 ms debounced parse
- **Large-file safe** — iterative AST builder (no stack overflow), 5 000-node display cap, adaptive debounce, Monaco degrades gracefully beyond 200 KB
- **Node search** — highlight matching nodes; non-matching nodes fade
- **Collapse / expand** — click any parent node to hide its subtree
- **Code generation** — TypeScript interfaces, Go structs, Rust serde structs, Python Pydantic models, JSON Schema
- **Format conversion** — JSON ↔ YAML ↔ XML ↔ CSV via a modal editor
- **JSONPath query** — run `$.store.inventory[*].name` style queries and see results inline
- **Export** — PNG (2× DPI), JPEG, SVG, or a compressed share URL (no server)
- **Dark / light / system theme**
- **Embed route** — `/embed` for `<iframe>` usage with URL-encoded data
- **Zero data egress** — everything is local; the `#fragment` in share URLs is never sent to the server

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Graph renderer | @xyflow/react |
| Layout | dagre |
| Editor | @monaco-editor/react |
| State | Zustand |
| Parsers | js-yaml · fast-xml-parser · papaparse |
| Compression | pako |
| Export | html-to-image |
| Query | jsonpath-plus |
| Styling | Tailwind CSS v4 |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/            # Next.js App Router pages & global CSS
├── components/     # UI components (editor, graph, toolbar, modals, drawers)
├── hooks/          # useIsDark (SSR-safe theme hook)
├── lib/
│   ├── parsers/    # buildAST + JSON/YAML/XML/CSV/TOML parsers
│   ├── graph/      # buildGraph, dagre layout, node search
│   ├── codegen/    # TypeScript / Go / Rust / Python / JSON Schema generators
│   ├── export/     # PNG/JPEG/SVG export helpers
│   ├── query/      # JSONPath runner
│   └── url.ts      # pako share-URL encode/decode
├── store/          # Zustand store (parse loop, layout, search)
└── types/          # Shared TypeScript types
```
