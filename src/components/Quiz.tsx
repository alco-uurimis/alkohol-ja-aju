import { useRef, useState } from 'react';
import type { Question } from '../data/content';
import { ProgressBar, ResultCard, SourceReference } from './Shared';
import { useStageFocus } from '../hooks/useStageFocus';
import { useQuizTool } from '../hooks/useQuizTool';

type Confidence='sure'|'unsure';

const strings={
  et:{yourResult:'Sinu tulemus',finished:'Teadmiste kontroll on tehtud',confWrong:(n:number)=>`Eriti kasulik on üle vaadata ${n} vastust, milles olid kindel, kuid eksisid.`,compare:'Võrdle tulemust sellega, kui kindlalt vastasid.',explain:'Vaata selgitust',all:'Vaata kõiki vastuseid',fact:'Fakt',myth:'Müüt',right:'Õige',wrong:'Vale',sure:'olid kindel',unsure:'polnud kindel',finish:'Lõpeta õpe',again:'Proovi uuesti',pill:'MÜÜT VÕI FAKT?',progress:(a:number,t:number)=>`${a}/${t}`,howSure:'Kui kindel oled enne vastamist?',iAmSure:'Olen kindel',notSure:'Pole kindel',MYTH:'MÜÜT',FACT:'FAKT',correct:'Õige.',other:'Seekord läks teisiti.',isFact:'See on fakt.',isMyth:'See on müüt.',seeResult:'Vaata tulemust',nextStatement:'Järgmine väide'},
  ru:{yourResult:'Твой результат',finished:'Проверка знаний завершена',confWrong:(n:number)=>`Особенно полезно пересмотреть ${n} ответ(а), где ты был(а) уверен(а), но ошибся(лась).`,compare:'Сравни результат с тем, насколько уверенно ты отвечал(а).',explain:'Разобрать',all:'Посмотреть все ответы',fact:'Факт',myth:'Миф',right:'Верно',wrong:'Неверно',sure:'был(а) уверен(а)',unsure:'не был(а) уверен(а)',finish:'Завершить урок',again:'Пройти ещё раз',pill:'МИФ ИЛИ ФАКТ?',progress:(a:number,t:number)=>`${a} из ${t}`,howSure:'Насколько ты уверен(а) перед ответом?',iAmSure:'Уверен(а)',notSure:'Не уверен(а)',MYTH:'МИФ',FACT:'ФАКТ',correct:'Верно.',other:'На этот раз ответ другой.',isFact:'Это факт.',isMyth:'Это миф.',seeResult:'Посмотреть результат',nextStatement:'Следующее утверждение'},
  en:{yourResult:'Your result',finished:'Knowledge check complete',confWrong:(n:number)=>`It is especially worth reviewing the ${n} answer${n===1?'':'s'} where you were sure but got it wrong.`,compare:'Compare your result with how confident you were.',explain:'See the explanation',all:'See all answers',fact:'Fact',myth:'Myth',right:'Correct',wrong:'Incorrect',sure:'you were sure',unsure:'you were not sure',finish:'Finish the lesson',again:'Try again',pill:'MYTH OR FACT?',progress:(a:number,t:number)=>`${a} of ${t}`,howSure:'How sure are you before answering?',iAmSure:'I am sure',notSure:'Not sure',MYTH:'MYTH',FACT:'FACT',correct:'Correct.',other:'Not this time.',isFact:'This is a fact.',isMyth:'This is a myth.',seeResult:'See the result',nextStatement:'Next statement'},
} as const;

