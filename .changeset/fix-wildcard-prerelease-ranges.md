---
"eslint-plugin-node-dependencies": patch
---

Fix a `compat-engines` crash when dependency ranges combine wildcards and prerelease versions. Preserve explicitly allowed prereleases when combining and parsing ranges.
