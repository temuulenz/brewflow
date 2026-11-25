# Deployment

Do not run these commands until dedicated Cloudflare resources are approved.

```sh
npx wrangler d1 create brewflow-db
npx wrangler r2 bucket create brewflow-menu
npx wrangler kv namespace create CAFE_SETTINGS
# copy returned IDs into wrangler.jsonc
npx wrangler d1 migrations apply brewflow-db --remote
npx wrangler deploy
```

The Worker name is `brewflow-app`; bindings are `DB`, `MENU_IMAGES`, `CAFE_SETTINGS`, `CAFE_ROOM`, and `ASSETS`. Never reuse LiveSpace resources or credentials.
