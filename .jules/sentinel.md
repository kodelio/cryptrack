## 2025-01-20 - [Yarn Version Mismatch Lockfile Destruction]
**Vulnerability:** Running `yarn install` in a Yarn Berry (v2+) project using a Yarn Classic (v1) binary can silently and destructively rewrite the entire `yarn.lock` file, downgrading it to an incompatible format.
**Learning:** The `yarn.lock` file format differs significantly between Yarn versions. The sandbox environment might default to Yarn Classic (v1), while the repo expects Yarn Berry.
**Prevention:** Always check `package.json` `packageManager` field or `.yarnrc.yml` or existing `yarn.lock` metadata (e.g. `__metadata: version: 8`) before running installation commands. If a mismatch is suspected, avoid running install or explicitly use the correct version/binary.
