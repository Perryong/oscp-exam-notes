import {doc,getDoc,runTransaction,serverTimestamp} from 'firebase/firestore';
import type {ImageRecord} from '../notebook/model';
import {getClient,requireOwner} from './client';
import {validId} from '../notebook/validation';
export async function ensureImage(uid:string,image:ImageRecord){requireOwner(uid);if(!validId(image.id)||image.data.length>=1000000||!/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(image.data))throw Error('Invalid screenshot');const ref=doc(getClient().db,'users',uid,'images',image.id);await runTransaction(getClient().db,async tx=>{const old=await tx.get(ref);if(old.exists()){if(old.data().data!==image.data)throw Error('Screenshot ID conflict');return}tx.set(ref,{data:image.data,createdAt:serverTimestamp()})})}
export async function loadImage(uid:string,id:string):Promise<ImageRecord|null>{requireOwner(uid);if(!validId(id))throw Error('Invalid screenshot ID');const s=await getDoc(doc(getClient().db,'users',uid,'images',id));return s.exists()?{id,data:s.data().data}:null}
