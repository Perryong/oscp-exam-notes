import type {Draft,MachineContent} from '../notebook/model';
import {commitEntity} from './notes';
export const commitMachine=(uid:string,draft:Draft<MachineContent>)=>commitEntity(uid,draft,'machine');
