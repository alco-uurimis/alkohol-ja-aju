import { useState } from 'react';
import { topics,science,knowledgeCards } from '../data/content';
import { topicsRu,scienceRu,knowledgeCardsRu } from '../data/content.ru';
import { InfoCard,Section,SourceReference } from '../components/Shared';

export default function Brain({lang}:{lang:'et'|'ru'}){
  const [active,setActive]=useState(0);
  const ru=lang==='ru';
  const localizedTopics=ru?topicsRu:topics;
  const localizedScience=ru?scienceRu:science;
  const localizedKnowledge=ru?knowledgeCardsRu:knowledgeCards;
  const topic=localizedTopics[active];

  return <Section
    id="aju"
    number={ru?'01 / ПОЙМИ':'01 / MÕISTA'}
    title={ru?'Что алкоголь меняет в мозге?':'Mida alkohol ajus muudab?'}
    intro={ru
      ?'Сначала — четыре функции, которые легко заметить в поведении. Ниже — более глубокое объяснение: нейромедиаторы, память, система вознаграждения, развивающийся мозг, сон, толерантность и восстановление.'
      :'Kõigepealt neli võimet, mille muutusi on käitumises lihtne märgata. Allpool on sügavam selgitus: virgatsained, mälu, tasusüsteem, arenev aju, uni, tolerants ja taastumine.'}
  >
    <div className="brain-layout">
      <div className="topic-buttons" aria-label={ru?'Темы о мозге и алкоголе':'Aju ja alkoholi teemad'}>
        {localizedTopics.map((t,i)=><button
          key={t.id}
          aria-pressed={i===active}
          aria-controls="topic-panel"
          className={'topic-button '+(active===i?'active':'')}
          onClick={()=>setActive(i)}
        >
          <span className="topic-number">{t.symbol}</span>
          <span><strong>{t.title}</strong><small>{t.subtitle}</small></span>
        </button>)}
      </div>

      <article id="topic-panel" className="topic-panel" aria-live="polite">
        <span className="pill">{ru?'НЕПОСРЕДСТВЕННОЕ ДЕЙСТВИЕ':'VAHETU TOIME'}</span>
        <span className="panel-number" aria-hidden="true">{topic.symbol}</span>
        <h3>{topic.title}</h3>
        <p className="topic-body">{topic.body} <SourceReference ids={topic.refs} lang={lang}/></p>
        <details key={topic.id}>
          <summary>{ru?'Почему это происходит?':'Miks see juhtub?'}</summary>
          <p>{topic.detail} <SourceReference ids={topic.refs} lang={lang}/></p>
        </details>
      </article>
    </div>

    <div className="brain-map brain-map-static">
      <div className="brain-map-copy">
        <span className="pill">{ru?'УЧЕБНАЯ СХЕМА':'ÕPPESKEEM'}</span>
        <h3>{ru?'Какие области связаны с этими функциями':'Millised piirkonnad on nende funktsioonidega seotud'}</h3>
        <p>{ru
          ?'На схеме прямо подписано, какие области чаще связывают с памятью, вниманием, принятием решений и скоростью реакции.'
          :'Skeemil on otse märgitud, milliseid piirkondi seostatakse sagedamini mälu, tähelepanu, otsustamise ja reaktsioonikiirusega.'}</p>
        <p className="small">{ru
          ?'Это упрощённая учебная схема: функции распределены по сетям мозга и не принадлежат одной-единственной точке.'
          :'See on lihtsustatud õppeskeem: funktsioonid jaotuvad ajuvõrgustikes ega kuulu üheleainsale punktile.'}</p>
      </div>
      <div className="brain-map-stage brain-static-diagram" role="img" aria-label={ru?'Схема областей мозга и связанных функций':'Ajupiirkondade ja seotud funktsioonide skeem'}/>
    </div>

    <div className="context-grid">
      <InfoCard title={ru?'Во время употребления':'Tarvitamise ajal'}>
        <p>{localizedScience.acute} <SourceReference ids={[1,9]} lang={lang}/></p>
      </InfoCard>
      <InfoCard title={ru?'При повторном тяжёлом употреблении':'Korduva rohke tarvitamise korral'}>
        <p>{localizedScience.repeated} <SourceReference ids={[6,11]} lang={lang}/></p>
      </InfoCard>
      <InfoCard title={ru?'Связь или причина?':'Seos või põhjus?'}>
        <p>{localizedScience.correlation}</p>
      </InfoCard>
    </div>

    <div className="knowledge-library">
      <div className="knowledge-library-head">
        <span className="eyebrow">{ru?'ГЛУБЖЕ В ТЕМУ':'SÜGAVAMALT'}</span>
        <h3>{ru?'Что ещё важно знать об алкоголе':'Mida veel alkoholi kohta teada'}</h3>
        <p>{ru
          ?'Короткие объяснения на основе учебника по психиатрии, обзоров NIAAA и ВОЗ и рецензируемых научных статей. Открой карточку, если нужен механизм или оговорки исследования.'
          :'Lühiselgitused psühhiaatriaõpiku, NIAAA ja WHO ülevaadete ning eelretsenseeritud teadusartiklite põhjal. Ava kaart, kui tahad näha mehhanismi või uuringu piiranguid.'}</p>
      </div>
      <div className="knowledge-grid">
        {localizedKnowledge.map((item,i)=><article className="knowledge-card" key={item.title}>
          <div className="knowledge-card-top"><span>{String(i+1).padStart(2,'0')}</span><span>{item.kicker}</span></div>
          <h4>{item.title}</h4>
          <p>{item.text} <SourceReference ids={item.refs} lang={lang}/></p>
          <details>
            <summary>{ru?'Подробнее и важная оговорка':'Täpsemalt ja oluline piirang'}</summary>
            <p>{item.detail} <SourceReference ids={item.refs} lang={lang}/></p>
          </details>
        </article>)}
      </div>
    </div>
  </Section>;
}
