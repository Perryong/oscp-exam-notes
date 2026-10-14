import {useEffect,useState} from 'react';
import {onAuthStateChanged,type User} from 'firebase/auth';
import {getClient} from '../firebase/client';
import {holdDeviceCache,registerSessionStop} from '../firebase/auth';
import {startSync} from '../persistence/sync';
export function useAccount(){const[state,setState]=useState<{user:User|null;ready:boolean;error:string}>({user:null,ready:false,error:''});useEffect(()=>{let stop=()=>{},off=()=>{},unregister=()=>{};const release=holdDeviceCache();try{off=onAuthStateChanged(getClient().auth,user=>{stop();unregister();setState({user,ready:true,error:''});if(user){stop=startSync(user.uid);unregister=registerSessionStop(()=>{stop();setState({user:null,ready:true,error:''})})}})}catch(e){setState({user:null,ready:true,error:String(e)})}return()=>{stop();off();unregister();release()}},[]);return state}
