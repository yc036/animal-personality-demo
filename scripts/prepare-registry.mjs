import fs from 'node:fs';

// Only public password hashes enter the static site. Never read merchant CSVs.
const file='public/access-codes.json';
const configured=process.env.ASSESSMENT_CODE_HASHES??process.env.EDGEONE_ACCESS_CODE_HASHES;
const valid=hashes=>Array.isArray(hashes)&&hashes.length>0&&hashes.every(h=>typeof h==='string'&&/^[a-f0-9]{64}$/.test(h));
if(configured!==undefined){
  const hashes=JSON.parse(configured);
  if(!valid(hashes))throw Error('构建环境中的测评密码哈希必须是非空 SHA-256 数组。');
  fs.mkdirSync('public',{recursive:true});
  fs.writeFileSync(file,JSON.stringify({version:1,hashes:[...new Set(hashes)]}));
}
if(!fs.existsSync(file))throw Error('缺少正式密码库。请设置 ASSESSMENT_CODE_HASHES 或在 public/ 放入有效的 access-codes.json。');
const registry=JSON.parse(fs.readFileSync(file,'utf8'));
if(registry.version!==1||!valid(registry.hashes))throw Error('正式密码库无效，已停止发布。');
console.log(`正式密码库校验通过：${new Set(registry.hashes).size} 个密码哈希。`);
