import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { readGameMetrics } from '../utils/gameMetrics';

type Lang='et'|'ru';
const eventKey='alkohol-ja-aju:local-events';
function readLang():Lang{try{return localStorage.getItem('alkohol-ja-aju:language')==='ru'?'ru':'et';}catch{return document.documentElement.lang==='ru'?'ru':'et';}}
function track(name:string){try{const raw=sessionStorage.getItem(eventKey);const data:Record<string,number>=raw?JSON.parse(raw):{};data[name]=(data[name]||0)+1;sessionStorage.setItem(eventKey,JSON.stringify(data));window.dispatchEvent(new CustomEvent('alkohol-site-event',{detail:{name}}));}catch{}}
const takeaways={
  aju:{ru:'Главное: алкоголь действует на несколько мозговых систем одновременно; одна схема не предсказывает реакцию конкретного человека.',et:'Põhiidee: alkohol mõjutab korraga mitut ajusüsteemi; üks skeem ei ennusta konkreetse inimese reaktsiooni.'},
  teadmised:{ru:'Главное: тип исследования определяет, какой вывод допустим. Связь не равна доказанной причине.',et:'Põhiidee: uuringutüüp määrab, milline järeldus on lubatud. Seos ei võrdu tõestatud põhjusega.'},
  labor:{ru:'Главное: мини-игры показывают результат конкретной попытки и не измеряют опьянение, диагноз или способность водить.',et:'Põhiidee: minimängud näitavad ühe katse tulemust ega mõõda joovet, diagnoosi ega juhtimisvõimet.'},
  viktoriin:{ru:'Главное: полезно замечать не только ошибки, но и ответы, в которых ты был(а) уверен(а) и ошибся(лась).',et:'Põhiidee: kasulik on märgata mitte ainult vigu, vaid ka vastuseid, milles olid kindel ja siiski eksisid.'},
  tegevus:{ru:'Если ситуация касается тебя лично: в Эстонии Lasteabi 116 111 работает круглосуточно и бесплатно; при непосредственной опасности звони 112.',et:'Kui olukord puudutab sind isiklikult: Eestis töötab Lasteabi 116 111 ööpäev läbi ja tasuta; vahetu ohu korral helista 112.'}
};
export default function SiteEnhancements(){
  const [lang,setLang]=useState<Lang>(readLang);const [tick,setTick]=useState(0);const [metrics,setMetrics]=useState(readGameMetrics);
  useEffect(()=>{const timer=setTimeout(()=>setTick(v=>v+1),80);const observer=new MutationObserver(()=>setLang(document.documentElement.lang==='ru'?'ru':'et'));observer.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});const onMetrics=()=>setMetrics(readGameMetrics());window.addEventListener('alkohol-game-metrics',onMetrics);return()=>{clearTimeout(timer);observer.disconnect();window.removeEventListener('alkohol-game-metrics',onMetrics);};},[]);
  const ru=lang==='ru';void tick;
  const footer=document.querySelector<HTMLElement>('.site-footer');const worksheet=document.querySelector<HTMLElement>('.classroom-kit__worksheet-actions');const reaction=document.querySelector<HTMLElement>('.reaction-game');
  return <>{Object.entries(takeaways).map(([id,text])=>{const target=document.getElementById(id);return target?createPortal(<aside className="inline-takeaway" key={id}><strong>{ru?'Короткий вывод':'Lühijäreldus'}</strong><p>{ru?text.ru:text.et}</p></aside>,target):null})}{reaction&&metrics.reaction&&createPortal(<div className="reaction-series"><strong>{metrics.reaction.recentMs?.length??0}/5</strong><span>{metrics.reaction.medianMs?(ru?`Медиана последних 5 попыток: ${metrics.reaction.medianMs} мс`:`Viimase 5 katse mediaan: ${metrics.reaction.medianMs} ms`):(ru?'Сделай 5 попыток — сайт покажет медиану, устойчивее одной случайной реакции.':'Tee 5 katset — leht näitab mediaani, mis on ühest juhuslikust reaktsioonist stabiilsem.')}</span></div>,reaction)}{worksheet&&createPortal(<span className="worksheet-link-group"><a className="text-button worksheet-link" href="worksheet/et/" onClick={()=>track('worksheet_et_open')}>Tööleht A4</a><a className="text-button worksheet-link" href="worksheet/ru/" onClick={()=>track('worksheet_ru_open')}>Рабочий лист A4</a></span>,worksheet)}{footer&&createPortal(<div className="footer-support"><strong>{ru?'Помощь подросткам':'Abi noortele'}</strong><a href="tel:116111" onClick={()=>track('help_116111')}>Lasteabi 116 111</a><span>{ru?'круглосуточно · бесплатно':'ööpäev läbi · tasuta'}</span></div>,footer)}</>;
}
