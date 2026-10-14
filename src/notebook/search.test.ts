import {test,expect} from 'vitest';
import {searchNotes} from './search';
import {noteContent} from '../../tests/fixtures/builders';
const note={id:'n',content:noteContent({text:'old'}),revision:1,lastMutationId:'m',createdAt:1,updatedAt:1};
test('same-length edits immediately change search results',()=>{expect(searchNotes([note],[],'old')).toHaveLength(1);expect(searchNotes([{...note,content:{...note.content,text:'new'}}],[],'new')).toHaveLength(1)});
test('search includes tags and machine names but excludes trash',()=>{const n={...note,content:{...note.content,machineId:'m',tags:['kerberos']}};expect(searchNotes([n],[],'kerberos')).toHaveLength(1);expect(searchNotes([{...n,content:{...n.content,deletedAt:1}}],[],'kerberos')).toHaveLength(0)});
