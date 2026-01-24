## 2025-01-20 - [Yarn Version Mismatch Lockfile Destruction]
**Vulnerability:** Running `yarn install` in a Yarn Berry (v2+) project using a Yarn Classic (v1) binary can silently and destructively rewrite the entire `yarn.lock` file, downgrading it to an incompatible format.
**Learning:** The `yarn.lock` file format differs significantly between Yarn versions. The sandbox environment might default to Yarn Classic (v1), while the repo expects Yarn Berry.
**Prevention:** Always check `package.json` `packageManager` field or `.yarnrc.yml` or existing `yarn.lock` metadata (e.g. `__metadata: version: 8`) before running installation commands. If a mismatch is suspected, avoid running install or explicitly use the correct version/binary.

## 2026-01-24 - [Client-Side CSV Injection via Export]
**Vulnerability:** The application was generating CSV exports by simply joining user-controlled strings with commas. This allowed for Formula Injection (CSV Injection) where malicious input (starting with `=`) could execute code in Excel, and also broke file structure if data contained commas.
**Learning:** Generating CSVs without proper escaping is both a security risk and a functional bug. Client-side generation often overlooks these server-side style sanitation requirements.
**Prevention:** Always use a CSV serialization library or a strict helper function that implements RFC 4180 escaping (quoting) and sanitizes formula triggers (`=`, `+`, `-`, `@`) by prepending a single quote.
