import { useEffect, useMemo, useState } from 'react';
import './articles.css';

type Lang = 'et' | 'ru';

type Article = {
  id: string;
  source: string;
  title: Record<Lang, string>;
  lead: Record<Lang, string>;
  question: Record<Lang, string>;
  answer: Record<Lang, string>;
  measured: Record<Lang, string>;
  found: Record<Lang, string>;
  limits: Record<Lang, string>;
  citation: string;
  url: string;
};

const articles: Article[] = [
  {
    id: 'acute-effects', source: 'Spinola et al., 2022',
    title: {ru: 'Острое воздействие: рабочая память', et: 'Äge mõju: töömälu'},
    lead: {ru: 'Что происходит, когда нужно удерживать информацию в уме и одновременно с ней работать?', et: 'Mis juhtub siis, kui tuleb infot korraga meeles hoida ja sellega töötada?'},
    question: {ru: 'Влияет ли алкоголь на рабочую память?', et: 'Kas alkohol mõjutab töömälu?'},
    answer: {ru: 'В лабораторных исследованиях острое воздействие алкоголя статистически ухудшало рабочую память, особенно задачи, где нужно не только удерживать, но и преобразовывать информацию.', et: 'Laboriuuringutes halvendas alkoholi äge toime statistiliselt töömälu, eriti ülesandeid, kus infot ei tulnud ainult meeles hoida, vaid ka töödelda.'},
    measured: {ru: 'Авторы объединили 32 контролируемых исследования с 1 629 здоровыми взрослыми. В них сравнивали выполнение задач после известной дозы алкоголя и в контрольных условиях.', et: 'Autorid ühendasid 32 kontrollitud uuringut 1629 terve täiskasvanuga. Võrreldi ülesannete sooritust teadaoleva alkoholidoosi järel ja kontrolltingimustes.'},
    found: {ru: 'Средний эффект был небольшим–умеренным, но статистически убедительным. Он различался в зависимости от типа задания и дозы.', et: 'Keskmine efekt oli väike kuni mõõdukas, kuid statistiliselt usaldusväärne. See erines ülesande tüübi ja annuse järgi.'},
    limits: {ru: 'Это не тест для определения состояния конкретного человека. Работа изучала взрослых в контролируемых условиях; веб-игра не измеряет алкогольное опьянение.', et: 'See ei ole test ühe konkreetse inimese seisundi määramiseks. Uuring käsitles täiskasvanuid kontrollitud tingimustes; veebimäng ei mõõda alkoholijoovet.'},
    citation: 'Psychopharmacology, 2022 · systematic review and meta-analysis', url: 'https://pubmed.ncbi.nlm.nih.gov/35075512/'
  },
  {
    id: 'memory-blackouts', source: 'NIAAA · Alcohol-Induced Blackouts',
    title: {ru: 'Память и провалы памяти', et: 'Mälu ja mälulüngad'},
    lead: {ru: 'Почему человек может говорить и действовать, но позже не помнить события?', et: 'Miks võib inimene rääkida ja tegutseda, kuid hiljem sündmusi mitte mäletada?'},
    question: {ru: 'Провал памяти — это потеря сознания?', et: 'Kas mälulünk tähendab teadvuse kaotust?'},
    answer: {ru: 'Нет. Во время алкогольного провала памяти человек может оставаться в сознании, но новые эпизодические воспоминания формируются плохо или не формируются.', et: 'Ei. Alkoholist tingitud mälulünga ajal võib inimene olla teadvusel, kuid uusi episoodilisi mälestusi talletub halvasti või ei talletu üldse.'},
    measured: {ru: 'Объяснение опирается на исследования формирования памяти и на данные о связи быстро растущей концентрации алкоголя в крови с риском провалов памяти.', et: 'Selgitus toetub mälestuste kujunemise uuringutele ning andmetele kiiresti tõusva vere alkoholisisalduse ja mälulünkade riski seose kohta.'},
    found: {ru: 'Ключевой момент — запись новых событий, а не попытка позже «вспомнить лучше». Если воспоминание не закрепилось, подсказка не всегда поможет его восстановить.', et: 'Oluline on uute sündmuste talletamine, mitte hilisem püüd „paremini meenutada“. Kui mälestus ei kinnistunud, ei pruugi vihje seda taastada.'},
    limits: {ru: 'Люди различаются по чувствительности, дозе, скорости употребления и другим факторам. Нельзя по одному эпизоду или упражнению сделать медицинский вывод.', et: 'Inimeste tundlikkus, annus, tarvitamise kiirus ja muud tegurid erinevad. Ühe episoodi või harjutuse põhjal ei saa teha meditsiinilist järeldust.'},
    citation: 'National Institute on Alcohol Abuse and Alcoholism · evidence summary', url: 'https://www.niaaa.nih.gov/publications/brochures-and-fact-sheets/interrupted-memories-alcohol-induced-blackouts'
  },
  {
    id: 'adolescent-brain', source: 'Karoly et al., 2024',
    title: {ru: 'Подростковый мозг: что показывают большие выборки', et: 'Nooruki aju: mida näitavad suured valimid'},
    lead: {ru: 'Как современные исследования связывают употребление алкоголя и структуру мозга?', et: 'Kuidas seostavad tänapäevased uuringud alkoholi tarvitamist ja aju struktuuri?'},
    question: {ru: 'Можно ли по снимку мозга предсказать судьбу человека?', et: 'Kas ajuuuringu põhjal saab ennustada ühe inimese tulevikku?'},
    answer: {ru: 'Нет. Обзор крупных нейровизуализационных исследований описывает статистические связи между употреблением алкоголя в подростковом возрасте и различиями объёма или толщины некоторых областей мозга.', et: 'Ei. Suurte neurokuvamise uuringute ülevaade kirjeldab statistilisi seoseid noorukiea alkoholi tarvitamise ning mõne ajupiirkonna mahu või paksuse erinevuste vahel.'},
    measured: {ru: 'Систематический обзор включил 27 исследований больших консорциумов, включая ABCD, ENIGMA, NCANDA и IMAGEN; девять работ рассматривали подростков.', et: 'Süstemaatiline ülevaade hõlmas 27 suurte konsortsiumide uuringut, sealhulgas ABCD, ENIGMA, NCANDA ja IMAGEN; üheksa tööd käsitlesid noorukeid.'},
    found: {ru: 'Авторы обнаружили повторяющиеся связи с меньшим объёмом или толщиной в ряде областей, но результаты неодинаковы между регионами и исследованиями.', et: 'Autorid leidsid korduvaid seoseid väiksema mahu või paksusega mitmes piirkonnas, kuid tulemused ei olnud piirkondade ja uuringute vahel ühesugused.'},
    limits: {ru: 'Наблюдательные данные не доказывают, что алкоголь в одиночку вызвал каждое различие: важны исходные особенности, среда, сон, психическое здоровье и другие факторы.', et: 'Vaatlusandmed ei tõesta, et alkohol üksi põhjustas iga erinevuse: olulised on algsed eripärad, keskkond, uni, vaimne tervis ja muud tegurid.'},
    citation: 'Addiction Biology, 2024 · systematic review', url: 'https://pubmed.ncbi.nlm.nih.gov/39317645/'
  },
  {
    id: 'self-control', source: 'McPhee et al., 2023',
    title: {ru: 'Самоконтроль и торможение реакции', et: 'Enesekontroll ja reaktsiooni pidurdamine'},
    lead: {ru: 'Почему «знать правильный ответ» не всегда значит успеть остановиться?', et: 'Miks ei tähenda „õige vastuse teadmine“ alati, et jõuad end peatada?'},
    question: {ru: 'Меняет ли алкоголь способность остановить автоматическое действие?', et: 'Kas alkohol muudab võimet automaatset tegevust peatada?'},
    answer: {ru: 'Метаанализ лабораторных исследований показал ухудшение торможения реакции после острого воздействия алкоголя.', et: 'Laboriuuringute metaanalüüs näitas reaktsiooni pidurdamise halvenemist pärast alkoholi ägedat toimet.'},
    measured: {ru: 'Авторы объединили исследования с задачами Go/No-Go и Stop Signal: участник должен быстро реагировать, но вовремя остановиться при определённом сигнале.', et: 'Autorid ühendasid Go/No-Go ja Stop Signal ülesannetega uuringud: osaleja peab kiiresti reageerima, kuid kindla signaali korral õigel ajal peatuma.'},
    found: {ru: 'Общий эффект был отрицательным; более высокие концентрации алкоголя были связаны с более выраженным ухудшением в части задач.', et: 'Üldine efekt oli kahjulik; kõrgem alkoholikontsentratsioon seostus osas ülesannetes tugevama halvenemisega.'},
    limits: {ru: 'Это измерение одной когнитивной функции в лаборатории. Оно не определяет характер человека, диагноз или его способность безопасно водить автомобиль.', et: 'See mõõdab laboris üht kognitiivset funktsiooni. See ei määra inimese iseloomu, diagnoosi ega autojuhtimise ohutust.'},
    citation: 'Neuroscience & Biobehavioral Reviews, 2023 · meta-analysis', url: 'https://pubmed.ncbi.nlm.nih.gov/37277010/'
  },
  {
    id: 'alcohol-and-sleep', source: 'Kolla et al., 2018',
    title: {ru: 'Алкоголь, сон и дыхание', et: 'Alkohol, uni ja hingamine'},
    lead: {ru: 'Почему более быстрое засыпание не означает более качественный сон?', et: 'Miks ei tähenda kiirem uinumine paremat und?'},
    question: {ru: 'Как алкоголь связан с дыханием во сне?', et: 'Kuidas on alkohol seotud uneaegse hingamisega?'},
    answer: {ru: 'В метаанализе контролируемых исследований после алкоголя в среднем возрастало число эпизодов нарушенного дыхания во сне и немного снижалась средняя насыщенность крови кислородом.', et: 'Kontrollitud uuringute metaanalüüsis suurenes pärast alkoholi tarvitamist keskmiselt uneaegsete hingamishäirete episoodide arv ning vere keskmine hapnikuküllastus veidi langes.'},
    measured: {ru: 'Авторы объединили 14 исследований с 422 участниками. Сравнивали объективные показатели дыхания и кислорода во сне до и после приёма алкоголя.', et: 'Autorid ühendasid 14 uuringut 422 osalejaga. Võrreldi uneaegse hingamise ja hapnikusisalduse objektiivseid näitajaid enne ja pärast alkoholi tarvitamist.'},
    found: {ru: 'Эффект был заметнее у людей, которые храпят, и у участников с обструктивным апноэ сна. Это согласуется с тем, что алкоголь может ухудшать уже существующие нарушения дыхания во сне.', et: 'Mõju oli suurem norskavatel inimestel ja obstruktiivse uneapnoega osalejatel. See sobib järeldusega, et alkohol võib olemasolevaid uneaegseid hingamishäireid süvendada.'},
    limits: {ru: 'Обзор не означает, что у каждого человека после одной порции возникнет апноэ сна. Риск зависит от особенностей дыхания, дозы, времени употребления и состояния здоровья.', et: 'Ülevaade ei tähenda, et igal inimesel tekib pärast üht alkoholiannust uneapnoe. Risk sõltub hingamise eripäradest, annusest, tarvitamise ajast ja terviseseisundist.'},
    citation: 'Sleep Medicine Reviews, 2018 · systematic review and meta-analysis', url: 'https://pubmed.ncbi.nlm.nih.gov/30017492/'
  },
  {
    id: 'alcohol-and-driving', source: 'NHTSA · Drunk Driving',
    title: {ru: 'Алкоголь и вождение: почему нельзя судить по самочувствию', et: 'Alkohol ja autojuhtimine: miks enesetunde järgi ei saa otsustada'},
    lead: {ru: 'Почему ощущение бодрости не гарантирует безопасную реакцию за рулём?', et: 'Miks ei taga erksuse tunne roolis ohutut reageerimist?'},
    question: {ru: 'Может ли человек сам надёжно оценить безопасность вождения после алкоголя?', et: 'Kas inimene saab pärast alkoholi tarvitamist ise usaldusväärselt hinnata autojuhtimise ohutust?'},
    answer: {ru: 'Нет. Алкоголь может одновременно влиять на реакцию, обработку информации, координацию и принятие решений. Поэтому субъективное ощущение контроля не является проверкой безопасности.', et: 'Ei. Alkohol võib korraga mõjutada reaktsiooni, infotöötlust, koordinatsiooni ja otsustamist. Seetõttu ei ole subjektiivne kontrollitunne ohutuse kontroll.'},
    measured: {ru: 'Материал NHTSA обобщает данные о том, как алкоголь влияет на навыки, нужные для вождения: внимание, зрительную обработку, скорость реакции и координацию.', et: 'NHTSA materjal võtab kokku andmeid alkoholi mõjust autojuhtimiseks vajalikele oskustele: tähelepanule, visuaalsele infotöötlusele, reaktsioonikiirusele ja koordinatsioonile.'},
    found: {ru: 'Важен не один навык, а их сочетание. Даже учебная задача на реакцию не показывает, может ли конкретный человек безопасно управлять автомобилем.', et: 'Oluline ei ole üks oskus, vaid nende koosmõju. Isegi õppeotstarbeline reaktsiooniülesanne ei näita, kas konkreetne inimene saab autot ohutult juhtida.'},
    limits: {ru: 'Это образовательное объяснение, а не способ рассчитать личный риск или определить, когда можно садиться за руль. Безопасное решение — не водить после употребления алкоголя.', et: 'See on hariv selgitus, mitte viis isikliku riski arvutamiseks või rooli istumise aja määramiseks. Ohutu otsus on pärast alkoholi tarvitamist mitte juhtida.'},
    citation: 'National Highway Traffic Safety Administration · evidence summary', url: 'https://www.nhtsa.gov/risky-driving/drunk-driving'
  },
  {
    id: 'reward-and-habits', source: 'NIAAA · The Brain in Addiction and Recovery',
    title: {ru: 'Система вознаграждения и привычки', et: 'Tasustamissüsteem ja harjumused'},
    lead: {ru: 'Как удовольствие, обучение и сигналы среды могут связываться с алкоголем?', et: 'Kuidas võivad nauding, õppimine ja keskkonnamärgid alkoholiga seostuda?'},
    question: {ru: 'Почему алкогольные сигналы могут становиться значимыми?', et: 'Miks võivad alkoholiga seotud märgid muutuda tähenduslikuks?'},
    answer: {ru: 'Алкоголь может активировать системы вознаграждения. Дофамин участвует в обучении связям между эффектом алкоголя и людьми, местами или ситуациями, в которых он употреблялся.', et: 'Alkohol võib aktiveerida tasustamissüsteeme. Dopamiin osaleb seoste õppimises alkoholi toime ning inimeste, kohtade või olukordade vahel, kus seda tarvitati.'},
    measured: {ru: 'Страница NIAAA обобщает нейробиологические исследования систем вознаграждения, привычек, стресса и самоконтроля при расстройстве, связанном с употреблением алкоголя.', et: 'NIAAA leht võtab kokku neurobioloogilisi uuringuid tasu, harjumuste, stressi ja enesekontrolli süsteemidest alkoholi tarvitamise häire korral.'},
    found: {ru: 'Повторяющееся тяжёлое употребление может сопровождаться переходом от поиска награды к привычному поведению и попыткам уменьшить неприятные состояния. Это один из научных механизмов, а не описание каждого человека.', et: 'Korduva rohke tarvitamisega võib kaasneda üleminek tasu otsimiselt harjumuspärasele käitumisele ja ebameeldivate seisundite leevendamise katsetele. See on üks teaduslik mehhanism, mitte iga inimese kirjeldus.'},
    limits: {ru: 'Дофамин не равен «гормону удовольствия», а схема не означает, что зависимость развивается у каждого. На риск влияют биологические, психологические и социальные факторы.', et: 'Dopamiin ei võrdu „naudinguhormooniga“ ning skeem ei tähenda, et sõltuvus kujuneb kõigil. Riski mõjutavad bioloogilised, psühholoogilised ja sotsiaalsed tegurid.'},
    citation: 'National Institute on Alcohol Abuse and Alcoholism · evidence summary', url: 'https://www.niaaa.nih.gov/health-professionals-communities/core-resource-on-alcohol/neuroscience-brain-addiction-and-recovery'
  },
  {
    id: 'recovery-and-brain', source: 'Powell et al., 2024',
    title: {ru: 'Восстановление когнитивных функций', et: 'Kognitiivsete funktsioonide taastumine'},
    lead: {ru: 'Что известно о мышлении и памяти после прекращения употребления при алкогольном расстройстве?', et: 'Mida teatakse mõtlemise ja mälu kohta pärast tarvitamise lõpetamist alkoholi tarvitamise häire korral?'},
    question: {ru: 'Может ли часть когнитивных функций улучшаться при воздержании?', et: 'Kas osa kognitiivseid funktsioone võib karskuse ajal paraneda?'},
    answer: {ru: 'Систематический обзор продольных исследований описывает улучшения некоторых когнитивных функций при воздержании, но скорость и полнота восстановления различаются между функциями и людьми.', et: 'Pikisuunaliste uuringute süstemaatiline ülevaade kirjeldab mõne kognitiivse funktsiooni paranemist karskuse ajal, kuid taastumise kiirus ja täielikkus erinevad funktsioonide ja inimeste vahel.'},
    measured: {ru: 'Авторы рассматривали исследования взрослых с расстройством, связанным с употреблением алкоголя, в которых когнитивные показатели измеряли повторно после начала воздержания.', et: 'Autorid käsitlesid alkoholi tarvitamise häirega täiskasvanute uuringuid, kus kognitiivseid näitajaid mõõdeti korduvalt pärast karskuse algust.'},
    found: {ru: 'В литературе есть основания говорить о возможном восстановлении части функций, но для разных навыков сроки неодинаковы, а данные по некоторым областям всё ещё ограничены.', et: 'Kirjanduses on alust rääkida osa funktsioonide võimalikust taastumisest, kuid eri oskuste ajakava ei ole sama ning mõne valdkonna andmed on endiselt piiratud.'},
    limits: {ru: 'Это не обещание одинакового восстановления и не руководство по лечению. Участники исследований — взрослые с диагностированным расстройством; индивидуальную помощь планируют со специалистом.', et: 'See ei ole lubadus ühesugusest taastumisest ega ravijuhis. Uuringute osalejad olid diagnoositud häirega täiskasvanud; individuaalset abi planeeritakse koos spetsialistiga.'},
    citation: 'PLOS ONE, 2024 · systematic review of longitudinal studies', url: 'https://pubmed.ncbi.nlm.nih.gov/38166127/'
  }
];

