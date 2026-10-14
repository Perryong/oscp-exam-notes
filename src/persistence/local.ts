import {openDB,type DBSchema} from 'idb';
import type {Draft,EntityKind,ImageRecord,LocalWriteResult,Saved} from '../notebook/model';
type Row={uid:string;draft:Draft<unknown>;pending:boolean};
interface Store extends DBSchema{
 drafts:{key:string;value:Row}; conflicts:{key:string;value:Row};
 saved:{key:string;value:{uid:string;kind:EntityKind;value:Saved<unknown>}};
 images:{key:string;value:{uid:string;image:ImageRecord}};
 meta:{key:string;value:{uid:string;value:unknown}};
}
const db=()=>openDB<Store>('oscp-fieldnotes',1,{upgrade(d){for(const s of ['drafts','conflicts','saved','images','meta'] as const)d.createObjectStore(s)}});
const key=(...parts:string[])=>JSON.stringify(parts);
export function announce(){if(typeof window!=='undefined')window.dispatchEvent(new Event('notebook-change'))}
export async function saveDraft<T>(input:Draft<T>,expectedLocalRevision:number):Promise<LocalWriteResult<T>>{
 const d=await db(),tx=d.transaction(['drafts','conflicts'],'readwrite'),k=key(input.uid,input.kind,input.id);
 const current=await tx.objectStore('drafts').get(k);
 if((current?.draft.localRevision||0)!==expectedLocalRevision){
  const conflict={...input,mutationId:crypto.randomUUID()};
  await tx.objectStore('conflicts').put({uid:input.uid,draft:conflict,pending:true},key(input.uid,conflict.mutationId));await tx.done;d.close();announce();return{kind:'conflict',draft:conflict};
 }
 const draft={...input,baseRevision:current?.pending?current.draft.baseRevision:Math.max(current?.draft.baseRevision||0,input.baseRevision),localRevision:expectedLocalRevision+1,modifiedAt:Date.now()};
 await tx.objectStore('drafts').put({uid:input.uid,draft,pending:true},k);await tx.done;d.close();announce();return{kind:'saved',draft};
}
export async function getDraft<T>(uid:string,kind:EntityKind,id:string):Promise<Draft<T>|null>{const d=await db();try{return(await d.get('drafts',key(uid,kind,id)))?.draft as Draft<T>||null}finally{d.close()}}
export async function listDrafts<T>(uid:string,kind:EntityKind):Promise<Draft<T>[]>{const d=await db();try{return(await d.getAll('drafts')).filter(r=>r.uid===uid&&r.pending&&r.draft.kind===kind).map(r=>r.draft as Draft<T>)}finally{d.close()}}
export async function listConflicts<T>(uid:string):Promise<Draft<T>[]>{const d=await db();try{return(await d.getAll('conflicts')).filter(r=>r.uid===uid).map(r=>r.draft as Draft<T>)}finally{d.close()}}
export async function acknowledge<T>(candidate:Draft<T>,saved:Saved<T>):Promise<void>{
 const d=await db(),tx=d.transaction(['drafts','saved'],'readwrite'),k=key(candidate.uid,candidate.kind,candidate.id);
 const row=await tx.objectStore('drafts').get(k);
 if(row&&row.draft.baseRevision===candidate.baseRevision){
  const exact=row.draft.localRevision===candidate.localRevision&&row.draft.mutationId===candidate.mutationId;
  await tx.objectStore('drafts').put({...row,pending:!exact,draft:{...row.draft,baseRevision:saved.revision}},k);
 }
 const old=await tx.objectStore('saved').get(k);
 if(!old||old.value.revision<=saved.revision)await tx.objectStore('saved').put({uid:candidate.uid,kind:candidate.kind,value:saved},k);
 await tx.done;d.close();announce();
}
export async function putLocalImage(uid:string,image:ImageRecord){const d=await db();try{await d.put('images',{uid,image},key(uid,image.id))}finally{d.close()}}
export async function getLocalImage(uid:string,id:string):Promise<ImageRecord|null>{const d=await db();try{return(await d.get('images',key(uid,id)))?.image||null}finally{d.close()}}
export async function cacheSaved<T>(uid:string,kind:EntityKind,value:Saved<T>){const d=await db();try{await d.put('saved',{uid,kind,value},key(uid,kind,value.id))}finally{d.close()}}
export async function listCached<T>(uid:string,kind:EntityKind):Promise<Saved<T>[]>{const d=await db();try{return(await d.getAll('saved')).filter(r=>r.uid===uid&&r.kind===kind).map(r=>r.value as Saved<T>)}finally{d.close()}}
export async function setMeta(uid:string,name:string,value:unknown){const d=await db();try{await d.put('meta',{uid,value},key(uid,name))}finally{d.close()}}
export async function getMeta<T>(uid:string,name:string):Promise<T|null>{const d=await db();try{return(await d.get('meta',key(uid,name)))?.value as T??null}finally{d.close()}}
export async function clearAccountCache(uid:string){const d=await db();try{const tx=d.transaction(['drafts','conflicts','saved','images','meta'],'readwrite');for(const name of ['drafts','conflicts','saved','images','meta'] as const){let c=await tx.objectStore(name).openCursor();while(c){if(c.value.uid===uid)await c.delete();c=await c.continue()}}await tx.done}finally{d.close()}announce()}
export async function replaceDraft<T>(expected:Draft<T>,replacement:Draft<T>,pending:boolean){
 const d=await db();try{const tx=d.transaction(['drafts','conflicts'],'readwrite'),k=key(expected.uid,expected.kind,expected.id);const row=await tx.objectStore('drafts').get(k);if(!row||row.draft.localRevision!==expected.localRevision||row.draft.mutationId!==expected.mutationId){await tx.done;throw Error('The draft changed. Review the latest version before resolving.')}await tx.objectStore('conflicts').put({uid:expected.uid,draft:expected,pending:true},key(expected.uid,crypto.randomUUID()));await tx.objectStore('drafts').put({uid:expected.uid,draft:{...replacement,localRevision:expected.localRevision+1},pending},k);await tx.done;}finally{d.close()}announce();
}
export async function replaceCached<T>(uid:string,kind:EntityKind,values:Saved<T>[]){const d=await db();try{const tx=d.transaction('saved','readwrite');let c=await tx.store.openCursor();while(c){if(c.value.uid===uid&&c.value.kind===kind)await c.delete();c=await c.continue()}for(const value of values)await tx.store.put({uid,kind,value},key(uid,kind,value.id));await tx.done}finally{d.close()}}
export async function forgetEntity(uid:string,kind:EntityKind,id:string){const d=await db();try{const tx=d.transaction(['saved','drafts','conflicts'],'readwrite');const k=key(uid,kind,id),row=await tx.objectStore('drafts').get(k);if(row?.pending)await tx.objectStore('conflicts').put(row,key(uid,crypto.randomUUID()));await tx.objectStore('saved').delete(k);await tx.objectStore('drafts').delete(k);await tx.done}finally{d.close()}announce()}
