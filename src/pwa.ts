import {registerSW} from 'virtual:pwa-register';
import {beforeLeaveEditor} from './editor/NoteEditor';
let update:(reload?:boolean)=>Promise<void>;
export function registerOfflineShell(){if(import.meta.env.PROD)update=registerSW({onNeedRefresh(){window.dispatchEvent(new Event('notebook-update'))},onRegisterError(error){console.error('Offline shell unavailable',error)}})}
export async function applyShellUpdate(){if(!await beforeLeaveEditor())throw Error('Save or export the current edit before updating');await update?.(true)}
