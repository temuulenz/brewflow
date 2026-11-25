# API

All responses are JSON except media and WebSocket upgrades.

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/menu` | Active menu, including media URLs |
| POST | `/api/orders` | Body `{ "item_id": 1 }` |
| GET | `/api/orders` | All orders; optional `?status=ready` |
| GET | `/api/orders/:id` | One order |
| PATCH | `/api/orders/:id` | Body `{ "status": "preparing" }`; one-step transitions only |
| PUT | `/api/menu/:id/image` | JPEG, PNG, or WebP body, max 5 MB |
| GET | `/api/media/:key` | Validated menu image key |
| GET/PUT | `/api/settings` | Display JSON: shopName, announcement, accent |
| GET | `/api/live` | WebSocket; receives `{ "type":"orders-changed" }` |

Errors use `{ "error": "..." }` and appropriate 400, 404, or 409 status codes.
