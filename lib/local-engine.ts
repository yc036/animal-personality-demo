import {AnswerError,scoreAnswers,questionnaireVersion,type SavedResult} from './assessment';
import {sha256} from './hash';
import {encodeReport} from './sharing';
export class ApiError extends Error{constructor(message:string,public status=400,public data:Record<string,unknown>={}){super(message);}}
type Usage={used:number;hint:string;attemptId?:string};
type Attempt={hash:string;resultId?:string};
type State={v:1;activeHash?:string;usage:Record<string,Usage>;attempts:Record<string,Attempt>;results:Record<string,SavedResult>};
type StorageLike=Pick<Storage,'getItem'|'setItem'>;
const storageKey='animal-static-v1';
const empty=():State=>({v:1,usage:{},attempts:{},results:{}});
export function createLocalEngine(storage:StorageLike,registry:()=>Promise<Set<string>>,randomId:()=>string,now=Date.now){
  function read():State{try{const raw=storage.getItem(storageKey);if(!raw)return empty();const s=JSON.parse(raw);if(s.v!==1||!s.usage||!s.attempts||!s.results)throw Error();return s;}catch{throw new ApiError('本地记录无法读取。请使用正常浏览模式，并允许网站保存数据。');}}
  function save(s:State){try{storage.setItem(storageKey,JSON.stringify(s));}catch{throw new ApiError('浏览器未能保存本地记录，请退出无痕模式或释放存储空间后重试。');}}
  function access(s:State){const hash=s.activeHash,usage=hash?s.usage[hash]:undefined;if(!hash||!usage)throw new ApiError('请先输入测试密码。',401);return {hash,usage};}
  async function handle(path:string,method='GET',input:Record<string,any>={}){
    const s=read();
    if(path==='/api/access'&&method==='POST'){
      const code=typeof input.code==='string'?input.code.trim().toUpperCase():'';
      if(!/^[A-Z0-9-]{6,40}$/.test(code))throw new ApiError('请输入店铺提供的完整测试密码。');
      const hash=sha256(code);if(!(await registry()).has(hash))throw new ApiError('密码不正确或未启用，请核对店铺提供的密码。',403);
      s.activeHash=hash;s.usage[hash]??={used:0,hint:code.slice(-4)};save(s);const usage=s.usage[hash];return {remaining:Math.max(0,3-usage.used),hint:usage.hint};
    }
    if(path.startsWith('/api/results/')&&method==='GET'){
      const id=path.slice('/api/results/'.length),result=Object.hasOwn(s.results,id)?s.results[id]:undefined;
      if(!result)throw new ApiError('此浏览器没有保存这份报告。跨设备查看请使用结果页的“复制结果链接”。',404);
      const a=Object.values(s.attempts).find(a=>a.resultId===id);const own=Boolean(a&&a.hash===s.activeHash);const value={...result,own};if(own&&a)value.remaining=Math.max(0,3-s.usage[a.hash].used);else{delete value.insightContexts;delete value.remaining;}return value;
    }
    const {hash,usage}=access(s);
    if(path==='/api/access'&&method==='GET')return {remaining:Math.max(0,3-usage.used),hint:usage.hint};
    if(path==='/api/attempt/start'&&method==='POST'){
      if(usage.used>=3)throw new ApiError('此密码在当前浏览器的3次测评机会已用完。已有报告仍可保存和分享。',403);
      const previous=usage.attemptId?s.attempts[usage.attemptId]:undefined;
      if(!previous||previous.resultId){usage.attemptId=randomId();s.attempts[usage.attemptId]={hash};save(s);}
      return {attemptId:usage.attemptId!,remaining:3-usage.used,questionnaireVersion};
    }
    if(path==='/api/attempt/submit'&&method==='POST'){
      const id=input.attemptId;if(typeof id!=='string'||!/^[a-f0-9]{32}$/.test(id))throw new ApiError('答题进度不正确，请重新开始。');
      const attempt=Object.hasOwn(s.attempts,id)?s.attempts[id]:undefined;if(!attempt||attempt.hash!==hash)throw new ApiError('请使用本次答题的密码继续。',403);
      if(attempt.resultId)return {resultId:attempt.resultId};
      if(input.questionnaireVersion!==questionnaireVersion)throw new ApiError('题目已更新，请重新开始。未生成报告不计次。',409);
      if(usage.used>=3)throw new ApiError('此密码在当前浏览器的3次测评机会已用完。',403);
      let scored;try{scored=scoreAnswers(input.answers);}catch(e){if(e instanceof AnswerError)throw new ApiError(e.message,400,{questionIds:e.questionIds});throw e;}
      const resultId=randomId();s.results[resultId]={id:resultId,resultKey:scored.resultKey,outer:scored.outer,inner:scored.inner,soft:scored.soft,createdAt:now(),insightIds:scored.insightIds,insightContexts:scored.insightContexts,questionnaireVersion};attempt.resultId=resultId;usage.used++;delete usage.attemptId;save(s);return {resultId};
    }
    throw new ApiError('此功能不在纯静态版本中提供。',404);
  }
  function enrichShared(r:SavedResult){let s:State;try{s=read();}catch{return r;}const own=Object.hasOwn(s.results,r.id)?s.results[r.id]:undefined;if(own&&encodeReport(own)===encodeReport(r)){const a=Object.values(s.attempts).find(a=>a.resultId===r.id);if(a&&a.hash===s.activeHash)return {...own,own:true,remaining:Math.max(0,3-s.usage[a.hash].used)};}return r;}
  return {handle,enrichShared};
}
