import RideScenario from '../components/RideScenario';
import { useState } from 'react';
import { Quiz } from '../components/Quiz';
import { ProgressBar } from '../components/Shared';
import { questionsEn } from '../data/content.en';
import { useStageFocus } from '../hooks/useStageFocus';

/** English versions of the lesson, teacher and help pages. Same markup and classes as the ET/RU pages in EntryPage.tsx. */

function BrainOverview() {
  return <>
    <figure className="lesson-brain">
      <img width="1024" height="731" src="../brain-anatomy.svg" alt="Side view of the brain. Colours mark regions of the cortex." />
      <figcaption>Memory, attention and decisions depend on the work of connected brain regions. <a href="https://commons.wikimedia.org/wiki/File:Lobes_of_the_brain_NL.svg">Henry Vandyke Carter / Mysid · Wikimedia Commons</a></figcaption>
    </figure>
    <ul className="lesson-facts">
      <li><strong>Memory</strong><p>A person can be conscious while new memories are stored poorly. This can happen during an alcohol-related memory blackout. <a href="../memory-blackouts/">Read more and see the source</a></p></li>
      <li><strong>Attention and reaction</strong><p>Alcohol can make it harder to divide attention and can slow reaction. How you feel is not a reliable guide to whether you can drive. <a href="../alcohol-and-driving/">Read more and see the source</a></p></li>
      <li><strong>Limits of the conclusion</strong><p>A meta-analysis found that adults’ working memory worsened on average under laboratory conditions. It does not predict the result for one individual. <a href="../acute-effects/">See the study</a></p></li>
    </ul>
  </>;
}

function Evidence() {
  return <>
    <p>Spinola and co-authors pooled 32 studies with 1,629 participants. They compared working memory after alcohol was given with control conditions.</p>
    <p>On average, task performance worsened, especially when information had to be held and processed. The result depended on the task and the dose.</p>
    <details><summary>What does “small to moderate effect” mean?</summary><p>In the meta-analysis the difference between conditions was about 0.3 standard deviations (g = −0.30). This is a measure of the average difference across tasks. It does not mean memory dropped by 30%.</p></details>
    <p>Write down what was compared and how working memory was measured. Then open the study card and check your answer.</p>
    <p><strong>Limit of the conclusion</strong> — the study measured adults’ task performance under controlled conditions. It cannot be used to assess the state of an individual teenager.</p>
    <a href="../acute-effects/">Study card and original source</a>
  </>;
}

function InterpretationExercise({ onChoice }: { onChoice: (correct: boolean) => void }) {
  const [choice, setChoice] = useState<number | null>(null);
  const options = ['Alcohol alone explains the difference.', 'The difference may be related to several factors.', 'The result can be used to judge anyone’s state.'];
  return <>
    <p>Two groups did a memory task. One scored lower on average and had slept less the night before. Which conclusion is justified?</p>
    <div className="lesson-options">{options.map((option, index) =>
      <button type="button" key={index} aria-pressed={choice === index} onClick={() => { setChoice(index); onChoice(index === 1); }}>{option}</button>
    )}</div>
    {choice !== null && <p role="status">{choice === 1
      ? 'Correct. Sleep is one factor that has to be taken into account before explaining the difference.'
      : 'The groups slept differently. Think about what that means for a conclusion about cause.'}</p>}
  </>;
}

export function LessonEn({ full }: { full: boolean }) {
  const titles = ['How alcohol affects the brain', 'Read the study', 'Check the conclusion', 'Myth or fact'];
  const stages = full ? titles : [titles[0], titles[3]];
  const [step, setStep] = useState(0);
  const [exerciseDone, setExerciseDone] = useState(false);
  const heading = useStageFocus(step);
  const done = step === stages.length;
  const quiz = step === stages.length - 1;
  const quizIds = full ? ['blackout', 'attention', 'reaction', 'decisions'] : ['blackout', 'attention'];
  const quizItems = questionsEn.filter(q => quizIds.includes(q.id));
  const advance = () => { setStep(c => c + 1); window.scrollTo({ top: 0 }); };
  return <section className="lesson-panel" aria-labelledby="lesson-step">
    <ProgressBar value={step} max={stages.length} label={`Steps completed ${step}/${stages.length}`} />
    <h2 id="lesson-step" ref={heading} tabIndex={-1}>{done ? 'Lesson complete' : stages[step]}</h2>
    {done ? <>
      <p>In your own words, state one fact you can explain and one limitation of the study.</p>
      <details><summary>See an example</summary><p>In the laboratory, adults’ working memory worsened on average after alcohol. This result cannot be used to assess the state of one teenager.</p></details>
      <div className="lesson-actions"><a className="button primary" href={full ? '../topics/' : '?mode=full'}>{full ? 'See the science topics' : 'Go deeper in 20 minutes'}</a><a href="../check/">Optional: anonymous before-and-after check</a></div>
    </> : quiz ? <>
      <p>First rate how sure you are. Then choose “myth” or “fact” and read the explanation.</p>
      <Quiz questions={quizItems} sourceBase="../" lang="en" onContinue={advance} />
    </> : <>
      {step === 0 && <BrainOverview />}
      {step === 1 && <Evidence />}
      {step === 2 && <InterpretationExercise onChoice={setExerciseDone} />}
      <div className="lesson-actions"><button className="button primary" type="button" onClick={advance} disabled={step === 2 && !exerciseDone}>Next</button></div>
    </>}
  </section>;
}

