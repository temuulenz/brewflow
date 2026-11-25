# BrewFlow

BrewFlow is a small Cloudflare coffee ordering assignment: one café, one item per order, customer and kitchen screens, and a four-step order lifecycle.

## Local development

```sh
npm install
npx wrangler d1 migrations apply brewflow-db --local
npm run dev
```

Open `http://localhost:8787/` and `http://localhost:8787/kitchen.html`. Local Wrangler provides D1, R2, KV, and Durable Object bindings. Remote IDs in `wrangler.jsonc` are intentionally placeholders; no remote resources or deployment have been created.

## Tests

`npm run check` performs syntax checks. The API is designed for Wrangler local integration tests: create an order, reload either page, upload a real JPEG/PNG/WebP to the kitchen image route, update settings, and use two browser tabs to verify WebSocket refreshes. Currency display uses a simple assignment convention of `price_cents × 10` MNT; the stored integer remains the PDF-compatible price field.

## Scope and limitations

There is no authentication, payment, inventory, multi-store support, cart, or analytics. Kitchen/admin routes must not be exposed publicly without access control. KV settings are eventually consistent and never hold order truth. A failed Durable Object notification does not roll back a successful D1 write.

## Remote deployment (approval required)

After explicit approval, create dedicated resources with `wrangler d1 create brewflow-db`, `wrangler r2 bucket create brewflow-menu`, and `wrangler kv namespace create CAFE_SETTINGS`; replace only the placeholder IDs, apply `npx wrangler d1 migrations apply brewflow-db --remote`, then run `npx wrangler deploy`.
