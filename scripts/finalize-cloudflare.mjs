import fs from 'node:fs';
// Pages interprets this file as deployment configuration, not a customer asset.
fs.writeFileSync('dist/_headers',`/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer

/
  Cache-Control: no-cache

/index.html
  Cache-Control: no-cache

/access-codes.json
  Cache-Control: no-store

/assets/*
  Cache-Control: public, max-age=31536000, immutable
`);
console.log('Cloudflare Pages 缓存和响应规则已写入 dist/_headers。');
