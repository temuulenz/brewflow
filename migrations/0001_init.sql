CREATE TABLE IF NOT EXISTS menu_items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, price_cents INTEGER NOT NULL CHECK(price_cents > 0), image_key TEXT, active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)));
CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, item_id INTEGER NOT NULL REFERENCES menu_items(id), status TEXT NOT NULL DEFAULT 'received' CHECK(status IN ('received','preparing','ready','collected')), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);
INSERT OR IGNORE INTO menu_items(id,name,price_cents,image_key,active) VALUES
(1,'Caffè Latte',1450,NULL,1),(2,'Cappuccino',1350,NULL,1),(3,'Americano',1100,NULL,1),(4,'Iced Americano',1250,NULL,1),(5,'Matcha Latte',1650,NULL,1),(6,'Cold Brew',1500,NULL,1);
