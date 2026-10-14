import {test,expect} from 'vitest';
import {decodeEditor,encodeEditor} from './schema';
import {createMachineTemplate} from './templates';
test('preserves command whitespace and non-ASCII text',()=>{const doc={type:'doc',content:[{type:'codeBlock',content:[{type:'text',text:'whoami\n\tsudo -l\n你好 `test`'}]}]};expect(encodeEditor(decodeEditor(JSON.stringify(doc))).text).toBe('whoami\n\tsudo -l\n你好 `test`')});
test('rejects unknown nodes and executable links',()=>{expect(()=>decodeEditor('{')).toThrow();expect(()=>decodeEditor(JSON.stringify({type:'doc',content:[{type:'script'}]}))).toThrow();expect(()=>decodeEditor(JSON.stringify({type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'x',marks:[{type:'link',attrs:{href:'javascript:alert(1)'}}]}]}]}))).toThrow()});
test('machine template has five clear sections',()=>{expect(createMachineTemplate().content?.filter(n=>n.type==='heading').map(n=>n.content?.[0].text)).toEqual(['Enumeration','Initial access','Privilege escalation','Evidence','Lessons learned'])});
