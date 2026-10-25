import fs from 'node:fs';import crypto from 'node:crypto';
const count=Number(process.argv[2]??100);if(!Number.isInteger(count)||count<1||count>10000)throw Error('数量应为1至10000');
const file='public/access-codes.json',registry=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{version:1,hashes:[]};
const alphabet='23456789ABCDEFGHJKMNPQRSTUVWXYZ',codes=[];
while(codes.length<count){let text='';while(text.length<10){for(const n of crypto.randomBytes(24)){if(n<Math.floor(256/alphabet.length)*alphabet.length)text+=alphabet[n%alphabet.length];if(text.length===10)break;}}const code=`AN-${text.slice(0,5)}-${text.slice(5)}`,hash=crypto.createHash('sha256').update(code).digest('hex');if(!registry.hashes.includes(hash)){registry.hashes.push(hash);codes.push(code);}}
fs.mkdirSync('private',{recursive:true});const filename=`private/测评密码-${Date.now()}.csv`;fs.writeFileSync(filename,'\ufeff测试密码,本浏览器次数\r\n'+codes.map(c=>c+',3').join('\r\n'),{mode:0o600});fs.writeFileSync(file,JSON.stringify(registry));
console.log(JSON.stringify({generated:count,totalEnabled:registry.hashes.length,csv:filename,publicRegistry:file}));
