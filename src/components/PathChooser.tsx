import { useMemo, useState } from 'react';

type Lang='et'|'ru';

function QuickSearch({lang}:{lang:Lang}){
  const [query,setQuery]=useState('');
  const ru=lang==='ru';
  const entries=useMemo(()=>[
    {href:'#aju',ru:'Как алкоголь влияет на мозг',et:'Kuidas alkohol aju mõjutab'},
    {href:'#malu',ru:'Память',et:'Mälu'},
    {href:'#tahelepanu',ru:'Внимание',et:'Tähelepanu'},
    {href:'#teadmised',ru:'Научная база и источники',et:'Teadusbaas ja allikad'},
    {href:'alcohol-and-sleep/',ru:'Алкоголь и сон',et:'Alkohol ja uni'},
    {href:'alcohol-and-driving/',ru:'Алкоголь и вождение',et:'Alkohol ja autojuhtimine'},
    {href:'help/',ru:'Помощь и безопасные действия',et:'Abi ja turvalised tegevused'},
    {href:'teacher/',ru:'Материалы для учителя',et:'Õpetaja materjalid'},
  ],[]);
  const results=query.trim()?entries.filter(entry=>(ru?entry.ru:entry.et).toLocaleLowerCase().includes(query.toLocaleLowerCase())):[];
  return <div className="site-search"><label htmlFor="site-search">{ru?'Найти тему':'Leia teema'}</label><div className="site-search-box"><input id="site-search" type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder={ru?'Например: сон, память, помощь':'Näiteks: uni, mälu, abi'} /><button type="button" onClick={()=>setQuery('')} aria-label={ru?'Очистить поиск':'Tühjenda otsing'}>×</button></div>{query.trim()&&<div className="site-search-results">{results.length?results.map(entry=><a href={entry.href} key={entry.href} onClick={()=>setQuery('')}><strong>{ru?entry.ru:entry.et}</strong><span>{ru?'Открыть':'Ava'} →</span></a>):<p>{ru?'По этому слову ничего не найдено.':'Selle sõnaga tulemust ei leitud.'}</p>}</div>}</div>;
}

export default function PathChooser({lang}:{lang:Lang}){
  const ru=lang==='ru';
  const routes=[
    {href:'start/',time:ru?'5 мин':'5 min',title:ru?'Быстро понять':'Kiire ülevaade',text:ru?'Главная идея, одна схема и несколько вопросов — отдельная короткая страница.':'Põhiidee, üks skeem ja mõned küsimused — eraldi lühike leht.',accent:'quick'},
    {href:'start/?mode=full',time:ru?'20 мин':'20 min',title:ru?'Изучить подробно':'Õpi põhjalikult',text:ru?'Четыре шага: объяснение, исследование, упражнение и проверка.':'Neli sammu: selgitus, uuring, harjutus ja teadmiste kontroll.',accent:'full'},
    {href:'teacher/',time:ru?'45 мин':'45 min',title:ru?'Для урока':'Tunniks',text:ru?'Готовый сценарий, вопросы, рабочие листы и материалы для обсуждения.':'Valmis tunnikava, küsimused, töölehed ja arutelumaterjalid.',accent:'class'}
  ];
  return <section id="valik" className="intent-routes" aria-labelledby="intent-routes-title">
    <div className="intent-routes-heading"><h2 id="intent-routes-title">{ru?'Выбери формат':'Vali sobiv vorm'}</h2></div>
    <div className="intent-routes-grid intent-routes-simple">{routes.map(route=><a href={route.href} className={'intent-route mode-'+route.accent} key={route.title}><span>{route.time}</span><div><h3>{route.title}</h3><p>{route.text}</p></div><b>{ru?'Начать':'Alusta'}</b></a>)}</div>
    <div className="route-tools"><QuickSearch lang={lang}/><div className="route-links"><a className="route-link-featured" href="topics/">{ru?'Научные темы':'Teadusteemad'}</a><a href="methodology/">{ru?'Методология':'Metoodika'}</a></div></div>
  </section>;
}
