# Architecture

```mermaid
flowchart LR
 Browser --> Worker[Workers router + assets]
 Worker --> D1[(D1: menu and orders)]
 Worker --> R2[(R2: image bytes)]
 Worker --> KV[(KV: display settings)]
 Worker --> DO[Durable Object: CafeRoom]
 DO --> Browser
```

D1 is authoritative for menu and order records. R2 stores binary product images and D1 stores only keys. KV stores the small display document and may be briefly stale. The Durable Object owns connected WebSockets and broadcasts `orders-changed`; clients refetch D1 after receiving it. The stable room name is `main-cafe`.

```mermaid
erDiagram
 MENU_ITEMS ||--o{ ORDERS : contains
 MENU_ITEMS { int id string name int price_cents string image_key boolean active }
 ORDERS { int id int item_id string status datetime created_at }
```

```mermaid
sequenceDiagram
 Customer->>Worker: POST /api/orders
 Worker->>D1: INSERT order
 Worker->>CafeRoom: notify
 CafeRoom-->>Kitchen: orders-changed
 Kitchen->>D1: GET /api/orders
 Kitchen->>Worker: PATCH status
 Worker->>D1: conditional update
 Worker->>CafeRoom: notify
 CafeRoom-->>Customer: orders-changed
```
