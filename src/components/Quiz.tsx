import { useRef, useState } from 'react';
import type { Question } from '../data/content';
import { ProgressBar, ResultCard, SourceReference } from './Shared';
import { useStageFocus } from '../hooks/useStageFocus';
import { useQuizTool } from '../hooks/useQuizTool';

type Confidence='sure'|'unsure';

export function Quiz({questions,onComplete,onContinue,lang,sourceBase=''}:{questions:Question[];onComplete?:(score:number)=>void;onContinue?:()=>void;lang:'et'|'ru';sourceBase?:string}){
  const ru=lang==='ru';
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
    return <div className="quiz-card"><h3 ref={heading} tabIndex={-1}>{ru?'Твой результат':'Sinu tulemus'}: {score} / {questions.length}</h3><ResultCard title={ru?'Проверка знаний завершена':'Teadmiste kontroll on tehtud'} score={score} total={questions.length} lang={lang}><p>{confidentWrong>0?(ru?`Особенно полезно пересмотреть ${confidentWrong} ответ(а), где ты был(а) уверен(а), но ошибся(лась).`:`Eriti kasulik on üle vaadata ${confidentWrong} vastust, milles olid kindel, kuid eksisid.`):(ru?'Сравни результат с тем, насколько уверенно ты отвечал(а).':'Võrdle tulemust sellega, kui kindlalt vastasid.')}</p></ResultCard>{wrong.map(({q})=><p key={q.id}><a className="quiz-review-link" href={sourceBase+(topics[q.id]??("#allikas-"+q.refs[0]))}>{q.statement} · {ru?"Разобрать":"Vaata selgitust"}</a></p>)}<details><summary>{ru?'Посмотреть все ответы':'Vaata kõiki vastuseid'}</summary><ol className="answer-review">{questions.map((q,i)=><li key={q.id}><strong>{q.statement}</strong><p>{q.fact?(ru?'Факт':'Fakt'):(ru?'Миф':'Müüt')} · {answers[i]===q.fact?(ru?'Верно':'Õige'):(ru?'Неверно':'Vale')} · {confidence[i]==='sure'?(ru?'был(а) уверен(а)':'olid kindel'):(ru?'не был(а) уверен(а)':'polnud kindel')}. {q.explanation} <SourceReference ids={q.refs} lang={lang} base={sourceBase}/></p></li>)}</ol></details><button className="button primary" onClick={onContinue??reset}>{onContinue?(ru?"Завершить урок":"Lõpeta õpe"):ru?'Пройти ещё раз':'Proovi uuesti'}</button></div>;
  }

  const q=questions[index];
  const answered=answers[index]!==undefined;
  return <div className="quiz-card"><div className="quiz-top"><span className="pill">{ru?'МИФ ИЛИ ФАКТ?':'MÜÜT VÕI FAKT?'}</span><span>{index+1} / {questions.length}</span></div><ProgressBar value={answers.length} max={questions.length} label={ru?`${answers.length} из ${questions.length}`:`${answers.length}/${questions.length}`}/><h3 className="quiz-statement" ref={heading} tabIndex={-1}>{q.statement}</h3>{!answered&&<div className="quiz-confidence"><span>{ru?'Насколько ты уверен(а) перед ответом?':'Kui kindel oled enne vastamist?'}</span><div><button type="button" aria-pressed={currentConfidence==='sure'} className={currentConfidence==='sure'?'selected':''} onClick={()=>setCurrentConfidence('sure')}>{ru?'Уверен(а)':'Olen kindel'}</button><button type="button" aria-pressed={currentConfidence==='unsure'} className={currentConfidence==='unsure'?'selected':''} onClick={()=>setCurrentConfidence('unsure')}>{ru?'Не уверен(а)':'Pole kindel'}</button></div></div>}<div className="quiz-choices"><button className={'button '+(answers[index]===false?'selected':'')} disabled={answered||!currentConfidence} onClick={()=>answer(false)}>{ru?'МИФ':'MÜÜT'}</button><button className={'button '+(answers[index]===true?'selected':'')} disabled={answered||!currentConfidence} onClick={()=>answer(true)}>{ru?'ФАКТ':'FAKT'}</button></div>{answered&&<div className={'quiz-feedback '+(answers[index]===q.fact?'correct':'incorrect')} role="status"><strong>{answers[index]===q.fact?(ru?'Верно.':'Õige.'):(ru?'На этот раз ответ другой.':'Seekord läks teisiti.')} {q.fact?(ru?'Это факт.':'See on fakt.'):(ru?'Это миф.':'See on müüt.')}</strong><p>{q.explanation} <SourceReference ids={q.refs} lang={lang} base={sourceBase}/></p>{q.status!=='verified'&&<p>{q.status}</p>}</div>}{answered&&<button ref={nextRef} className="button primary next" onClick={next}>{index===questions.length-1?(ru?'Посмотреть результат':'Vaata tulemust'):(ru?'Следующее утверждение':'Järgmine väide')}</button>}</div>;
}
