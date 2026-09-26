import { Section, SourceReference } from '../components/Shared';

type Lang='et'|'ru';
type IconType='clock'|'eye'|'balance'|'control'|'memory'|'tolerance'|'link'|'sleep';

const Icon=({type}:{type:IconType})=>{
  const paths={
    clock:<><circle cx="24" cy="24" r="16"/><path d="M24 14v11l7 4"/></>,
    eye:<><path d="M5 24s7-10 19-10 19 10 19 10-7 10-19 10S5 24 5 24Z"/><circle cx="24" cy="24" r="4"/></>,
    balance:<><path d="M24 7v34M12 13h24M14 13 8 25h12L14 13Zm20 0-6 12h12L34 13Z"/><path d="M13 41h22"/></>,
    control:<><circle cx="24" cy="17" r="8"/><path d="M10 42c1-10 6-16 14-16s13 6 14 16M20 15h8M24 11v8"/></>,
    memory:<><path d="M12 35c-5-4-6-12-2-17 2-3 5-4 8-4 2-5 9-7 13-3 6-1 11 4 10 10 5 4 4 12-2 15-3 4-9 5-14 2-4 2-9 1-13-3Z"/><path d="M18 18c3 1 5 3 5 7M31 16c-3 2-4 5-3 8M18 31c3-2 6-2 9 0"/></>,
    tolerance:<><path d="M7 37h8V25H7v12Zm13 0h8V18h-8v19Zm13 0h8V10h-8v27Z"/><path d="m10 17 8-6 7 3 12-8"/></>,
    link:<><path d="M19 29 14 34a7 7 0 0 1-10-10l7-7a7 7 0 0 1 10 0M29 19l5-5a7 7 0 0 1 10 10l-7 7a7 7 0 0 1-10 0M16 32l16-16"/></>,
    sleep:<><path d="M31 36A16 16 0 1 1 19 8a13 13 0 0 0 12 28Z"/><path d="M33 12h8l-8 8h8"/></>,
  };
  return <svg className="info-icon" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">{paths[type]}</svg>;
};

export default function Infographics({lang}:{lang:Lang}){
  const ru=lang==='ru';
  const short:[IconType,string][]=ru?[
    ['clock','Замедление реакции'],['eye','Снижение внимания'],['balance','Нарушение координации'],['control','Ослабление самоконтроля'],
  ]:[['clock','Reaktsiooni aeglustumine'],['eye','Tähelepanu vähenemine'],['balance','Koordinatsiooni häirumine'],['control','Enesekontrolli nõrgenemine']];
  const long:[IconType,string][]=ru?[
    ['memory','Проблемы с памятью'],['tolerance','Толерантность'],['link','Риск зависимости'],['sleep','Нарушение сна и настроения'],
  ]:[['memory','Mäluprobleemid'],['tolerance','Tolerants'],['link','Sõltuvusrisk'],['sleep','Une ja meeleolu häired']];

  return <Section id="infograafika" number={ru?'02 / ИНФОГРАФИКА':'02 / INFOGRAAFIKA'} title={ru?'Две схемы, которые помогают увидеть главное':'Kaks skeemi, mis aitavad põhilist näha'} intro={ru?'Здесь оставлены только две визуализации, которые добавляют новую информацию: возможные эффекты алкоголя и упрощённая схема нейрохимии.':'Siia on jäetud ainult kaks visualiseeringut, mis lisavad uut infot: alkoholi võimalikud mõjud ja lihtsustatud neurokeemia skeem.'} className="infographics-section">
    <div className="infographic-grid infographic-grid-compact">
      <article className="infographic-card infographic-effects">
        <div className="infographic-kicker"><span>{ru?'ЭФФЕКТЫ':'MÕJUD'}</span><span>01</span></div>
        <h3>{ru?'Что может меняться сразу и со временем':'Mis võib muutuda kohe ja aja jooksul'}</h3>
        <div className="effect-columns">
          <div className="effect-column short-term"><h4>{ru?'Кратковременно':'Lühiajaliselt'}</h4>{short.map(([icon,text])=><div className="effect-row" key={text}><Icon type={icon}/><span>{text}</span></div>)}</div>
          <div className="effect-column long-term"><h4>{ru?'При повторном тяжёлом употреблении':'Korduva rohke tarvitamise korral'}</h4>{long.map(([icon,text])=><div className="effect-row" key={text}><Icon type={icon}/><span>{text}</span></div>)}</div>
        </div>
        <p className="infographic-note">{ru?'Эффекты зависят от количества, частоты, возраста и других факторов.':'Mõju sõltub kogusest, sagedusest, vanusest ja teistest teguritest.'} <SourceReference ids={[6,8,11]} lang={lang}/></p>
      </article>

      <article className="infographic-card infographic-neuro">
        <div className="infographic-kicker"><span>{ru?'НЕЙРОХИМИЯ':'NEUROKEEMIA'}</span><span>02</span></div>
        <h3>{ru?'Три сигнальные системы — очень упрощённо':'Kolm signaalisüsteemi — väga lihtsustatult'}</h3>
        <div className="synapse-visual" aria-hidden="true"><div className="synapse-top"><i/><i/><i/><i/><i/></div><div className="synapse-gap"><span/><span/><span/><span/><span/><span/></div><div className="synapse-bottom"><i/><i/><i/></div></div>
        <div className="neuro-grid">
          <div className="neuro-item gaba"><strong>GABA</strong><span>{ru?'тормозный сигнал ↑':'pidurdav signaal ↑'}</span></div>
          <div className="neuro-item glutamate"><strong>{ru?'Глутамат':'Glutamaat'}</strong><span>{ru?'возбуждающий сигнал ↓':'ergastav signaal ↓'}</span></div>
          <div className="neuro-item dopamine"><strong>{ru?'Дофамин':'Dopamiin'}</strong><span>{ru?'система вознаграждения':'tasustamissüsteem'}</span></div>
        </div>
        <div className="neuro-outcomes"><span>{ru?'седативный эффект':'sedatiivne toime'}</span><span>{ru?'обучение и память':'õppimine ja mälu'}</span><span>{ru?'подкрепление поведения':'käitumise kinnistamine'}</span></div>
        <p className="infographic-note">{ru?'Этанол действует на множество мишеней; это не полный обзор нейрохимии.':'Etanool toimib paljudele sihtmärkidele; see ei ole täielik neurokeemia ülevaade.'} <SourceReference ids={[6,9]} lang={lang}/></p>
      </article>
    </div>
  </Section>;
}
