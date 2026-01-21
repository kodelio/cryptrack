# Sentinel's Journal

## 2025-01-20 - API Key Leakage in Query Parameters
**Vulnerability:** The CoinGecko API key was being sent as a query parameter (`x_cg_demo_api_key`) in the server-side API call.
**Learning:** Even server-side calls can leak secrets if they are put in the URL (query parameters), as these are often logged by intermediate proxies, firewalls, or the destination server's access logs.
**Prevention:** Always send secrets (API keys, tokens) in HTTP headers (e.g., `x-cg-demo-api-key` header) rather than query parameters.
