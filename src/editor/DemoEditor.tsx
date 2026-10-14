import {useEffect,useState} from 'react';
import {emptyNote,type Draft,type NoteContent} from '../notebook/model';
import {getDraft} from '../persistence/local';
import NoteEditor from './NoteEditor';
export default function DemoEditor(){const [draft,setDraft]=useState<Draft<NoteContent>|null>(null);useEffect(()=>{void getDraft<NoteContent>('demo-local','note','demo-note').then(d=>setDraft(d||{uid:'demo-local',kind:'note',id:'demo-note',content:emptyNote(),baseRevision:0,localRevision:0,mutationId:crypto.randomUUID(),modifiedAt:Date.now()}))},[]);return <section className="page"><h1>Try your notebook</h1><p className="subtitle">A local demo. This note stays in this browser.</p>{draft&&<NoteEditor uid="demo-local" draft={draft}/>}</section>}
