import { useEffect, useMemo, useState } from 'react';
import { useStageFocus } from './hooks/useStageFocus';
import { questions as questionsEt } from './data/content';
import { questionsEn } from './data/content.en';
import { getRu } from './data/ru';
import { isLang, LANGUAGE_KEY, readLang, type Lang } from './i18n';
import { newToken, PREPOST_ENDPOINT, PREPOST_ITEMS, readState, scoreOf, writeState, type Answers, type LocalState, type Phase, type PrePostId } from './prepost';
import './entry-pages.css';

const S = {
  et: {
    brand: 'Alkohol ja aju', title: 'Teadmiste kontroll: enne ja pärast', lang: 'Keel', home: '← Avalehele',
    intro: 'Kuus lühikest väidet. Tee kontroll enne õppetundi ja uuesti pärast seda, et näha, mida õppisid. See on õppeharjutus, mitte hinne ega tervisehinnang.',
    privacy: 'Kui nõustud, salvestatakse ainult juhuslik kood sinu brauseris, vastused kuue väite kohta, tulemus ja keel. Nime, e-posti, kooli ega kontot ei küsita ega seota. Kontrolli võib teha ka ilma midagi saatmata.',
    consent: 'Nõustun saatma oma anonüümsed vastused õppematerjali parandamiseks (valikuline)', startPre: 'Alusta kontrolli enne õppetundi',
    q: 'Väide', myth: 'Müüt', fact: 'Fakt', preTitle: 'Enne õppetundi', postTitle: 'Pärast õppetundi', answered: 'Vastatud', savePre: 'Salvesta vastused', seeResult: 'Vaata tulemust', needAll: 'Vasta kõigile väidetele.',
    betweenTitle: 'Vastused on salvestatud', betweenText: 'Nüüd tee õppetund. Kui oled valmis, tule siia tagasi ja tee sama kontroll uuesti.', l5: '5-minutiline õppetund', l20: '20-minutiline õppetund', lt: 'Teadusteemad', startPost: 'Tee kontroll pärast õppetundi',
    resultTitle: 'Sinu tulemus', before: 'Enne', after: 'Pärast', change: 'Muutus', correct: 'Õige', wrong: 'Vale', explanation: 'Selgitus',
    note: 'See on ühe inimese õppeharjutus: väike erinevus ei ütle midagi tervise ega võimete kohta.', reset: 'Alusta uuesti (uus kood)',
    sentYes: 'Anonüümsed vastused on saadetud.', sentNo: 'Saatmine ebaõnnestus. Tulemus jääb sellesse seadmesse.', sentDeclined: 'Vastuseid ei saadetud: tulemus jääb ainult sellesse seadmesse.', retry: 'Proovi saata uuesti', sending: 'Saadan…',
  },
  ru: {
    brand: 'Алкоголь и мозг', title: 'Проверка знаний: до и после', lang: 'Язык', home: '← На главную',
    intro: 'Шесть коротких утверждений. Пройди проверку до урока и ещё раз после него, чтобы увидеть, чему ты научился(ась). Это учебное упражнение, а не оценка и не оценка здоровья.',
    privacy: 'Если ты согласен(на), сохраняются только случайный код в твоём браузере, ответы на шесть утверждений, результат и язык. Имя, e-mail, школа и аккаунт не запрашиваются и не связываются. Проверку можно пройти и без отправки.',
    consent: 'Согласен(на) отправить анонимные ответы для улучшения материала (по желанию)', startPre: 'Начать проверку до урока',
    q: 'Утверждение', myth: 'Миф', fact: 'Факт', preTitle: 'До урока', postTitle: 'После урока', answered: 'Отвечено', savePre: 'Сохранить ответы', seeResult: 'Посмотреть результат', needAll: 'Ответь на все утверждения.',
    betweenTitle: 'Ответы сохранены', betweenText: 'Теперь пройди урок. Когда будешь готов(а), вернись сюда и пройди ту же проверку ещё раз.', l5: 'Урок за 5 минут', l20: 'Урок за 20 минут', lt: 'Научные темы', startPost: 'Пройти проверку после урока',
    resultTitle: 'Твой результат', before: 'До', after: 'После', change: 'Изменение', correct: 'Верно', wrong: 'Неверно', explanation: 'Объяснение',
    note: 'Это учебное упражнение для одного человека: небольшая разница ничего не говорит о здоровье или способностях.', reset: 'Начать заново (новый код)',
    sentYes: 'Анонимные ответы отправлены.', sentNo: 'Отправка не удалась. Результат остаётся только на этом устройстве.', sentDeclined: 'Ответы не отправлялись: результат остаётся только на этом устройстве.', retry: 'Повторить отправку', sending: 'Отправляю…',
  },
  en: {
    brand: 'Alcohol and the brain', title: 'Knowledge check: before and after', lang: 'Language', home: '← Home',
    intro: 'Six short statements. Take the check before the lesson and again after it, to see what you learned. This is a learning exercise, not a grade or a health assessment.',
    privacy: 'If you agree, only a random code in your browser, your answers to the six statements, the score and the language are stored. No name, e-mail, school or account is asked for or linked. You can also take the check without sending anything.',
    consent: 'I agree to send my anonymous answers to help improve the material (optional)', startPre: 'Start the check before the lesson',
    q: 'Statement', myth: 'Myth', fact: 'Fact', preTitle: 'Before the lesson', postTitle: 'After the lesson', answered: 'Answered', savePre: 'Save my answers', seeResult: 'See the result', needAll: 'Please answer every statement.',
    betweenTitle: 'Your answers are saved', betweenText: 'Now do the lesson. When you are ready, come back here and take the same check again.', l5: '5-minute lesson', l20: '20-minute lesson', lt: 'Science topics', startPost: 'Take the check after the lesson',
    resultTitle: 'Your result', before: 'Before', after: 'After', change: 'Change', correct: 'Correct', wrong: 'Incorrect', explanation: 'Explanation',
    note: 'This is a learning exercise for one person: a small difference says nothing about health or ability.', reset: 'Start again (new code)',
    sentYes: 'Anonymous answers were sent.', sentNo: 'Sending failed. The result stays on this device only.', sentDeclined: 'Answers were not sent: the result stays on this device only.', retry: 'Try sending again', sending: 'Sending…',
  },
} as const;

