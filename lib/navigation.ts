import type {SavedResult} from './assessment';
import {encodeReport} from './sharing';
const siteBase=()=>new URL(import.meta.env.BASE_URL,location.href.split('#')[0]);
export const assetUrl=(path:string)=>new URL(path.replace(/^\//,''),siteBase()).href;
export const homeUrl=()=>`${siteBase().href}#/`;
export const resultUrl=(id:string)=>`${siteBase().href}#/result/${id}`;
export const shareResultUrl=(result:SavedResult)=>`${siteBase().href}#/share/${encodeReport(result)}`;
