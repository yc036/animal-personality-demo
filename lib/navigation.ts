import type {SavedResult} from './assessment';
import {encodeReport} from './sharing';
import {siteUrl} from './site-url';
const siteBase=()=>siteUrl(import.meta.env.BASE_URL,location.href.split('#')[0]);
export const assetUrl=(path:string)=>{const base=siteBase(),url=new URL(path.replace(/^\//,''),base);url.search=base.search;return url.href;};
export const homeUrl=()=>`${siteBase().href}#/`;
export const resultUrl=(id:string)=>`${siteBase().href}#/result/${id}`;
export const shareResultUrl=(result:SavedResult)=>`${siteBase().href}#/share/${encodeReport(result)}`;