export function Quiz({questions,onComplete,onContinue,lang,sourceBase=''}:{questions:Question[];onComplete?:(score:number)=>void;onContinue?:()=>void;lang:'et'|'ru'|'en';sourceBase?:string}){
  const S=strings[lang];
  const [index,setIndex]=useState(0);
  const [answers,setAnswers]=useState<boolean[]>([]);
  const [confidence,setConfidence]=useState<Confidence[]>([]);
  const [currentConfidence,setCurrentConfidence]=useState<Confidence|null>(null);
  const [done,setDone]=useState(false);
  const locked=useRef(false);
  const heading=useStageFocus(done?'result':index);
  const nextRef=useRef<HTMLButtonElement>(null);
  const score=answers.reduce((sum,a,i)=>sum+Number(a===questions[i].fact),0);
  const confidentWrong=answers.reduce((sum,a,i)=>sum+Number(a!==questions[i].fact&&confidence[i]==='sure'),0);
  useQuizTool({question:done?null:questions[index].statement,position:index+1,total:questions.length,answered:answers[index]!==undefined,completed:done,score});

  const answer=(value:boolean)=>{
    if(locked.current||!currentConfidence)return;
    locked.current=true;
    setAnswers(a=>[...a,value]);
    setConfidence(c=>[...c,currentConfidence]);
    requestAnimationFrame(()=>nextRef.current?.focus({preventScroll:true}));
  };
  const next=()=>{
    if(answers[index]===undefined)return;
    if(index===questions.length-1){setDone(true);onComplete?.(score);}
    else{setIndex(i=>i+1);setCurrentConfidence(null);locked.current=false;}
  };
  const reset=()=>{setIndex(0);setAnswers([]);setConfidence([]);setCurrentConfidence(null);setDone(false);locked.current=false;};

  if(done){
    const wrong=questions.map((q,i)=>({q,i})).filter(({q,i})=>answers[i]!==q.fact);
    const topics: Record<string,string> = {blackout:'memory-blackouts/',recover:'memory-blackouts/',sleep:'alcohol-and-sleep/',driving:'alcohol-and-driving/',development:'adolescent-brain/',attention:'alcohol-and-driving/',reaction:'alcohol-and-driving/',decisions:'self-control/',gaba:'reward-and-habits/'};
    return <div className="quiz-card"><h3 ref={heading} tabIndex={-1}>{S.yourResult}: {score} / {questions.length}</h3><ResultCard title={S.finished} score={score} total={questions.length} lang={lang}><p>{confidentWrong>0?S.confWrong(confidentWrong):S.compare}</p></ResultCard>{wrong.map(({q})=><p key={q.id}><a className="quiz-review-link" href={sourceBase+(topics[q.id]??("#allikas-"+q.refs[0]))}>{q.statement} · {S.explain}</a></p>)}<details><summary>{S.all}</summary><ol className="answer-review">{questions.map((q,i)=><li key={q.id}><strong>{q.statement}</strong><p>{q.fact?S.fact:S.myth} · {answers[i]===q.fact?S.right:S.wrong} · {confidence[i]==='sure'?S.sure:S.unsure}. {q.explanation} <SourceReference ids={q.refs} lang={lang} base={sourceBase}/></p></li>)}</ol></details><button className="button primary" onClick={onContinue??reset}>{onContinue?S.finish:S.again}</button></div>;
  }

  const q=questions[index];
  const answered=answers[index]!==undefined;
  return <div className="quiz-card"><div className="quiz-top"><span className="pill">{S.pill}</span><span>{index+1} / {questions.length}</span></div><ProgressBar value={answers.length} max={questions.length} label={S.progress(answers.length,questions.length)}/><h3 className="quiz-statement" ref={heading} tabIndex={-1}>{q.statement}</h3>{!answered&&<div className="quiz-confidence"><span>{S.howSure}</span><div><button type="button" aria-pressed={currentConfidence==='sure'} className={currentConfidence==='sure'?'selected':''} onClick={()=>setCurrentConfidence('sure')}>{S.iAmSure}</button><button type="button" aria-pressed={currentConfidence==='unsure'} className={currentConfidence==='unsure'?'selected':''} onClick={()=>setCurrentConfidence('unsure')}>{S.notSure}</button></div></div>}<div className="quiz-choices"><button className={'button '+(answers[index]===false?'selected':'')} disabled={answered||!currentConfidence} onClick={()=>answer(false)}>{S.MYTH}</button><button className={'button '+(answers[index]===true?'selected':'')} disabled={answered||!currentConfidence} onClick={()=>answer(true)}>{S.FACT}</button></div>{answered&&<div className={'quiz-feedback '+(answers[index]===q.fact?'correct':'incorrect')} role="status"><strong>{answers[index]===q.fact?S.correct:S.other} {q.fact?S.isFact:S.isMyth}</strong><p>{q.explanation} <SourceReference ids={q.refs} lang={lang} base={sourceBase}/></p>{q.status!=='verified'&&<p>{q.status}</p>}</div>}{answered&&<button ref={nextRef} className="button primary next" onClick={next}>{index===questions.length-1?S.seeResult:S.nextStatement}</button>}</div>;
}
