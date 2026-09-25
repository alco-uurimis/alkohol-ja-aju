import { useMemo } from 'react';
import { SourceReference } from './Shared';

type Lang='et'|'ru';
type Topic={id:string;title:string;subtitle:string;symbol:string;body:string;detail:string;refs:number[]};

const nodeClasses=['node-memory','node-attention','node-reaction','node-decision'];

export default function BrainNetwork({topics,active,onSelect,lang}:{topics:Topic[];active:number;onSelect:(index:number)=>void;lang:Lang}){
  const ru=lang==='ru';
  const topic=topics[active];
  const particles=useMemo(()=>Array.from({length:18},(_,i)=>({id:i,x:10+(i*37)%82,y:12+(i*53)%76,delay:(i%7)*.22})),[]);
  return <div className="network-explorer">
    <div className="network-copy">
      <span className="network-kicker">{ru?'ИНТЕРАКТИВНАЯ СХЕМА':'INTERAKTIIVNE SKEEM'}</span>
      <h3>{ru?'Исследуй связи в мозге':'Uuri seoseid ajus'}</h3>
      <p>{ru?'Нажимай на узлы вокруг схемы. Они связаны с темами памяти, внимания, реакции и принятия решений.':'Vajuta skeemi ümber olevatele sõlmedele. Need seostuvad mälu, tähelepanu, reaktsiooni ja otsustamise teemadega.'}</p>
      <div className="network-detail" aria-live="polite">
        <span className="network-index">{topic.symbol}</span>
        <div><strong>{topic.title}</strong><p>{topic.subtitle}</p><p className="network-body">{topic.body} <SourceReference ids={topic.refs} lang={lang}/></p></div>
      </div>
      <button className="button network-next" onClick={()=>onSelect((active+1)%topics.length)}>{ru?'Следующая связь':'Järgmine seos'} <span aria-hidden="true">→</span></button>
      <p className="network-note">{ru?'Схема иллюстративная: она помогает ориентироваться в темах и не показывает измеренную активность мозга.':'Skeem on illustratiivne: see aitab teemades orienteeruda ega näita mõõdetud ajutegevust.'}</p>
    </div>
    <div className="network-stage" aria-label={ru?'Интерактивная схема тем мозга':'Aju teemade interaktiivne skeem'}>
      <div className="network-grid" aria-hidden="true"/>
      <svg className="network-lines" viewBox="0 0 600 460" aria-hidden="true">
        <defs><linearGradient id="brainGlow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#b6a7ff"/><stop offset="1" stopColor="#c9f574"/></linearGradient></defs>
        <path className="brain-outline" d="M252 113c-42-17-88 10-90 55-33 3-54 32-46 64-29 18-34 58-11 82 1 37 35 62 69 52 20 28 62 31 84 5 18 16 48 18 68 3 34 18 75-5 77-44 29-13 41-49 24-75 19-31 1-71-34-78-7-38-48-59-82-42-14-24-40-35-59-22Z"/>
        <path className="brain-fold" d="M193 184c33-33 73-14 75 17 27-31 78-23 82 18 31-20 65 5 55 37M174 283c26-26 64-15 72 13 20-29 65-30 82 1 21-18 54-7 62 18M255 123c-14 23-10 48 7 64M314 132c13 20 12 47-1 66M244 355c17-25 21-53 8-79M328 363c-14-25-13-52 2-78"/>
        {[['145','105'],['470','112'],['124','350'],['478','354']].map(([x,y],i)=><line key={i} className={'network-link '+(i===active?'active':'')} x1="300" y1="235" x2={x} y2={y}/>) }
        <circle className="core-halo" cx="300" cy="235" r="72"/><circle className="core-dot" cx="300" cy="235" r="10"/>
      </svg>
      <div className="brain-center" aria-hidden="true"><span>{ru?'мозг':'aju'}</span><small>{ru?'система':'süsteem'}</small></div>
      {particles.map(p=><span key={p.id} className="network-particle" style={{left:`${p.x}%`,top:`${p.y}%`,animationDelay:`${p.delay}s`}} aria-hidden="true"/>)}
      {topics.map((t,i)=><button key={t.id} className={`network-node ${nodeClasses[i]} ${active===i?'active':''}`} aria-pressed={active===i} onClick={()=>onSelect(i)}><span>{t.symbol}</span><strong>{t.title}</strong></button>)}
    </div>
  </div>;
}
