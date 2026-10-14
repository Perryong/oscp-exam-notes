import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import type {Saved,NoteContent,MachineContent} from './model';
import {subscribeNotebook} from './repository';
const Context=createContext<{notes:Saved<NoteContent>[];machines:Saved<MachineContent>[]}>({notes:[],machines:[]});
export function NotebookProvider({uid,children}:{uid:string|null;children:ReactNode}){const[data,setData]=useState({notes:[] as Saved<NoteContent>[],machines:[] as Saved<MachineContent>[]});useEffect(()=>{setData({notes:[],machines:[]});if(uid)return subscribeNotebook(uid,(notes,machines)=>setData({notes,machines}))},[uid]);return <Context.Provider value={data}>{children}</Context.Provider>}
export const useNotebook=()=>useContext(Context);
