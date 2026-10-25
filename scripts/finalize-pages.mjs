import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const files=[];
function scan(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.isDirectory())scan(file);else files.push(file.replaceAll('\\','/'));}}
scan('dist');
if(files.some(file=>!/^dist\/(?:index\.html|access-codes\.json|\.nojekyll|assets\/[^/]+\.(?:js|css)|animals\/[^/]+\.svg)$/.test(file)))throw Error('网站产物包含非预期文件，已停止发布。');
const registry=JSON.parse(fs.readFileSync('dist/access-codes.json','utf8'));
const demoHash=crypto.createHash('sha256').update('DEMO-2026').digest('hex');
if(!registry.hashes?.length||registry.hashes.includes(demoHash))throw Error('正式版不能发布演示密码库。');
const js=files.filter(f=>f.endsWith('.js')).map(f=>fs.readFileSync(f,'utf8')).join('');
if(/功能测试演示|重置演示次数|supabase\.co|animal-mirror-yc\.netlify\.app/.test(js))throw Error('正式产物仍含演示入口或旧后端依赖。');
fs.writeFileSync('dist/.nojekyll','');
console.log(`GitHub Pages 正式产物校验通过：${files.length} 个网站文件，不含密码明文、店主 CSV 或登录凭据。`);
