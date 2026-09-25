import { useEffect, useRef } from 'react';
export function useStageFocus(stage:string|number){const ref=useRef<HTMLHeadingElement>(null);const previous=useRef(stage);useEffect(()=>{if(previous.current===stage)return;previous.current=stage;ref.current?.focus({preventScroll:true});},[stage]);return ref;}
