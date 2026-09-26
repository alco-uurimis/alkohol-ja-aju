import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function ResearchPortal(){
  const [target,setTarget]=useState<HTMLElement|null>(null);
  const [ru,setRu]=useState(document.documentElement.lang==='ru');

  useEffect(()=>{
    const findTarget=()=>setTarget(document.querySelector<HTMLElement>('.header-actions'));
    findTarget();
    const timer=window.setTimeout(findTarget,0);
    const observer=new MutationObserver(()=>setRu(document.documentElement.lang==='ru'));
    observer.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    return()=>{window.clearTimeout(timer);observer.disconnect();};
  },[]);

  if(!target)return null;
  return createPortal(
    <a className="research-entry-link" href="science/">
      <span className="research-entry-long">{ru?'Помоги науке':'Aita teadust'}</span>
      <span className="research-entry-short">{ru?'Наука':'Teadus'}</span>
    </a>,
    target,
  );
}
