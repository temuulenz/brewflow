import { CafeRoom } from './cafe-room.js';

const STATUSES = ['received','preparing','ready','collected'];
const DEFAULT_SETTINGS = {shopName:'BrewFlow',announcement:'Fresh beans, thoughtful coffee.',accent:'#7A3E16'};
const json = (data,status=200,headers={}) => Response.json(data,{status,headers:{'Cache-Control':'no-store',...headers}});
const error = (message,status=400) => json({error:message},status);
function validId(value){ const id=Number(value); return Number.isInteger(id)&&id>0?id:null; }
async function body(request){ try { return await request.json(); } catch { return null; } }
async function notify(env,ctx){ try { const id=env.CAFE_ROOM.idFromName('main-cafe'); ctx.waitUntil(env.CAFE_ROOM.get(id).fetch('https://room/notify',{method:'POST'})); } catch {} }
async function api(request,env,ctx){
  const url=new URL(request.url), path=url.pathname;
  if(path==='/api/menu'&&request.method==='GET'){
    const {results}=await env.DB.prepare('SELECT id,name,price_cents,image_key,active FROM menu_items WHERE active=1 ORDER BY id').all();
    return json(results.map(x=>({...x,image_url:x.image_key?`/api/media/${encodeURIComponent(x.image_key)}`:null})));
  }
  if(path==='/api/orders'&&request.method==='GET'){
    const status=url.searchParams.get('status'); const q=status?env.DB.prepare('SELECT o.*,m.name,m.image_key FROM orders o JOIN menu_items m ON m.id=o.item_id WHERE o.status=? ORDER BY o.created_at DESC').bind(status):env.DB.prepare('SELECT o.*,m.name,m.image_key FROM orders o JOIN menu_items m ON m.id=o.item_id ORDER BY o.created_at DESC');
    return json((await q.all()).results);
  }
  if(path==='/api/orders'&&request.method==='POST'){
    const b=await body(request), itemId=validId(b?.item_id); if(!itemId) return error('item_id must be a positive integer');
    const item=await env.DB.prepare('SELECT id FROM menu_items WHERE id=? AND active=1').bind(itemId).first(); if(!item) return error('Menu item is not available',404);
    const result=await env.DB.prepare("INSERT INTO orders(item_id,status) VALUES(?,'received') RETURNING id,item_id,status,created_at").bind(itemId).first(); notify(env,ctx); return json(result,201);
  }
  const orderMatch=path.match(/^\/api\/orders\/(\d+)$/);
  if(orderMatch&&request.method==='GET'){ const id=validId(orderMatch[1]); const row=await env.DB.prepare('SELECT o.*,m.name,m.price_cents,m.image_key FROM orders o JOIN menu_items m ON m.id=o.item_id WHERE o.id=?').bind(id).first(); return row?json(row):error('Order not found',404); }
  if(orderMatch&&request.method==='PATCH'){
    const id=validId(orderMatch[1]), b=await body(request); if(!STATUSES.includes(b?.status)) return error('Invalid status');
    const current=await env.DB.prepare('SELECT status FROM orders WHERE id=?').bind(id).first(); if(!current) return error('Order not found',404);
    if(STATUSES.indexOf(b.status)!==STATUSES.indexOf(current.status)+1) return error('Status must advance one step',409);
    const row=await env.DB.prepare('UPDATE orders SET status=? WHERE id=? AND status=? RETURNING id,item_id,status,created_at').bind(b.status,id,current.status).first(); if(!row) return error('Concurrent update rejected',409); notify(env,ctx); return json(row);
  }
  const imageMatch=path.match(/^\/api\/menu\/(\d+)\/image$/);
  if(imageMatch&&request.method==='PUT'){
    const id=validId(imageMatch[1]), type=request.headers.get('content-type')||''; if(!/^image\/(jpeg|png|webp)$/.test(type)) return error('Only JPEG, PNG, or WebP is accepted');
    const data=await request.arrayBuffer(); if(data.byteLength>5*1024*1024) return error('Image exceeds 5 MB');
    const bytes=new Uint8Array(data), ok=(type==='image/jpeg'&&bytes[0]===255&&bytes[1]===216)||(type==='image/png'&&bytes[0]===137&&bytes[1]===80)||(type==='image/webp'&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'); if(!ok) return error('File content does not match its type');
    const exists=await env.DB.prepare('SELECT id FROM menu_items WHERE id=?').bind(id).first(); if(!exists) return error('Menu item not found',404); const key=`menu/${id}-${Date.now()}.${type.split('/')[1].replace('jpeg','jpg')}`; await env.MENU_IMAGES.put(key,data,{httpMetadata:{contentType:type,cacheControl:'public, max-age=31536000, immutable'}}); await env.DB.prepare('UPDATE menu_items SET image_key=? WHERE id=?').bind(key,id).run(); return json({image_key:key,image_url:`/api/media/${encodeURIComponent(key)}`});
  }
  const media=path.match(/^\/api\/media\/(.+)$/); if(media&&request.method==='GET'){ const key=decodeURIComponent(media[1]); if(!/^menu\/\d+-\d+\.(jpg|png|webp)$/.test(key)) return error('Invalid media key',400); const obj=await env.MENU_IMAGES.get(key); return obj?new Response(obj.body,{headers:{'Content-Type':obj.httpMetadata?.contentType||'application/octet-stream','ETag':obj.httpEtag,'Cache-Control':'public, max-age=31536000, immutable'}}):error('Image not found',404); }
  if(path==='/api/settings'&&request.method==='GET'){ const data=await env.CAFE_SETTINGS.get('display','json'); return json({...DEFAULT_SETTINGS,...(data||{})}); }
  if(path==='/api/settings'&&request.method==='PUT'){ const b=await body(request); if(typeof b?.shopName!=='string'||!b.shopName.trim()||b.shopName.length>80||typeof b.announcement!=='string'||b.announcement.length>240||typeof b.accent!=='string'||!/^#[0-9a-f]{6}$/i.test(b.accent)) return error('Invalid settings'); const value={shopName:b.shopName.trim(),announcement:b.announcement,accent:b.accent}; await env.CAFE_SETTINGS.put('display',JSON.stringify(value)); return json(value); }
  if(path==='/api/live'&&request.method==='GET'&&request.headers.get('Upgrade')==='websocket'){ const id=env.CAFE_ROOM.idFromName('main-cafe'); return env.CAFE_ROOM.get(id).fetch('https://room/connect',{headers:{Upgrade:'websocket'}}); }
  return null;
}
export default {async fetch(request,env,ctx){ if(new URL(request.url).pathname.startsWith('/api/')) return (await api(request,env,ctx))||error('Not found',404); return env.ASSETS.fetch(request); }};
export { CafeRoom };
