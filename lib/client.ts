import {assetUrl} from './navigation';
import {demo} from './mode';
import {createLocalEngine,ApiError} from './local-engine';
export {ApiError};
let knownCodes:Promise<Set<string>>|undefined;
async function registry(){
  if(!knownCodes)knownCodes=fetch(assetUrl('access-codes.json'),{cache:'no-store'}).then(async r=>{if(!r.ok)throw Error();const data=await r.json();if(data.version!==1||!Array.isArray(data.hashes)||!data.hashes.every((v:unknown)=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v)))throw Error();return new Set<string>(data.hashes);}).catch(()=>{knownCodes=undefined;throw new ApiError('密码文件暂未加载成功，请检查网站连接后重试。',503);});
  return knownCodes;
}
const randomId=()=>Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
const storage={getItem:(key:string)=>localStorage.getItem(demo?'demo:'+key:key),setItem:(key:string,value:string)=>localStorage.setItem(demo?'demo:'+key:key,value)};
const engine=createLocalEngine(storage,registry,randomId);
let queue:Promise<unknown>=Promise.resolve();
export async function api<T>(path:string,options:RequestInit={}):Promise<T>{
  let input={};try{if(typeof options.body==='string')input=JSON.parse(options.body);}catch{throw new ApiError('数据格式不正确。');}
  const work=()=>engine.handle(path,options.method??'GET',input);
  if(globalThis.navigator?.locks)return navigator.locks.request('animal-static-state',work) as Promise<T>;
  // On HTTP LAN origins Web Locks may be unavailable: serialize requests within this tab.
  const pending=queue.then(work,work);queue=pending.catch(()=>{});return pending as Promise<T>;
}
export const enrichShared=engine.enrichShared;
export function resetDemo(){if(demo){localStorage.removeItem('demo:animal-static-v1');location.assign(new URL('./',location.href.split('#')[0]).href);}}
