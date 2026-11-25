import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('project contains all five Cloudflare bindings',()=>{const w=fs.readFileSync('wrangler.jsonc','utf8');for(const x of ['DB','MENU_IMAGES','CAFE_SETTINGS','CAFE_ROOM','ASSETS'])assert.match(w,new RegExp(x));});
test('migration contains durable order lifecycle',()=>{const s=fs.readFileSync('migrations/0001_init.sql','utf8');assert.match(s,/received/);assert.match(s,/preparing/);assert.match(s,/ready/);assert.match(s,/collected/);});
