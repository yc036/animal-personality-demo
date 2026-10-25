import fs from 'node:fs';import crypto from 'node:crypto';
// A public test password only. Real delivery codes are never deployed to the demo.
fs.writeFileSync('dist/access-codes.json',JSON.stringify({version:1,hashes:[crypto.createHash('sha256').update('DEMO-2026').digest('hex')]}));
fs.writeFileSync('dist/.nojekyll','');
const html=fs.readFileSync('dist/index.html','utf8').replace('<title>反差动物人格 · 发现你的另一面</title>','<title>反差动物人格 · 功能测试演示</title>');fs.writeFileSync('dist/index.html',html);
