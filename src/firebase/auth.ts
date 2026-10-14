import {setPersistence,browserLocalPersistence,browserSessionPersistence,signInWithEmailAndPassword,sendPasswordResetEmail,signOut} from 'firebase/auth';
import {terminate,clearIndexedDbPersistence} from 'firebase/firestore';
import {deleteApp} from 'firebase/app';
import {getClient} from './client';
import {beforeLeaveEditor} from '../editor/NoteEditor';
import {clearAccountCache,listDrafts,listConflicts,getMeta} from '../persistence/local';
let halt=()=>{};
export function registerSessionStop(stop:()=>void){halt=stop;return()=>{if(halt===stop)halt=()=>{}}}
export async function signIn(email:string,password:string,trusted=false){if(!await beforeLeaveEditor())throw Error('Save or export your current edit first');halt();const {auth}=getClient();await setPersistence(auth,trusted?browserLocalPersistence:browserSessionPersistence);await signInWithEmailAndPassword(auth,email,password)}
export async function resetPassword(email:string){await sendPasswordResetEmail(getClient().auth,email)}
export async function signOutSafely(){if(!await beforeLeaveEditor())throw Error('Save or export your current edit before signing out');halt();await signOut(getClient().auth)}
let releaseDevice:(()=>void)|undefined;
export function holdDeviceCache(){if(!navigator.locks)return()=>{};let release!:()=>void;const ready=new Promise<void>(r=>release=r);releaseDevice=release;void navigator.locks.request('oscp-device-cache',{mode:'shared'},()=>ready);return()=>{release();if(releaseDevice===release)releaseDevice=undefined}}
async function assertExportedDrafts(uid:string){ const drafts=[...await listDrafts(uid,'note'),...await listDrafts(uid,'machine'),...await listConflicts(uid)];const exported=await getMeta<{draftRevisions:{kind:string;id:string;localRevision:number;mutationId:string}[]}>(uid,'last-export');if(drafts.some(d=>!exported?.draftRevisions.some(e=>e.kind===d.kind&&e.id===d.id&&e.localRevision===d.localRevision&&e.mutationId===d.mutationId)))throw Error('Device has pending or recovery drafts. Download a current full backup before clearing.');}
export async function clearDeviceData(uid:string){
 await assertExportedDrafts(uid);
 if(!await beforeLeaveEditor())throw Error('Save pending editor changes first');if(!navigator.locks)throw Error('Device clearing requires a browser with Web Locks.');halt();releaseDevice?.();
 await navigator.locks.request('oscp-device-cache',{mode:'exclusive',ifAvailable:true},async lock=>{if(!lock)throw Error('Close other notebook tabs before clearing this device');await assertExportedDrafts(uid);const client=getClient();await signOut(client.auth);await terminate(client.db);await clearIndexedDbPersistence(client.db);await clearAccountCache(uid);await deleteApp(client.app);location.reload()});
}
