# BrewFlow тайлан

## Даалгаврын зорилго
Cloudflare-ийн таван үйлчилгээг ашиглан нэг кафены захиалгыг бодит хугацаанд боловсруулах.

## Системийн танилцуулга
Хэрэглэгч цэснээс нэг бүтээгдэхүүн сонгож захиална. Гал тогооны дэлгэц захиалгыг `received → preparing → ready → collected` дарааллаар ахиулна.

## Ашигласан технологиуд
Workers нь routing ба validation, D1 нь menu/order-ийн үнэн зөв эх сурвалж, R2 нь зураг, KV нь дэлгэцийн тохиргоо, Durable Object нь WebSocket мэдэгдэлд ашиглагдсан.

## Архитектур ба өгөгдлийн сан
Дэлгэрэнгүй flow, ER диаграмм, schema-г `ARCHITECTURE.md`-д үзүүлсэн. `menu_items` болон `orders` хүснэгтүүдтэй; захиалгын төлөвийг D1 хадгална.

## API ба хэрэгжүүлэлт
Бүх endpoint-ийг `API.md`-д баримтжуулсан. Prepared statements, ID/body validation, conditional status update, upload MIME/content/size validation хэрэгжсэн.

## Realtime ажиллагаа
D1 амжилттай бичигдсэний дараа `main-cafe` Durable Object-д мэдэгдэж, холбогдсон клиентүүд `orders-changed` авч D1-ээс шинэчилнэ. Мэдэгдэл амжилтгүй болсон ч хадгалсан захиалга устахгүй.

## Туршилтын үр дүн
`npm run check`-ийн syntax checks-ийг ажиллуулж баталгаажуулна. Wrangler local integration болон хоёр tab-ийн realtime нотолгоог орчны хамааралтай тул энд зохиомлоор тайлагнаагүй.

## Хязгаарлалт ба дүгнэлт
Authentication, payment, inventory, multi-store, cart байхгүй. Production-ready гэж үзэхгүй; remote deployment хийхийн өмнө тусгай access control шаардлагатай.
