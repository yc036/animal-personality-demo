import fs from 'node:fs';
// Direct uploads only include dist. Put the response rules inside that upload.
const {headers}=JSON.parse(fs.readFileSync('edgeone.json','utf8'));
fs.writeFileSync('dist/edgeone.json',JSON.stringify({headers},null,2));
console.log('EdgeOne 静态响应规则已写入 dist/edgeone.json。');
