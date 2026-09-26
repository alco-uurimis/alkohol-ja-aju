import type { ReactNode } from 'react';

const sectionOrder:Record<string,string>={
  aju:'01',
  infograafika:'02',
  teadmised:'03',
  malu:'04',
  tahelepanu:'05',
  labor:'06',
  viktoriin:'07',
  meelespea:'08',
  tagasiside:'09',
  projektist:'10',
  'isiklik-kokkuvote':'11',
  allikad:'12',
};

function sectionMeta(id:string,label:string){
  const order=sectionOrder[id]??'';
  const slash=label.indexOf('/');
  const name=(slash>=0?label.slice(slash+1):label).trim();
  return {order,name};
}

export function Section({id,number,title,intro,children,className=''}:{id:string;number:string;title:string;intro?:string;children:ReactNode;className?:string}){
  const introId=intro?`${id}-intro`:undefined;
  const meta=sectionMeta(id,number);
  return <section id={id} aria-labelledby={id+'-title'} aria-describedby={introId} className={'section '+className}>
    <div className="section-heading">
      <div className="section-heading-meta">
        {meta.order&&<span className="section-index" aria-hidden="true">{meta.order}</span>}
        <p className="eyebrow">{meta.name}</p>
      </div>
      <h2 id={id+'-title'}>{title}</h2>
      {intro&&<p id={introId} className="section-intro">{intro}</p>}
    </div>
    {children}
  </section>;
}

export function InfoCard({title,children}:{title:string;children:ReactNode}){return <article className="info-card"><h3>{title}</h3>{children}</article>;}
export function SourceReference({ids,lang='et'}:{ids:number[];lang?:'et'|'ru'}){return <span className="source-refs">{ids.map(id=><a key={id} href={'#allikas-'+id} aria-label={(lang==='ru'?'Источник ':'Allikas ')+id}>[{id}]</a>)}</span>;}
export function ProgressBar({value,max,label}:{value:number;max:number;label:string}){return <div className="progress-wrap"><label>{label}<progress aria-label={label} max={max} value={value}/></label></div>;}
export function ResultCard({title,score,total,children,lang='et'}:{title:string;score:number;total:number;children:ReactNode;lang?:'et'|'ru'}){const pct=total>0?Math.max(0,Math.min(100,Math.round(score/total*100))):0;return <div className="result-card"><div className="result-ring-wrap"><div className="result-ring" style={{background:`conic-gradient(var(--purple) ${pct}%, #dfe3ed 0)`}} aria-hidden="true"><span>{pct}%</span></div><div className="result-score" aria-label={lang==='ru'?`${score} баллов из ${total}`:`${score} punkti ${total}-st`}><strong>{score}</strong><span>/ {total}</span></div></div><div><h3>{title}</h3>{children}</div></div>;}
export function ExerciseNote({lang='et'}:{lang?:'et'|'ru'}){return <p className="exercise-note"><span aria-hidden="true">ⓘ</span> {lang==='ru'?'Это учебное упражнение, а не симуляция опьянения и не оценка здоровья. Не употребляй алкоголь ради проверки результата.':'See on õppeharjutus, mitte joobe simulatsioon ega tervise hindamine. Ära tarvita alkoholi selle katsetamiseks.'}</p>;}
