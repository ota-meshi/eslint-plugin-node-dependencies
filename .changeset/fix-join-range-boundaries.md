---
"eslint-plugin-node-dependencies": patch
---

Fix merged version ranges dropping boundary versions (e.g. `^14.17.0` + `>14.17.0 <16` no longer loses `14.17.0`).
