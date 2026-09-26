import { useEffect, useState } from 'react';
import { Section } from './Shared';
import { readGameMetrics, type GameMetrics } from '../utils/gameMetrics';

type Lang='et'|'ru';

export default function FinalSummary({lang,quizScore,visitedIds,totalSections}:{lang:Lang;quizScore:number|null;visitedIds:string[];totalSections:number}){
  const ru=lang==='ru';
  const [metrics,setMetrics]=useState<GameMetrics>(()=>readGameMetrics());

  useEffect(()=>{
    const sync=()=>setMetrics(readGameMetrics());
    window.addEventListener('alkohol-game-metrics',sync);
    window.addEventListener('focus',sync);
    return()=>{
      window.removeEventListener('alkohol-game-metrics',sync);
      window.removeEventListener('focus',sync);
    };
  },[]);

  const visited=new Set(visitedIds);
  const games=[metrics.reaction,metrics.stroop,metrics.signal].filter(Boolean).length;
  const quizDone=quizScore!==null;
  const feedbackDone=visited.has('tagasiside');
  const routeDone=visitedIds.filter(id=>id!=='tagasiside').length>=totalSections-1;
  const nextHref=!quizDone?'#viktoriin':!feedbackDone?'#tagasiside':'#allikad';
  const nextLabel=!quizDone?(ru?'Завершить викторину':'Lõpeta viktoriin'):!feedbackDone?(ru?'Заполнить опрос':'Täida küsitlus'):(ru?'Открыть источники':'Ava allikad');

  return <Section id="isiklik-kokkuvote" number={ru?'09 / ТВОЙ ИТОГ':'09 / SINU KOKKUVÕTE'} title={ru?'Что ты уже прошёл(а)':'Mida oled juba teinud'} intro={ru?'Итог собирает только данные этой вкладки и не является медицинской оценкой.':'Kokkuvõte kasutab ainult selle vahelehe andmeid ega ole tervisehinnang.'} className="personal-summary">
    <div className="summary-stats">
      <article><span>{ru?'Этапы сайта':'Lehe etapid'}</span><strong>{visitedIds.length} / {totalSections}</strong><p>{routeDone&&feedbackDone?(ru?'Основной маршрут завершён':'Põhiteekond on läbitud'):(ru?'Открыто в этой сессии':'Avatud selles seansis')}</p></article>
      <article><span>{ru?'Мини-игры':'Minimängud'}</span><strong>{games} / 3</strong><p>{games===0?(ru?'Пока нет результатов':'Tulemusi veel pole'):(ru?'Результаты сохранены в этой вкладке':'Tulemused on selles vahelehes salvestatud')}</p></article>
      <article><span>{ru?'Викторина':'Viktoriin'}</span><strong>{quizScore===null?'—':`${quizScore} / 10`}</strong><p>{quizScore===null?(ru?'Ещё не завершена':'Veel lõpetamata'):(ru?'Последняя завершённая попытка':'Viimane lõpetatud katse')}</p></article>
    </div>

    <div className="summary-detail">
      <div>
        <h3>{ru?'Результаты мини-игр':'Minimängude tulemused'}</h3>
        {games===0?<p>{ru?'Если хочешь увидеть результаты здесь, пройди хотя бы одну игру в лаборатории.':'Kui soovid siin tulemusi näha, proovi vähemalt üht mängu mängulaboris.'}</p>:<ul>
          {metrics.reaction&&<li>{ru?'Реакция':'Reaktsioon'}: <strong>{metrics.reaction.latestMs} ms</strong> · {ru?'лучший результат':'parim tulemus'} {metrics.reaction.bestMs} ms</li>}
          {metrics.stroop&&<li>Stroop: <strong>{metrics.stroop.score}/{metrics.stroop.rounds}</strong> · {ru?'среднее время':'keskmine aeg'} {metrics.stroop.averageMs} ms</li>}
          {metrics.signal&&<li>{ru?'Последовательность':'Järjestus'}: <strong>{ru?'уровень':'tase'} {metrics.signal.reachedLength}</strong> · {metrics.signal.completed?(ru?'завершено':'läbitud'):(ru?'не завершено':'pooleli')}</li>}
        </ul>}
      </div>
      <div className="summary-next">
        <h3>{ru?'Последний шаг':'Viimane samm'}</h3>
        <p>{!quizDone?(ru?'Викторина ещё не завершена. Пройди её, чтобы итог показывал полный результат.':'Viktoriin on veel lõpetamata. Tee see läbi, et kokkuvõte näitaks täielikku tulemust.') : !feedbackDone?(ru?'Основной материал пройден. Осталось заполнить анонимный опрос.':'Põhimaterjal on läbitud. Jäänud on anonüümne küsitlus.') : (ru?'Основной маршрут завершён. Ниже осталась только библиография и научные источники.':'Põhiteekond on läbitud. Allpool on veel bibliograafia ja teadusallikad.')}</p>
        <a className="button" href={nextHref}>{nextLabel}</a>
      </div>
    </div>
  </Section>;
}
