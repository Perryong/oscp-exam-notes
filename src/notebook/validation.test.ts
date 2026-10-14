import {test,expect} from 'vitest';
import {validateNote,validateMachine} from './validation';
import {noteContent,machineContent} from '../../tests/fixtures/builders';
test('counts UTF-8 payload bytes including original markup',()=>{expect(()=>validateNote(noteContent({text:'你'.repeat(204801)}))).toThrow();const n=noteContent();n.sourceHtml='x'.repeat(614400-new TextEncoder().encode(n.contentJson+n.text).length);expect(validateNote(n)).toEqual(n);expect(()=>validateNote({...n,sourceHtml:n.sourceHtml+'x'})).toThrow()});
test('rejects malformed metadata and schema pollution',()=>{for(const change of [{title:'x'.repeat(201)},{tags:['x','x']},{week:0},{extra:true},{attachmentIds:['../../other']},{schemaVersion:2}])expect(()=>validateNote({...noteContent(),...change})).toThrow();expect(()=>validateMachine(machineContent({progress:'wrong' as never}))).toThrow()});
