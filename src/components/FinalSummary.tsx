import { useEffect, useState } from 'react';
import { Section } from './Shared';
import ProgressRing from './ProgressRing';
import { readGameMetrics, type GameMetrics } from '../utils/gameMetrics';

type Lang='et'|'ru';

export default function FinalSummary({lang,quizScore,visitedIds,totalSections,progressSaved,onSaveProgress,onClearSavedProgress}:{lang:Lang;quizScore:number|null;visitedIds:string[];totalSections:number;progressSaved:boolean;onSaveProgress:()=>void;onClearSavedProgress:()=>void}){
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
  const nextHref=quizDone?'#allikad':'#viktoriin';
  const nextLabel=quizDone?(ru?'Открыть источники':'Ava allikad'):(ru?'Завершить викторину':'Lõpeta viktoriin');

  return <Section id="isiklik-kokkuvote" number={ru?'15 / ТВОЙ ИТОГ':'15 / SINU KOKKUVÕTE'} title={ru?'Что ты уже прошёл(а)':'Mida oled juba teinud'} intro={progressSaved?(ru?'Прогресс разделов сохранён только в этом браузере на этом устройстве; это не медицинская оценка и не передаётся автору.':'Osade edenemine on salvestatud ainult selle seadme brauserisse; see ei ole tervisehinnang ega jõua autorini.'):(ru?'Итог собирает данные этой вкладки и не является медицинской оценкой.':'Kokkuvõte kasutab selle vahelehe andmeid ega ole tervisehinnang.')} className="personal-summary">
    <div className="summary-stats">
      <article><ProgressRing value={visitedIds.length} max={totalSections}/><span>{ru?'Этапы сайта':'Lehe etapid'}</span><strong>{visitedIds.length} / {totalSections}</strong><p>{ru?'Открытые разделы':'Avatud osad'}</p></article>
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
        <p>{quizDone?(ru?'Сформулируй один факт и назови одно ограничение исследования.':'Sõnasta üks fakt ja nimeta üks uuringu piirang.'):(ru?'Пройди викторину, чтобы проверить понимание.':'Kontrolli oma arusaamist viktoriiniga.')}</p>
        <a className="button" href={nextHref}>{nextLabel}</a> {quizDone&&<a href="#tagasiside">{ru?"Оставить отзыв (по желанию)":"Anna soovi korral tagasisidet"}</a>}
      </div>
    </div>
    <div className="summary-progress-controls"><div><h3>{ru?'Продолжить позже?':'Jätkata hiljem?'}</h3><p>{progressSaved?(ru?'Маршрут сохранён только локально в этом браузере. Игровые результаты по-прежнему остаются только в текущей вкладке.':'Teekond on salvestatud ainult selles brauseris. Mängutulemused jäävad endiselt vaid sellesse vahelehte.'):(ru?'Можно сохранить только открытые разделы на этом устройстве. Никакие данные не отправляются.':'Saad salvestada ainult avatud osad sellele seadmele. Andmeid ei saadeta kuhugi.')}</p></div>{progressSaved?<button type="button" className="text-button" onClick={onClearSavedProgress}>{ru?'Удалить сохранённый прогресс':'Kustuta salvestatud edenemine'}</button>:<button type="button" className="button" onClick={onSaveProgress}>{ru?'Сохранить прогресс на устройстве':'Salvesta edenemine seadmesse'}</button>}</div>
  </Section>;
}


