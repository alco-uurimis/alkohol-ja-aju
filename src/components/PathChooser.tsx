import { useMemo, useState } from 'react';
import { T } from '../data/siteT';

type Lang='et'|'ru'|'en';

function QuickSearch({lang}:{lang:Lang}){
  const [query,setQuery]=useState('');
  const ru=lang==='ru';
  const entries=useMemo(()=>[
    {href:'#aju',ru:'Как алкоголь влияет на мозг',et:'Kuidas alkohol aju mõjutab',en:'How alcohol affects the brain'},
    {href:'#malu',ru:'Память',et:'Mälu',en:'Memory'},
    {href:'#tahelepanu',ru:'Внимание',et:'Tähelepanu',en:'Attention'},
    {href:'#teadmised',ru:'Научная база и источники',et:'Teadusbaas ja allikad',en:'Science base and sources'},
    {href:'alcohol-and-sleep/',ru:'Алкоголь и сон',et:'Alkohol ja uni',en:'Alcohol and sleep'},
    {href:'alcohol-and-driving/',ru:'Алкоголь и вождение',et:'Alkohol ja autojuhtimine',en:'Alcohol and driving'},
    {href:'help/',ru:'Помощь и безопасные действия',et:'Abi ja turvalised tegevused',en:'Help and safe actions'},
    {href:'teacher/',ru:'Материалы для учителя',et:'Õpetaja materjalid',en:'Materials for teachers'},
  ],[]);
  const results=query.trim()?entries.filter(entry=>(lang==='en'?entry.en:ru?entry.ru:entry.et).toLocaleLowerCase().includes(query.toLocaleLowerCase())):[];
  return <div className="site-search"><label htmlFor="site-search">{T(lang,ru?'Найти тему':'Leia teema')}</label><div className="site-search-box"><input id="site-search" type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder={T(lang,ru?'Например: сон, память, помощь':'Näiteks: uni, mälu, abi')} /><button type="button" onClick={()=>setQuery('')} aria-label={T(lang,ru?'Очистить поиск':'Tühjenda otsing')}>×</button></div>{query.trim()&&<div className="site-search-results">{results.length?results.map(entry=><a href={entry.href} key={entry.href} onClick={()=>setQuery('')}><strong>{lang==='en'?entry.en:ru?entry.ru:entry.et}</strong><span>{T(lang,ru?'Открыть':'Ava')} →</span></a>):<p>{T(lang,ru?'По этому слову ничего не найдено.':'Selle sõnaga tulemust ei leitud.')}</p>}</div>}</div>;
}

export default function PathChooser({lang}:{lang:Lang}){
  const ru=lang==='ru';
  const routes=[
    {href:'start/',time:T(lang,ru?'5 мин':'5 min'),title:T(lang,ru?'Быстро понять':'Kiire ülevaade'),text:T(lang,ru?'Главная идея, одна схема и несколько вопросов — отдельная короткая страница.':'Põhiidee, üks skeem ja mõned küsimused — eraldi lühike leht.'),accent:'quick'},
    {href:'start/?mode=full',time:T(lang,ru?'20 мин':'20 min'),title:T(lang,ru?'Изучить подробно':'Õpi põhjalikult'),text:T(lang,ru?'Четыре шага: объяснение, исследование, упражнение и проверка.':'Neli sammu: selgitus, uuring, harjutus ja teadmiste kontroll.'),accent:'full'},
    {href:'teacher/',time:T(lang,ru?'45 мин':'45 min'),title:T(lang,ru?'Для урока':'Tunniks'),text:T(lang,ru?'Готовый сценарий, вопросы, рабочие листы и материалы для обсуждения.':'Valmis tunnikava, küsimused, töölehed ja arutelumaterjalid.'),accent:'class'}
  ];
  return <section id="valik" className="intent-routes" aria-labelledby="intent-routes-title">
    <div className="intent-routes-heading"><h2 id="intent-routes-title">{T(lang,ru?'Выбери формат':'Vali sobiv vorm')}</h2></div>
    <div className="intent-routes-grid intent-routes-simple">{routes.map(route=><a href={route.href} className={'intent-route mode-'+route.accent} key={route.title}><span>{route.time}</span><div><h3>{route.title}</h3><p>{route.text}</p></div><b>{T(lang,ru?'Начать':'Alusta')}</b></a>)}</div>
    <div className="route-tools"><QuickSearch lang={lang}/><div className="route-links"><a className="route-link-featured" href="topics/">{T(lang,ru?'Научные темы':'Teadusteemad')}</a><a href="methodology/">{T(lang,ru?'Методология':'Metoodika')}</a></div></div>
  </section>;
}
