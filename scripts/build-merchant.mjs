import fs from 'node:fs';import {buildSync}from'esbuild';
const script=buildSync({entryPoints:['merchant/tool.ts'],bundle:true,minify:true,format:'iife',write:false}).outputFiles[0].text.replaceAll('</script','<\\/script');
fs.writeFileSync('merchant/店主离线密码工具.html',fs.readFileSync('merchant/template.html','utf8').replace('/* SCRIPT */',script));
