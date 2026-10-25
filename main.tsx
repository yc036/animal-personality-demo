import {useEffect,useState} from 'react';import {createRoot} from 'react-dom/client';
import AssessmentSite from './components/assessment-site';import {decodeReport} from './lib/sharing';import {enrichShared} from './lib/client';
import './styles/site.css';import './styles/journey.css';
function App(){
 const [route,setRoute]=useState(location.hash.slice(1)||'/');useEffect(()=>{const change=()=>setRoute(location.hash.slice(1)||'/');window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change);},[]);
 const result=route.match(/^\/result\/([a-f0-9]{32})$/),share=route.match(/^\/share\/([A-Za-z0-9_-]+)$/),start=route.match(/^\/start\/([A-Za-z0-9-]{6,40})$/);
 if(share){try{return <AssessmentSite key={share[1]} sharedReport={enrichShared(decodeReport(share[1]))}/>;}catch(e){return <main className="empty-state"><h1>分享链接暂时无法打开</h1><p>{(e as Error).message}</p><a className="button primary" href="#/">返回首页</a></main>;}}
 if(route.startsWith('/result/')&&!result||route.startsWith('/share/')&&!share)return <main className="empty-state"><h1>结果链接不完整</h1><a href="#/">返回首页</a></main>;
 if(route==='/admin')return <main className="admin-main"><h1>纯静态版无需在线管理后台</h1><p>请使用交付包中的店主离线工具生成密码，再上传更新后的 access-codes.json。网站不会保存全店使用统计。</p><a className="button primary" href="#/">返回首页</a></main>;
 return <AssessmentSite key={result?.[1]||start?.[1]||'home'} resultId={result?.[1]} initialCode={start?.[1]}/>;
}
createRoot(document.getElementById('root')!).render(<App/>);
