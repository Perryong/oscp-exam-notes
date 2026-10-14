import {emptyNote,type NoteContent,type MachineContent,type Draft,type NotebookBundle,type ImageRecord} from '../../src/notebook/model';
export const noteContent=(overrides:Partial<NoteContent>={}):NoteContent=>({...emptyNote(),...overrides});
export const machineContent=(overrides:Partial<MachineContent>={}):MachineContent=>({name:'Markup',platform:'HackTheBox',os:'Windows',tags:[],legacyKey:null,week:null,progress:'not-started',...overrides});
export const draft=(overrides:Partial<Draft<NoteContent>>={}):Draft<NoteContent>=>({uid:'alice',kind:'note',id:'note1',content:noteContent(),baseRevision:0,localRevision:0,mutationId:crypto.randomUUID(),modifiedAt:Date.now(),...overrides});
export const bundle=(overrides:Partial<NotebookBundle>={}):NotebookBundle=>({version:1,notes:[],machines:[],history:{},images:[],legacySources:{},unmatchedProgress:{},...overrides});
export const imageRecord=(overrides:Partial<ImageRecord>={}):ImageRecord=>({id:'img1',data:'data:image/png;base64,iVBORw0KGgo=',...overrides});