export function TeacherEn() {
  const plan: [string, string, string, string][] = [
    ['0–5', 'Framing the question', 'What do studies show about the effect of alcohol on the brain? Discuss examples and sources. Nobody has to share personal experience.', '../methodology/'],
    ['5–12', 'Explanation', 'Open the short lesson. Ask pairs to explain one brain function and give an example of how it is studied.', '../start/'],
    ['12–22', 'Working with a source', 'Read the working-memory study card. Write down what was compared, who was studied and where the conclusion ends.', '../acute-effects/'],
    ['22–32', 'A practical situation', 'In pairs, discuss a fictional case: after an event an acquaintance who has been drinking offers a lift. Draft a safe plan for getting home.', '../help/#what-would-you-do'],
    ['32–40', 'Knowledge check', 'Open the 20-minute lesson and its myth-or-fact quiz. Discuss why confidence in an answer can differ from the evidence.', '../start/?mode=full'],
    ['40–45', 'Worksheet', 'Ask students to name a fact with its source, one limitation and one concrete safe action. Assess these three parts separately.', '../worksheet/en/'],
  ];
  return <section className="lesson-panel">
    <h2>45-minute lesson plan</h2>
    <p>The aim of the lesson is to explain one scientific conclusion, name its limitation and choose a safe action in a fictional situation.</p>
    <ol className="teacher-plan">{plan.map(([time, title, description, href]) => <li key={time}><span>{time} min</span><div><h3><a href={href}>{title}</a></h3><p>{description}</p></div></li>)}</ol>
    <p>The worksheet is available in English, Estonian and Russian. The lesson, the science topics and the myth-or-fact quiz are available in English.</p>
    <div className="lesson-actions"><a className="button primary" href="../worksheet/en/">Worksheet A4 · EN</a><a href="../worksheet/et/">Worksheet A4 · ET</a><a href="../worksheet/ru/">Worksheet A4 · RU</a><a href="../en/classroom.html">Short plan for 15–20 minutes</a><a href="../check/">Before-and-after check for your class</a></div>
  </section>;
}

export function HelpEn() {
  return <section className="lesson-panel help-panel">
    <h2>If there is immediate danger</h2>
    <p>In Estonia call 112. Stay with the person and follow the dispatcher’s instructions.</p>
    <a className="button primary" href="tel:112">Call 112</a>
    <h2>If you need advice or want to talk</h2>
    <p>Lasteabi gives free advice around the clock in Estonian, Russian and English.</p>
    <div className="lesson-actions"><a className="button" href="tel:116111">Lasteabi 116 111</a><a href="https://www.lasteabi.ee/et/lasteabi-116111">Lasteabi website</a></div>
    <h2>If you are unsure whether a doctor is needed</h2>
    <p>The Poison Information Centre gives advice by phone on 16662. If the person does not wake up, breathes slowly or with difficulty, or does not respond, do not call there: dial 112 straight away.</p>
    <div className="lesson-actions"><a className="button" href="tel:16662">Call 16662</a><a href="https://www.16662.ee/">16662.ee</a></div>
    <h2>If your own or someone else’s drinking worries you</h2>
    <p>You can talk to a family doctor or school nurse. For young people there is information at noored.alkoinfo.ee and the Peaasi programme for ages 12–26 with mild to moderate difficulties (check the conditions at peaasi.ee).</p>
    <div className="lesson-actions"><a href="https://noored.alkoinfo.ee/">noored.alkoinfo.ee</a><a href="https://peaasi.ee/">peaasi.ee</a></div>
    <RideScenario lang="en" />
    <p><a href="../en/situations.html">More practical situations and other services</a></p>
  </section>;
}