const lessonLinks = (en: boolean) => en ? { l5: '../start/?lang=en', l20: '../start/?mode=full&lang=en', lt: '../topics/?lang=en' } : { l5: '../start/', l20: '../start/?mode=full', lt: '../topics/' };

async function send(state: LocalState, phase: Phase, lang: Lang): Promise<boolean> {
  const record = state[phase];
  if (!record) return false;
  try {
    const r = await fetch(PREPOST_ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: state.token, phase, lang, answers: record.answers }) });
    const body = await r.json().catch(() => null);
    return r.ok && body?.ok === true;
  } catch { return false; }
}

function Statements({ lang, order, answers, setAnswers, t }: { lang: Lang; order: PrePostId[]; answers: Answers; setAnswers: (a: Answers) => void; t: (typeof S)[Lang] }) {
  const items = useMemo(() => {
    const source = lang === 'ru' ? getRu().questionsRu : lang === 'en' ? questionsEn : questionsEt;
    return order.map(id => source.find(q => q.id === id)!);
  }, [lang, order]);
  return <ol className="check-list">{items.map((q, i) => (
    <li key={q.id}>
      <fieldset>
        <legend><span className="check-q">{t.q} {i + 1}</span> {q.statement}</legend>
        <div className="lesson-options">
          <button type="button" aria-pressed={answers[q.id as PrePostId] === false} onClick={() => setAnswers({ ...answers, [q.id]: false })}>{t.myth}</button>
          <button type="button" aria-pressed={answers[q.id as PrePostId] === true} onClick={() => setAnswers({ ...answers, [q.id]: true })}>{t.fact}</button>
        </div>
      </fieldset>
    </li>
  ))}</ol>;
}

