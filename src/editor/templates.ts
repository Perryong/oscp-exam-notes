import type {JSONContent} from '@tiptap/core';
export function createMachineTemplate():JSONContent{return{type:'doc',content:['Enumeration','Initial access','Privilege escalation','Evidence','Lessons learned'].flatMap(text=>[{type:'heading',attrs:{level:2},content:[{type:'text',text}]},{type:'paragraph'}])};}
