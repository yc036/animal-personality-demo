import {animals,reportById,type SavedResult} from './assessment';
import depth from '../data/report-depth.json';
const idPattern=/^[a-f0-9]{32}$/;
export function encodeReport(r:SavedResult){
  // Only derived result data travels in the URL: no password, answers or scene contexts.
  const value=[1,r.id,r.outer,r.inner,r.createdAt,r.soft,(r.insightIds??[]).slice(0,3),r.questionnaireVersion??'story-v3'];
  const bytes=new TextEncoder().encode(JSON.stringify(value));let s='';for(const b of bytes)s+=String.fromCharCode(b);
  return btoa(s).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
}
export function decodeReport(token:string):SavedResult{
  if(token.length>1800||!/^[A-Za-z0-9_-]+$/.test(token))throw Error('分享链接不完整，请让朋友重新复制结果链接。');
  let a:unknown;try{const s=atob(token.replaceAll('-','+').replaceAll('_','/'));a=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(s,c=>c.charCodeAt(0))));}catch{throw Error('分享链接格式不正确，请重新复制。');}
  if(!Array.isArray(a)||a.length!==8||a[0]!==1||typeof a[1]!=='string'||!idPattern.test(a[1])||!animals.some(x=>x.id===a[2])||!animals.some(x=>x.id===a[3])||!Number.isSafeInteger(a[4])||a[4]<=0||a[4]>Date.now()+86400000||typeof a[5]!=='boolean'||!Array.isArray(a[6])||a[6].length>3||!a[6].every((x:unknown)=>typeof x==='string'&&Object.hasOwn(depth.insights,x))||typeof a[7]!=='string'||a[7].length>40)throw Error('分享结果数据不正确，请重新复制结果链接。');
  const resultKey=`${a[2]}__${a[3]}`;reportById(resultKey);
  return {id:a[1],outer:a[2],inner:a[3],resultKey,createdAt:a[4],soft:a[5],insightIds:[...new Set(a[6])] as string[],questionnaireVersion:a[7],own:false};
}
