import {readFileSync} from 'node:fs';
import {test,before,after,beforeEach} from 'node:test';
import {initializeTestEnvironment,assertSucceeds,assertFails} from '@firebase/rules-unit-testing';
import {doc,setDoc,getDoc,getDocs,collection,writeBatch,serverTimestamp,Timestamp} from 'firebase/firestore';
let env;before(async()=>{env=await initializeTestEnvironment({projectId:'demo-oscp-notebook',firestore:{rules:readFileSync('firestore.rules','utf8')}})});beforeEach(()=>env.clearFirestore());after(()=>env.cleanup());
const db=()=>env.authenticatedContext('alice').firestore();
const data=(extra={})=>({title:'Notes',contentJson:'{"type":"doc","content":[{"type":"paragraph"}]}',text:'',tags:[],machineId:null,week:null,attachmentIds:[],schemaVersion:1,deletedAt:null,sourceHtml:null,revision:1,lastMutationId:'mutation-1',createdAt:serverTimestamp(),updatedAt:serverTimestamp(),...extra});
test('owner can create and list notebook notes but other users cannot',async()=>{const ref=doc(db(),'users/alice/notebookNotes/n1');await assertSucceeds(setDoc(ref,data()));await assertSucceeds(getDocs(collection(db(),'users/alice/notebookNotes')));await assertFails(getDoc(doc(env.authenticatedContext('bob').firestore(),ref.path)));await assertFails(getDocs(collection(env.unauthenticatedContext().firestore(),'users/alice/notebookNotes')))});
test('updates require one revision and exact previous history in the same transaction',async()=>{const d=db(),ref=doc(d,'users/alice/notebookNotes/n1');await setDoc(ref,data());const old=(await getDoc(ref)).data();await assertFails(setDoc(ref,data({...old,revision:2,updatedAt:serverTimestamp(),lastMutationId:'mutation-2'})));const batch=writeBatch(d);batch.set(doc(d,'users/alice/noteHistory/n1/versions/1'),old);batch.set(ref,data({...old,revision:2,lastMutationId:'mutation-2',updatedAt:serverTimestamp()}));await assertSucceeds(batch.commit());await assertFails(setDoc(ref,data({...old,revision:7,updatedAt:serverTimestamp()})))});
test('rejects UTF-8 overflow, unknown fields, unsafe metadata, and forged timestamps',async()=>{for(const extra of [{text:'你'.repeat(204801)},{extra:true},{tags:[9]},{attachmentIds:['../bob']},{createdAt:Timestamp.fromMillis(0)},{schemaVersion:2},{revision:2}])await assertFails(setDoc(doc(db(),'users/alice/notebookNotes/n1'),data(extra)))});
test('supports maximum-size bounded tag and attachment lists',async()=>{await assertSucceeds(setDoc(doc(db(),'users/alice/notebookNotes/n1'),data({tags:Array.from({length:30},(_,i)=>'tag'+i),attachmentIds:Array.from({length:100},(_,i)=>'image'+i)})))});

test('rejects malformed attachment lists without string coercion',async()=>{for(const attachmentIds of [[123],['a|b'],[''],['x'.repeat(129)],['a','a'],Array.from({length:101},(_,i)=>'i'+i)])await assertFails(setDoc(doc(db(),'users/alice/notebookNotes/n1'),data({attachmentIds})))});
test('history cannot be forged and creation time cannot change',async()=>{const d=db(),ref=doc(d,'users/alice/notebookNotes/n1');await setDoc(ref,data());const old=(await getDoc(ref)).data();for(const forged of [true,false]){const batch=writeBatch(d);batch.set(doc(d,'users/alice/noteHistory/n1/versions/1'),forged?{...old,title:'forged'}:old);batch.set(ref,{...old,revision:2,lastMutationId:'mutation-2',updatedAt:serverTimestamp(),...(forged?{}:{createdAt:Timestamp.fromMillis(0)})});await assertFails(batch.commit())}});

test('workspace membership is validated and cannot be removed or changed',async()=>{
 const d=db();
 for(const workspace of ['oscp','osai']) await assertSucceeds(setDoc(doc(d,'users/alice/notebookNotes/'+workspace),data({workspace})));
 for(const workspace of [null,'OSAI','bad']) await assertFails(setDoc(doc(d,'users/alice/notebookNotes/bad'),data({workspace})));
 for(const name of ['oscp','osai']) {
 const ref=doc(d,'users/alice/notebookNotes/'+name),old=(await getDoc(ref)).data();
 const batch=writeBatch(d);batch.set(doc(d,'users/alice/noteHistory/'+name+'/versions/1'),old);
 const next={...old,workspace:name==='oscp'?'osai':'oscp',revision:2,lastMutationId:'next',updatedAt:serverTimestamp()};
 batch.set(ref,next);await assertFails(batch.commit());
 if(name==='osai'){const b=writeBatch(d);b.set(doc(d,'users/alice/noteHistory/osai/versions/1'),old);delete next.workspace;b.set(ref,next);await assertFails(b.commit())}
 }
 const legacy=doc(d,'users/alice/notebookNotes/legacy');await setDoc(legacy,data());const old=(await getDoc(legacy)).data();const b=writeBatch(d);b.set(doc(d,'users/alice/noteHistory/legacy/versions/1'),old);b.set(legacy,{...old,workspace:'oscp',revision:2,lastMutationId:'next',updatedAt:serverTimestamp()});await assertSucceeds(b.commit());
});
test('workspace target links reject cross-workspace and missing targets',async()=>{
 const d=db(), target={name:'lab',platform:'local',os:'',tags:[],legacyKey:null,week:null,progress:'not-started',workspace:'osai',revision:1,lastMutationId:'m',createdAt:serverTimestamp(),updatedAt:serverTimestamp()};
 await assertSucceeds(setDoc(doc(d,'users/alice/machines/lab'),target));
 await assertSucceeds(setDoc(doc(d,'users/alice/notebookNotes/a'),data({workspace:'osai',machineId:'lab'})));
 await assertFails(setDoc(doc(d,'users/alice/notebookNotes/b'),data({workspace:'oscp',machineId:'lab'})));
 await assertFails(setDoc(doc(d,'users/alice/notebookNotes/c'),data({workspace:'osai',machineId:'missing'})));
 await assertSucceeds(setDoc(doc(d,'users/alice/notebookNotes/d'),data({workspace:'osai',machineId:'osai-module-foundations'})));
 await assertFails(setDoc(doc(d,'users/alice/notebookNotes/e'),data({workspace:'oscp',machineId:'osai-module-foundations'})));
 await assertFails(setDoc(doc(d,'users/alice/machines/osai-module-foundations'),{...target,workspace:'oscp'}));
});
