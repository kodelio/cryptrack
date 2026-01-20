# Sentinel's Journal

## 2025-01-20 - Prevent API Key Leakage in Query Params
**Vulnerability:** API Key was passed as a query parameter in `server/api/prices.get.ts`. Query parameters are often logged by servers and proxies, exposing secrets.
**Learning:** Even if HTTPS is used, the full URL (including query params) can appear in server logs. Headers are generally encrypted and not logged.
**Prevention:** Always pass sensitive data like API keys in HTTP headers (e.g., `x-cg-demo-api-key`) instead of query strings.
