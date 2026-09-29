import { useEffect, useState } from 'react';
import './entry-pages.css';

type Lang='et'|'ru';
type Page='start'|'teacher';
const languageKey='alkohol-ja-aju:language';

function initialLanguage():Lang { try{return localStorage.getItem(languageKey)==='ru'?'ru':'et';}catch{return'et';} }

export default function EntryPage({page}:{page:Page}){
  const [lang,setLang]=useState<Lang>(initialLanguage);
  const ru=lang==='ru';
  useEffect(()=>{document.documentElement.lang=lang;document.title=page==='start'?(ru?'Начать — Алкоголь и мозг':'Alusta — Alkohol ja aju'):(ru?'Для учителя — Алкоголь и мозг':'Õpetajale — Alkohol ja aju');},[lang,page,ru]);
  const switchLanguage=(next:Lang)=>{setLang(next);try{localStorage.setItem(languageKey,next);}catch{}};
  const start=page==='start';
  return <main className="entry-page"><header className="entry-header"><a href="../" className="entry-brand"><img src="../logo-mark.svg" alt=""/><span>{ru?'алкоголь и мозг':'alkohol ja aju'}</span></a><div className="entry-language" role="group" aria-label={ru?'Язык':'Keel'}><button onClick={()=>switchLanguage('et')} className={lang==='et'?'active':''}>ET</button><button onClick={()=>switchLanguage('ru')} className={lang==='ru'?'active':''}>RU</button></div></header><section className="entry-hero"><p className="entry-kicker">{start?(ru?'5 МИНУТ':'5 MINUTIT'):(ru?'ДЛЯ УРОКА · 45 МИНУТ':'TUNNIKS · 45 MINUTIT')}</p><h1>{start?(ru?'Начни с главного':'Alusta peamisest'):(ru?'Материалы для учителя':'Materjalid õpetajale')}</h1><p>{start?(ru?'Короткий маршрут, чтобы понять главное об алкоголе, мозге и безопасных решениях.':'Lühike teekond, et mõista alkoholi, aju ja turvaliste valikute põhiasju.'):(ru?'Готовая структура занятия: понятный вход, работа с фактами, обсуждение и рабочий лист.':'Valmis tunni struktuur: selge sissejuhatus, töö faktidega, arutelu ja tööleht.')}</p></section>{start?<section className="entry-grid">{[[ru?'1. Посмотри схему мозга':'1. Vaata ajuskeemi','../#aju'],[ru?'2. Проверь один факт':'2. Kontrolli üht fakti','../#teadmised'],[ru?'3. Выбери безопасное действие':'3. Vali turvaline tegevus','../#tegevus']].map(([title,href])=><a href={href} key={href}><strong>{title}</strong><span>{ru?'Открыть':'Ava'} →</span></a>)}</section>:<section className="entry-grid entry-grid-teacher">{[[ru?'План занятия':'Tunnikava','../#klassiruum'],[ru?'Рабочий лист на русском':'Tööleht vene keeles','../worksheet/ru/'],[ru?'Рабочий лист на эстонском':'Tööleht eesti keeles','../worksheet/et/']].map(([title,href])=><a href={href} key={href}><strong>{title}</strong><span>{ru?'Открыть':'Ava'} →</span></a>)}</section>}<section className="entry-note"><strong>{start?(ru?'Нужна помощь?':'Vajad abi?'):(ru?'Что подготовить':'Mida ette valmistada')}</strong><p>{start?(ru?'В Эстонии Lasteabi 116 111 работает круглосуточно и бесплатно. При непосредственной опасности звони 112.':'Eestis töötab Lasteabi 116 111 ööpäev läbi ja tasuta. Vahetu ohu korral helista 112.'):(ru?'Откройте материалы заранее и выберите рабочий лист по языку. Упражнения не оценивают здоровье и не предлагают употреблять алкоголь.':'Ava materjalid enne tundi ja vali tööleht keele järgi. Harjutused ei hinda tervist ega soovita alkoholi tarvitada.')}</p></section><a className="entry-back" href="../">← {ru?'На главную':'Avalehele'}</a></main>;
}