const shuffled = (): PrePostId[] => { const a = [...PREPOST_ITEMS]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export default function CheckPage() {
  const [lang, setLangState] = useState<Lang>(readLang);
  const t = S[lang];
  const [state, setState] = useState<LocalState | null>(readState);
  const [consent, setConsent] = useState(false);
  const [phaseOpen, setPhaseOpen] = useState<Phase | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [needAll, setNeedAll] = useState(false);
  const [sending, setSending] = useState(false);
  const order = useMemo(shuffled, [phaseOpen]);
  const stage = phaseOpen ? phaseOpen : !state?.pre ? 'intro' : !state.post ? 'between' : 'results';
  const heading = useStageFocus(stage);

  useEffect(() => {
    document.documentElement.lang = lang; document.title = t.title;
    try { localStorage.setItem(LANGUAGE_KEY, lang); } catch { /* ignore */ }
  }, [lang, t.title]);
  const setLang = (l: Lang) => { const url = new URL(location.href); url.searchParams.set('lang', l); history.replaceState(null, '', url); setLangState(l); };

  const persist = (s: LocalState) => { setState(s); writeState(s); };
  const begin = (phase: Phase) => {
    setAnswers({}); setNeedAll(false); setPhaseOpen(phase);
    if (phase === 'pre') persist({ token: newToken(), consent, ...(state?.pre ? {} : {}) });
    window.scrollTo({ top: 0 });
  };
  const submit = async () => {
    if (!phaseOpen || !state) return;
    if (PREPOST_ITEMS.some(id => answers[id] === undefined)) { setNeedAll(true); return; }
    const record = { answers, score: scoreOf(answers), sent: state.consent ? ('no' as const) : ('declined' as const) };
    let next: LocalState = { ...state, [phaseOpen]: record };
    persist(next);
    const phase = phaseOpen;
    setPhaseOpen(null);
    window.scrollTo({ top: 0 });
    if (state.consent) {
      setSending(true);
      const ok = await send(next, phase, lang);
      next = { ...next, [phase]: { ...record, sent: ok ? 'yes' : 'no' } };
      persist(next); setSending(false);
    }
  };
  const retry = async () => {
    if (!state) return; setSending(true);
    let next = state;
    for (const phase of ['pre', 'post'] as const) if (next[phase] && next[phase]!.sent === 'no') { const ok = await send(next, phase, lang); next = { ...next, [phase]: { ...next[phase]!, sent: ok ? 'yes' : 'no' } }; }
    persist(next); setSending(false);
  };
  const reset = () => { writeState(null); setState(null); setConsent(false); setPhaseOpen(null); window.scrollTo({ top: 0 }); };

  const links = lessonLinks(lang === 'en');
  const unsent = !!state && (state.pre?.sent === 'no' || state.post?.sent === 'no');
  const status = state && (
    state.consent
      ? (sending ? t.sending : unsent ? <>{t.sentNo} <button type="button" className="text-button" onClick={retry}>{t.retry}</button></> : (state.pre?.sent === 'yes' || state.post?.sent === 'yes') ? t.sentYes : '')
      : (state.pre ? t.sentDeclined : '')
  );

  return <div className="entry-page">
    <header className="entry-header">
      <a href="../" className="entry-brand"><img src="../logo-mark.svg" alt="" /><span>{t.brand}</span></a>
      <div className="entry-language" role="group" aria-label={t.lang}>
        {(['et', 'ru', 'en'] as const).map(l => <button key={l} type="button" aria-pressed={lang === l} className={lang === l ? 'active' : ''} onClick={() => { if (isLang(l)) { if (l === 'ru') import('./data/ru').then(m => m.loadRu()).then(() => setLang('ru')); else setLang(l); } }}>{l.toUpperCase()}</button>)}
      </div>
    </header>
    <main>
      <div className="entry-hero"><h1>{t.title}</h1></div>
      <section className="lesson-panel" aria-labelledby="check-step">
        {stage === 'intro' && <>
          <h2 id="check-step" ref={heading} tabIndex={-1}>{t.preTitle}</h2>
          <p>{t.intro}</p><p>{t.privacy}</p>
          <label className="check-consent"><input id="check-consent" type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /> <span>{t.consent}</span></label>
          <div className="lesson-actions"><button type="button" className="button primary" onClick={() => begin('pre')}>{t.startPre}</button></div>
        </>}
        {(stage === 'pre' || stage === 'post') && <>
          <h2 id="check-step" ref={heading} tabIndex={-1}>{stage === 'pre' ? t.preTitle : t.postTitle}</h2>
          <p role="status">{t.answered}: {PREPOST_ITEMS.filter(id => answers[id] !== undefined).length} / {PREPOST_ITEMS.length}</p>
          <Statements lang={lang} order={order} answers={answers} setAnswers={a => { setAnswers(a); setNeedAll(false); }} t={t} />
          {needAll && <p role="alert" className="check-need">{t.needAll}</p>}
          <div className="lesson-actions"><button type="button" className="button primary" onClick={submit}>{stage === 'pre' ? t.savePre : t.seeResult}</button></div>
        </>}
        {stage === 'between' && <>
          <h2 id="check-step" ref={heading} tabIndex={-1}>{t.betweenTitle}</h2>
          <p>{t.betweenText}</p>
          <div className="lesson-actions"><a className="button" href={links.l5}>{t.l5}</a><a className="button" href={links.l20}>{t.l20}</a><a href={links.lt}>{t.lt}</a></div>
          <div className="lesson-actions"><button type="button" className="button primary" onClick={() => begin('post')}>{t.startPost}</button></div>
          {status && <p className="check-status" role="status">{status}</p>}
        </>}
        {stage === 'results' && state?.pre && state.post && <>
          <h2 id="check-step" ref={heading} tabIndex={-1}>{t.resultTitle}</h2>
          <p className="check-scores"><span>{t.before}: <b>{state.pre.score} / {PREPOST_ITEMS.length}</b></span> <span>{t.after}: <b>{state.post.score} / {PREPOST_ITEMS.length}</b></span> <span>{t.change}: <b>{state.post.score - state.pre.score > 0 ? '+' : ''}{state.post.score - state.pre.score}</b></span></p>
          <ol className="check-list">{(lang === 'ru' ? getRu().questionsRu : lang === 'en' ? questionsEn : questionsEt).filter(q => (PREPOST_ITEMS as readonly string[]).includes(q.id)).map(q => {
            const id = q.id as PrePostId; const pre = state.pre!.answers[id] === q.fact; const post = state.post!.answers[id] === q.fact;
            return <li key={q.id}><strong>{q.statement}</strong><p>{q.fact ? t.fact : t.myth} · {t.before}: {pre ? t.correct : t.wrong} · {t.after}: {post ? t.correct : t.wrong}</p><p><em>{t.explanation}:</em> {q.explanation}</p></li>;
          })}</ol>
          <p>{t.note}</p>
          {status && <p className="check-status" role="status">{status}</p>}
          <div className="lesson-actions"><button type="button" className="button" onClick={reset}>{t.reset}</button></div>
        </>}
      </section>
      <a className="entry-back" href="../">{t.home}</a>
    </main>
  </div>;
}
