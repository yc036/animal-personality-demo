import fs from 'node:fs';

// The registry contains public SHA-256 hashes only. Never read or publish merchant CSVs.
const file='public/access-codes.json';
if(process.env.EDGEONE_ACCESS_CODE_HASHES){
  const hashes=JSON.parse(process.env.EDGEONE_ACCESS_CODE_HASHES);
  if(!Array.isArray(hashes)||hashes.length===0||!hashes.every(h=>typeof h==='string'&&/^[a-f0-9]{64}$/.test(h)))throw Error('EDGEONE_ACCESS_CODE_HASHES 必须是非空 SHA-256 数组。');
  fs.mkdirSync('public',{recursive:true});
  fs.writeFileSync(file,JSON.stringify({version:1,hashes:[...new Set(hashes)]}));
}
if(!fs.existsSync(file))throw Error('缺少 access-codes.json。请使用店主离线工具生成并放入 public/，或在构建环境配置 EDGEONE_ACCESS_CODE_HASHES；不要上传密码 CSV。');
const registry=JSON.parse(fs.readFileSync(file,'utf8'));
if(registry.version!==1||!Array.isArray(registry.hashes)||registry.hashes.length===0||!registry.hashes.every(h=>typeof h==='string'&&/^[a-f0-9]{64}$/.test(h)))throw Error('密码哈希文件无效，已停止部署。');
console.log(`EdgeOne 正式构建：已校验 ${new Set(registry.hashes).size} 个密码哈希；密码明文和店主工具不会进入网站。`);
