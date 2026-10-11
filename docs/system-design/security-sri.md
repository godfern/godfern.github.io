# Subresource Integrity (SRI)

> Reference: [MDN — Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Subresource_Integrity)

---

## Where it fits in system design

Mention SRI whenever your design loads **third-party resources from a CDN** — scripts, stylesheets, fonts. Common scenarios:

- Loading a UI library from a public CDN (Bootstrap, jQuery, etc.)
- Loading analytics or tracking scripts
- Loading fonts from Google Fonts or similar
- Any `<script src="...">` or `<link rel="stylesheet" href="...">` pointing to an external origin

---

## Why is SRI Important?

CDNs are attractive attack targets. If an attacker compromises a CDN and modifies a JS file your app loads, every visitor runs malicious code in the context of your site — a **supply chain attack**.

Without SRI:
```
CDN serves tampered script → Browser executes it → User's session/data stolen
```

With SRI:
```
CDN serves tampered script → Browser checks hash → Hash mismatch → Script blocked
```

SRI gives you **cryptographic verification** that the file you requested is exactly the file you tested against — no more, no less.

---

## How It Works

1. You generate a cryptographic hash (SHA-256, SHA-384, or SHA-512) of the known-good file content.
2. You embed that hash in the `integrity` attribute of a `<script>` or `<link>` tag.
3. When the browser fetches the resource, it hashes the received bytes and compares against the `integrity` value.
4. If they match → resource is executed. If they don't → browser blocks it and logs a console error.

The `crossorigin="anonymous"` attribute is **required** — it tells the browser to make a CORS request so it can read the response body for hashing.

---

## Code Example

### Script (JavaScript)
```html
<script
  src="https://cdn.example.com/library@3.2.1/lib.min.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossorigin="anonymous"
></script>
```

### Stylesheet (CSS)
```html
<link
  rel="stylesheet"
  href="https://cdn.example.com/bootstrap@5.3.0/bootstrap.min.css"
  integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65"
  crossorigin="anonymous"
/>
```

### Generating the hash yourself (CLI)
```bash
# Download the file and generate a base64-encoded SHA-384 hash
curl -s https://cdn.example.com/library.min.js | openssl dgst -sha384 -binary | openssl base64 -A
# Output → paste this as: sha384-<output>
```

Or use the [SRI Hash Generator](https://www.srihash.org/) online tool.

---

## Key Requirements

| Requirement | Detail |
|-------------|--------|
| **`crossorigin` attribute** | Must be set to `"anonymous"` (or `"use-credentials"`). Without it, the browser can't read the response to hash it. |
| **CORS header on CDN** | The CDN server must respond with `Access-Control-Allow-Origin: *` (or your origin). Most public CDNs do this. |
| **Hash algorithm** | Use `sha384` or `sha512`. `sha256` is supported but weaker. You can supply multiple hashes separated by spaces — browser accepts if any match. |
| **Exact file match** | The hash covers the exact bytes served. Any difference (even whitespace) breaks it — so always hash the exact production file, not a local build. |
| **Lock to a specific version** | SRI only makes sense pinned to a specific version URL. A `@latest` URL defeats the purpose. |

---

## SRI + Content Security Policy (CSP)

SRI and CSP complement each other:

- **CSP** controls *which origins* scripts can be loaded from.
- **SRI** verifies *the content* of what's loaded from those origins.

You can enforce SRI via CSP using the `require-sri-for` directive (limited browser support):

```http
Content-Security-Policy: require-sri-for script style;
```

This makes the browser reject any `<script>` or `<link>` that lacks a valid `integrity` attribute.

---

## Limitations to mention in interviews

| Limitation | Explanation |
|------------|-------------|
| **First-party assets** | SRI doesn't help for your own bundled JS — use CSP + cache busting (content-hashed filenames) instead. |
| **Dynamic scripts** | Scripts injected via `document.createElement('script')` at runtime — harder to apply SRI, needs extra handling. |
| **Maintenance overhead** | Every time the CDN vendor updates the file, you must update the hash. Pin to immutable versioned URLs to reduce churn. |
| **Not a silver bullet** | SRI doesn't protect against XSS, CSRF, or a compromised first-party server. Layer it with CSP and other defences. |

---

## Interview talking points

- SRI is specifically a **supply chain attack** mitigation — name it as such.
- It's most relevant when **loading third-party resources** you don't control.
- For first-party assets built with Vite/Webpack, your content-hashed filenames (`main.a3f2bc.js`) already make tampering detectable — SRI is less critical there.
- Pair with CSP for defence in depth: CSP = allowlist of sources, SRI = verify content of those sources.