function articleFromPath(){
  const path = window.location.pathname;
  return articles.find(article => path.includes(article.id)) ?? articles[0];
}

export default function ArticleApp(){
  const [lang, setLang] = useState<Lang>(() => localStorage.getItem('alkohol-ja-aju:language') === 'ru' ? 'ru' : 'et');
  const article = useMemo(articleFromPath, []);
  const ru = lang === 'ru';

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem('alkohol-ja-aju:language', lang);
    document.title = `${article.title[lang]} — ${ru ? 'Алкоголь и мозг' : 'Alkohol ja aju'}`;
  }, [article, lang, ru]);

  return <main className={`article-page topic-${article.id}`}>
    <header className="article-header">
      <a className="article-brand" href="../"><img src="../logo-mark.svg" alt=""/>{ru ? 'алкоголь и мозг' : 'alkohol ja aju'}</a>
      <div className="article-language" role="group" aria-label={ru ? 'Язык' : 'Keel'}>
        <button className={lang === 'et' ? 'active' : ''} onClick={() => setLang('et')}>ET</button>
        <button className={lang === 'ru' ? 'active' : ''} onClick={() => setLang('ru')}>RU</button>
      </div>
    </header>
    <section className="article-hero">
      <p>{ru ? 'НАУЧНАЯ ТЕМА' : 'TEADUSTEEMA'} · {article.source}</p>
      <h1>{article.title[lang]}</h1>
      <p className="article-lead">{article.lead[lang]}</p>
    </section>
    <nav className="article-nav" aria-label={ru ? 'Научные темы' : 'Teadusteemad'}>
      {articles.map(item => <a className={item.id === article.id ? 'active' : ''} href={`../${item.id}/`} key={item.id}>{item.title[lang]}</a>)}
    </nav>
    <section className="article-answer" aria-labelledby="short-answer">
      <span>{ru ? 'КРАТКИЙ ОТВЕТ' : 'LÜHIVASTUS'}</span>
      <h2 id="short-answer">{article.question[lang]}</h2>
      <p>{article.answer[lang]}</p>
    </section>
    <section className="article-evidence" aria-label={ru ? 'Как читать исследование' : 'Kuidas uuringut lugeda'}>
      <article><span>01</span><h2>{ru ? 'Что изучали' : 'Mida uuriti'}</h2><p>{article.measured[lang]}</p></article>
      <article><span>02</span><h2>{ru ? 'Что нашли' : 'Mida leiti'}</h2><p>{article.found[lang]}</p></article>
      <article><span>03</span><h2>{ru ? 'Границы вывода' : 'Järelduse piirid'}</h2><p>{article.limits[lang]}</p></article>
    </section>
    <section className="article-source">
      <div><span>{ru ? 'ПЕРВОИСТОЧНИК' : 'ALGALLIKAS'}</span><h2>{article.source}</h2><p>{article.citation}</p></div>
      <a href={article.url} target="_blank" rel="noreferrer">{ru ? 'Открыть в PubMed' : 'Ava PubMedis'}</a>
    </section>
    <footer className="article-footer"><a href="../">{ru ? 'Вернуться к учебному маршруту' : 'Tagasi õpperajale'}</a></footer>
  </main>;
}

