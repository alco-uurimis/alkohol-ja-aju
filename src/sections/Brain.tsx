import Collapse from '../components/Collapse';
import { useState } from 'react';
import { topics,science,knowledgeCards } from '../data/content';
import { getRu } from '../data/ru';
import { topicsEn, scienceEn, knowledgeCardsEn } from '../data/content.en';
import { InfoCard,Section,SourceReference } from '../components/Shared';
import { T } from '../data/siteT';

export default function Brain({lang}:{lang:'et'|'ru'|'en'}){
  const [active,setActive]=useState(0);
  const ru=lang==='ru';
  const localizedTopics=lang==='en'?topicsEn:ru?getRu().topicsRu:topics;
  const localizedScience=lang==='en'?scienceEn:ru?getRu().scienceRu:science;
  const localizedKnowledge=lang==='en'?knowledgeCardsEn:ru?getRu().knowledgeCardsRu:knowledgeCards;
  const topic=localizedTopics[active];

  return <Section
    id="aju"
    number={T(lang,ru?'01 / ПОЙМИ':'01 / MÕISTA')}
    title={T(lang,ru?'Что алкоголь меняет в мозге?':'Mida alkohol ajus muudab?')}
    intro={T(lang,ru
      ?'Сначала — четыре функции, которые легко заметить в поведении. Ниже — более глубокое объяснение: нейромедиаторы, память, система вознаграждения, развивающийся мозг, сон, толерантность и восстановление.'
      :'Kõigepealt neli võimet, mille muutusi on käitumises lihtne märgata. Allpool on sügavam selgitus: virgatsained, mälu, tasusüsteem, arenev aju, uni, tolerants ja taastumine.')}
  >
    <div className="brain-layout">
      <div className="topic-buttons" aria-label={T(lang,ru?'Темы о мозге и алкоголе':'Aju ja alkoholi teemad')}>
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
        <span className="pill">{T(lang,ru?'НЕПОСРЕДСТВЕННОЕ ДЕЙСТВИЕ':'VAHETU TOIME')}</span>
        <span className="panel-number" aria-hidden="true">{topic.symbol}</span>
        <h3>{topic.title}</h3>
        <p className="topic-body">{topic.body} <SourceReference ids={topic.refs} lang={lang}/></p>
        <details key={topic.id}>
          <summary>{T(lang,ru?'Почему это происходит?':'Miks see juhtub?')}</summary>
          <p>{topic.detail} <SourceReference ids={topic.refs} lang={lang}/></p>
        </details>
      </article>
    </div>

    <div className="brain-map brain-map-static">
      <div className="brain-map-copy">
        <span className="pill">{T(lang,ru?'УЧЕБНАЯ СХЕМА':'ÕPPESKEEM')}</span>
        <h3>{T(lang,ru?'Какие области связаны с этими функциями':'Millised piirkonnad on nende funktsioonidega seotud')}</h3>
        <p>{T(lang,ru
          ?'На схеме прямо подписано, какие области чаще связывают с памятью, вниманием, принятием решений и скоростью реакции.'
          :'Skeemil on otse märgitud, milliseid piirkondi seostatakse sagedamini mälu, tähelepanu, otsustamise ja reaktsioonikiirusega.')}</p>
        <p className="small">{T(lang,ru
          ?'Это упрощённая учебная схема: функции распределены по сетям мозга и не принадлежат одной-единственной точке.'
          :'See on lihtsustatud õppeskeem: funktsioonid jaotuvad ajuvõrgustikes ega kuulu üheleainsale punktile.')}</p>
      </div>
      <div className="brain-map-stage brain-static-diagram" role="img" aria-label={T(lang,ru?'Схема областей мозга и связанных функций':'Ajupiirkondade ja seotud funktsioonide skeem')}/>
    </div>

    <div className="context-grid">
      <InfoCard title={T(lang,ru?'Во время употребления':'Tarvitamise ajal')}>
        <p>{localizedScience.acute} <SourceReference ids={[1,9]} lang={lang}/></p>
      </InfoCard>
      <InfoCard title={T(lang,ru?'При повторном тяжёлом употреблении':'Korduva rohke tarvitamise korral')}>
        <p>{localizedScience.repeated} <SourceReference ids={[6,11]} lang={lang}/></p>
      </InfoCard>
      <InfoCard title={T(lang,ru?'Связь или причина?':'Seos või põhjus?')}>
        <p>{localizedScience.correlation}</p>
      </InfoCard>
    </div>

    <div className="knowledge-library">
      <div className="knowledge-library-head">
        <span className="eyebrow">{T(lang,ru?'ГЛУБЖЕ В ТЕМУ':'SÜGAVAMALT')}</span>
        <h3>{T(lang,ru?'Что ещё важно знать об алкоголе':'Mida veel alkoholi kohta teada')}</h3>
        <p>{T(lang,ru
          ?'Короткие объяснения на основе учебника по психиатрии, обзоров NIAAA и ВОЗ и рецензируемых научных статей. Открой карточку, если нужен механизм или оговорки исследования.'
          :'Lühiselgitused psühhiaatriaõpiku, NIAAA ja WHO ülevaadete ning eelretsenseeritud teadusartiklite põhjal. Ava kaart, kui tahad näha mehhanismi või uuringu piiranguid.')}</p>
      </div>
      <Collapse lang={lang} collapsed={[700,520]} count={`${localizedKnowledge.length} ${T(lang,ru?'карточек':'kaarti')}`}>
      <div className="knowledge-grid">
        {localizedKnowledge.map((item,i)=><article className="knowledge-card" key={item.title}>
          <div className="knowledge-card-top"><span>{String(i+1).padStart(2,'0')}</span><span>{item.kicker}</span></div>
          <h4>{item.title}</h4>
          <p>{item.text} <SourceReference ids={item.refs} lang={lang}/></p>
          <details>
            <summary>{T(lang,ru?'Подробнее и важная оговорка':'Täpsemalt ja oluline piirang')}</summary>
            <p>{item.detail} <SourceReference ids={item.refs} lang={lang}/></p>
          </details>
        </article>)}
      </div>
      </Collapse>
    </div>
  </Section>;
}

