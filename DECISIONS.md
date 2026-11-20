# NativeRise Decision Log & Notes

> **NOTE FOR OWNER / REVIEWER:**
> All Marathi translation files (`locales/mr/*.json`) and bilingual seed contents were machine-generated and must be reviewed by the owner / native Marathi speaker.

## Technical & Architectural Decisions

1. **Strict Drive & Storage Boundary**: All project code, node_modules, builds, and assets reside strictly on `E:\NativeRise`. All npm package caches and download caches are routed to `D:\DevCache\npm-cache` via project `.npmrc`. No external downloads or installations will ever be written to `C:\` drive without explicit user consent.
2. **MongoDB In-Memory Server**: For integration tests requiring in-memory MongoDB, `MONGOMS_DOWNLOAD_DIR` is routed to `D:\DevCache\mongodb-binaries` or `E:\NativeRise\.cache` so no binaries are downloaded to `C:\`.
3. **Color Theme Fallback**: Used exact hex tokens specified in Section 7.2 for the Fawn color theme (`--nr-cream`, `--nr-surface`, `--nr-ink`, `--nr-line`, `--nr-primary`, `--nr-clay`, `--nr-bark`, etc.).
4. **Google Gen AI SDK**: Used official `@google/genai` package for Node.js using Flash-class models on the free tier per Section 4 and Section 16.
5. **Distance & Routing Caching**: Haversine straight-line distance computed locally; OSRM driving route geometries and distances cached in memory with rounded 4-decimal coordinate keys and 60-minute TTL per Section 11.1.
