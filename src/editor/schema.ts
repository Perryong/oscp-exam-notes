import { getSchema, type JSONContent } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Node } from '@tiptap/core';
export const Screenshot=Node.create({name:'screenshot',group:'block',atom:true,addAttributes(){return{imageId:{default:null,parseHTML:(element:HTMLElement)=>element.getAttribute('data-image-id')},alt:{default:'Screenshot'}}},parseHTML(){return[{tag:'img[data-image-id]'}]},renderHTML({HTMLAttributes}){return['img',{'data-image-id':HTMLAttributes.imageId,alt:HTMLAttributes.alt}]}});
export const extensions=[StarterKit.configure({link:{openOnClick:false,protocols:['http','https']}}),TaskList,TaskItem.configure({nested:true}),Screenshot];
const schema=getSchema(extensions);
export const safeLink=(href:string)=>/^https?:\/\/[^\s]+$/i.test(href)||/^\/notes\/[A-Za-z0-9_-]{1,128}$/.test(href);
export function decodeEditor(json:string):JSONContent{
 const parsed=JSON.parse(json);let count=0;
 function inspect(n:JSONContent,depth:number){
  if(!n||typeof n!=='object'||depth>40||++count>30000||!n.type||!schema.nodes[n.type])throw Error('Unsupported editor content');
  if(n.type==='screenshot'&&(!/^[A-Za-z0-9_-]{1,128}$/.test(n.attrs?.imageId)||typeof n.attrs?.alt!=='string'||n.attrs.alt.length>200))throw Error('Invalid screenshot');
  for(const mark of n.marks||[])if(!schema.marks[mark.type]||(mark.type==='link'&&!safeLink(mark.attrs?.href||'')))throw Error('Unsafe link or formatting');
  for(const c of n.content||[])inspect(c,depth+1);
 }
 inspect(parsed,0);if(parsed.type!=='doc')throw Error('Invalid document');
 const node=schema.nodeFromJSON(parsed);node.check();return node.toJSON();
}
export function encodeEditor(doc:JSONContent){const clean=decodeEditor(JSON.stringify(doc));const node=schema.nodeFromJSON(clean);const attachmentIds:string[]=[];node.descendants(n=>{if(n.type.name==='screenshot')attachmentIds.push(n.attrs.imageId)});return{contentJson:JSON.stringify(clean),text:node.textBetween(0,node.content.size,'\n'),attachmentIds:[...new Set(attachmentIds)]};}
