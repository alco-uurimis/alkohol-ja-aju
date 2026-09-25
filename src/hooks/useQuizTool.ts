import { useEffect,useRef } from 'react';
type QuizState={question:string|null;position:number;total:number;answered:boolean;completed:boolean;score:number};
type Tool={name:string;title:string;description:string;inputSchema:object;annotations:object;execute:(input:unknown)=>QuizState};
// Optional emerging WebMCP API. No state is persisted or sent off-site.
export function useQuizTool(state:QuizState){
 const latest=useRef(state);latest.current=state;
 useEffect(()=>{const context=(document as Document & {modelContext?:{registerTool:(tool:Tool,options:{signal:AbortSignal})=>void|Promise<void>}}).modelContext;if(!context?.registerTool)return;const lifecycle=new AbortController();try{void Promise.resolve(context.registerTool({name:'read_quiz_progress',title:'Loe viktoriini seisu',description:'Tagastab nähtava väite ja viktoriini edenemise. Ei vasta kasutaja eest ega avalda õiget vastust.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){if(input===null||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length)throw new Error('Sisend peab olema tühi objekt.');return {...latest.current};}},{signal:lifecycle.signal})).catch(()=>{});}catch{/* Unsupported experimental API must not break the page. */}return()=>lifecycle.abort();},[]);
}
