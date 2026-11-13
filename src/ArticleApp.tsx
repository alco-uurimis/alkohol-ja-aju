import { useEffect, useMemo, useState } from 'react';
import './articles.css';
import { EvidenceSourceCard } from './articles/EvidenceSourceCard';
import { RelatedNextSteps } from './articles/RelatedNextSteps';
import type { EvidenceCitationMetadata } from './articles/types';

type Lang = 'et' | 'ru' | 'en';

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
  evidence: EvidenceCitationMetadata;
};

const articles: Article[] = [
  {
    id: 'acute-effects', source: 'Spinola et al., 2022',
    title: {ru: 'Острое воздействие: рабочая память', et: 'Äge mõju: töömälu', en: 'Acute effects: working memory'},
    lead: {ru: 'Что происходит, когда нужно удерживать информацию в уме и одновременно с ней работать?', et: 'Mis juhtub siis, kui tuleb infot korraga meeles hoida ja sellega töötada?', en: 'What happens when you have to hold information in mind and work with it at the same time?'},
    question: {ru: 'Влияет ли алкоголь на рабочую память?', et: 'Kas alkohol mõjutab töömälu?', en: 'Does alcohol affect working memory?'},
    answer: {ru: 'В лабораторных исследованиях острое воздействие алкоголя статистически ухудшало рабочую память, особенно задачи, где нужно не только удерживать, но и преобразовывать информацию.', et: 'Laboriuuringutes halvendas alkoholi äge toime statistiliselt töömälu, eriti ülesandeid, kus infot ei tulnud ainult meeles hoida, vaid ka töödelda.', en: 'In laboratory studies, acute alcohol exposure statistically worsened working memory, especially tasks that required not only holding but also transforming information.'},
    measured: {ru: 'Авторы объединили 32 контролируемых исследования с 1 629 здоровыми взрослыми. В них сравнивали выполнение задач после известной дозы алкоголя и в контрольных условиях.', et: 'Autorid ühendasid 32 kontrollitud uuringut 1629 terve täiskasvanuga. Võrreldi ülesannete sooritust teadaoleva alkoholidoosi järel ja kontrolltingimustes.', en: 'The authors pooled 32 controlled studies with 1,629 healthy adults. They compared task performance after a known dose of alcohol with control conditions.'},
    found: {ru: 'В среднем выполнение заданий ухудшилось примерно на 0,3 стандартного отклонения (g = −0,30). Это средняя разница по разным заданиям, а не снижение памяти на 30%. Результат различался в зависимости от задания и дозы.', et: 'Sooritus halvenes keskmiselt umbes 0,3 standardhälbe võrra (g = −0,30). See on eri ülesannete keskmine erinevus, mitte mälu 30% halvenemine. Tulemus erines ülesande ja annuse järgi.', en: 'On average, performance worsened by about 0.3 standard deviations (g = −0.30). This is the average difference across different tasks, not a 30% drop in memory. The result varied by task and dose.'},
    limits: {ru: 'Это не тест для определения состояния конкретного человека. Работа изучала взрослых в контролируемых условиях; веб-игра не измеряет алкогольное опьянение.', et: 'See ei ole test ühe konkreetse inimese seisundi määramiseks. Uuring käsitles täiskasvanuid kontrollitud tingimustes; veebimäng ei mõõda alkoholijoovet.', en: 'This is not a test for determining the state of a particular person. The work studied adults under controlled conditions; the web game does not measure alcohol intoxication.'},
    citation: 'Psychopharmacology, 2022 · systematic review and meta-analysis', url: 'https://pubmed.ncbi.nlm.nih.gov/35075512/',
    evidence: {
      kind: {ru: 'Систематический обзор и метаанализ', et: 'Süstemaatiline ülevaade ja metaanalüüs', en: 'Systematic review and meta-analysis'},
      sample: {ru: '32 контролируемых исследования · 1 629 здоровых взрослых', et: '32 kontrollitud uuringut · 1629 tervet täiskasvanut', en: '32 controlled studies · 1,629 healthy adults'},
      pmid: '35075512', doi: '10.1007/s00213-022-06060-5',
    },
  },
  {
    id: 'memory-blackouts', source: 'NIAAA · Alcohol-Induced Blackouts',
    title: {ru: 'Память и провалы памяти', et: 'Mälu ja mälulüngad', en: 'Memory and blackouts'},
    lead: {ru: 'Почему человек может говорить и действовать, но позже не помнить события?', et: 'Miks võib inimene rääkida ja tegutseda, kuid hiljem sündmusi mitte mäletada?', en: 'Why can a person talk and act, but later not remember the events?'},
    question: {ru: 'Провал памяти — это потеря сознания?', et: 'Kas mälulünk tähendab teadvuse kaotust?', en: 'Is a blackout a loss of consciousness?'},
    answer: {ru: 'Нет. Во время алкогольного провала памяти человек может оставаться в сознании, но новые эпизодические воспоминания формируются плохо или не формируются.', et: 'Ei. Alkoholist tingitud mälulünga ajal võib inimene olla teadvusel, kuid uusi episoodilisi mälestusi talletub halvasti või ei talletu üldse.', en: 'No. During an alcohol-related blackout a person can remain conscious, but new episodic memories form poorly or do not form at all.'},
    measured: {ru: 'Объяснение опирается на исследования формирования памяти и на данные о связи быстро растущей концентрации алкоголя в крови с риском провалов памяти.', et: 'Selgitus toetub mälestuste kujunemise uuringutele ning andmetele kiiresti tõusva vere alkoholisisalduse ja mälulünkade riski seose kohta.', en: 'The explanation draws on research into memory formation and on data linking a rapidly rising blood alcohol concentration to the risk of blackouts.'},
    found: {ru: 'Ключевой момент — запись новых событий, а не попытка позже «вспомнить лучше». Если воспоминание не закрепилось, подсказка не всегда поможет его восстановить.', et: 'Oluline on uute sündmuste talletamine, mitte hilisem püüd „paremini meenutada“. Kui mälestus ei kinnistunud, ei pruugi vihje seda taastada.', en: 'What matters is the recording of new events, not trying to “remember better” later. If a memory was not consolidated, a cue will not always help restore it.'},
    limits: {ru: 'Люди различаются по чувствительности, дозе, скорости употребления и другим факторам. Нельзя по одному эпизоду или упражнению сделать медицинский вывод.', et: 'Inimeste tundlikkus, annus, tarvitamise kiirus ja muud tegurid erinevad. Ühe episoodi või harjutuse põhjal ei saa teha meditsiinilist järeldust.', en: 'People differ in sensitivity, dose, speed of drinking and other factors. No medical conclusion can be drawn from a single episode or an exercise.'},
    citation: 'National Institute on Alcohol Abuse and Alcoholism · evidence summary', url: 'https://www.niaaa.nih.gov/publications/brochures-and-fact-sheets/interrupted-memories-alcohol-induced-blackouts',
    evidence: {
      kind: {ru: 'Официальный обзор доказательств', et: 'Ametlik tõendite ülevaade', en: 'Official evidence review'},
    },
  },
  {
    id: 'adolescent-brain', source: 'Karoly et al., 2024',
    title: {ru: 'Подростковый мозг: что показывают большие выборки', et: 'Nooruki aju: mida näitavad suured valimid', en: 'The adolescent brain: what large samples show'},
    lead: {ru: 'Как современные исследования связывают употребление алкоголя и структуру мозга?', et: 'Kuidas seostavad tänapäevased uuringud alkoholi tarvitamist ja aju struktuuri?', en: 'How do modern studies link alcohol use and brain structure?'},
    question: {ru: 'Можно ли по снимку мозга предсказать судьбу человека?', et: 'Kas ajuuuringu põhjal saab ennustada ühe inimese tulevikku?', en: 'Can a brain scan predict a person\'s future?'},
    answer: {ru: 'Нет. Обзор крупных нейровизуализационных исследований описывает статистические связи между употреблением алкоголя в подростковом возрасте и различиями объёма или толщины некоторых областей мозга.', et: 'Ei. Suurte neurokuvamise uuringute ülevaade kirjeldab statistilisi seoseid noorukiea alkoholi tarvitamise ning mõne ajupiirkonna mahu või paksuse erinevuste vahel.', en: 'No. A review of large neuroimaging studies describes statistical associations between alcohol use in adolescence and differences in the volume or thickness of some brain regions.'},
    measured: {ru: 'Систематический обзор включил 27 исследований больших консорциумов, включая ABCD, ENIGMA, NCANDA и IMAGEN; девять работ рассматривали подростков.', et: 'Süstemaatiline ülevaade hõlmas 27 suurte konsortsiumide uuringut, sealhulgas ABCD, ENIGMA, NCANDA ja IMAGEN; üheksa tööd käsitlesid noorukeid.', en: 'The systematic review included 27 studies from large consortia, including ABCD, ENIGMA, NCANDA and IMAGEN; nine papers examined adolescents.'},
    found: {ru: 'Авторы обнаружили повторяющиеся связи с меньшим объёмом или толщиной в ряде областей, но результаты неодинаковы между регионами и исследованиями.', et: 'Autorid leidsid korduvaid seoseid väiksema mahu või paksusega mitmes piirkonnas, kuid tulemused ei olnud piirkondade ja uuringute vahel ühesugused.', en: 'The authors found recurring associations with smaller volume or thickness in a number of regions, but the results are not uniform across regions and studies.'},
    limits: {ru: 'Наблюдательные данные не доказывают, что алкоголь в одиночку вызвал каждое различие: важны исходные особенности, среда, сон, психическое здоровье и другие факторы.', et: 'Vaatlusandmed ei tõesta, et alkohol üksi põhjustas iga erinevuse: olulised on algsed eripärad, keskkond, uni, vaimne tervis ja muud tegurid.', en: 'Observational data do not prove that alcohol alone caused every difference: baseline characteristics, environment, sleep, mental health and other factors matter.'},
    citation: 'Addiction Biology, 2024 · systematic review', url: 'https://pubmed.ncbi.nlm.nih.gov/39317645/',
    evidence: {
      kind: {ru: 'Систематический обзор', et: 'Süstemaatiline ülevaade', en: 'Systematic review'},
      sample: {ru: '27 исследований крупных консорциумов · 9 исследований подростков', et: '27 suurte konsortsiumide uuringut · 9 noorukite uuringut', en: '27 studies from large consortia · 9 studies of adolescents'},
      pmid: '39317645',
    },
  },
  {
    id: 'self-control', source: 'McPhee et al., 2023',
    title: {ru: 'Самоконтроль и торможение реакции', et: 'Enesekontroll ja reaktsiooni pidurdamine', en: 'Self-control and response inhibition'},
    lead: {ru: 'Почему «знать правильный ответ» не всегда значит успеть остановиться?', et: 'Miks ei tähenda „õige vastuse teadmine“ alati, et jõuad end peatada?', en: 'Why does “knowing the right answer” not always mean being able to stop in time?'},
    question: {ru: 'Меняет ли алкоголь способность остановить автоматическое действие?', et: 'Kas alkohol muudab võimet automaatset tegevust peatada?', en: 'Does alcohol change the ability to stop an automatic action?'},
    answer: {ru: 'Метаанализ лабораторных исследований показал ухудшение торможения реакции после острого воздействия алкоголя.', et: 'Laboriuuringute metaanalüüs näitas reaktsiooni pidurdamise halvenemist pärast alkoholi ägedat toimet.', en: 'A meta-analysis of laboratory studies showed impaired response inhibition after acute alcohol exposure.'},
    measured: {ru: 'Авторы объединили исследования с задачами Go/No-Go и Stop Signal: участник должен быстро реагировать, но вовремя остановиться при определённом сигнале.', et: 'Autorid ühendasid Go/No-Go ja Stop Signal ülesannetega uuringud: osaleja peab kiiresti reageerima, kuid kindla signaali korral õigel ajal peatuma.', en: 'The authors pooled studies using Go/No-Go and Stop Signal tasks: the participant has to respond quickly but stop in time when a specific signal appears.'},
    found: {ru: 'Общий эффект был отрицательным; более высокие концентрации алкоголя были связаны с более выраженным ухудшением в части задач.', et: 'Üldine efekt oli kahjulik; kõrgem alkoholikontsentratsioon seostus osas ülesannetes tugevama halvenemisega.', en: 'The overall effect was negative; higher alcohol concentrations were associated with stronger impairment in some tasks.'},
    limits: {ru: 'Это измерение одной когнитивной функции в лаборатории. Оно не определяет характер человека, диагноз или его способность безопасно водить автомобиль.', et: 'See mõõdab laboris üht kognitiivset funktsiooni. See ei määra inimese iseloomu, diagnoosi ega autojuhtimise ohutust.', en: 'This is a measurement of a single cognitive function in a laboratory. It does not determine a person\'s character, a diagnosis, or their ability to drive safely.'},
    citation: 'Neuroscience & Biobehavioral Reviews, 2023 · meta-analysis', url: 'https://pubmed.ncbi.nlm.nih.gov/37277010/',
    evidence: {
      kind: {ru: 'Метаанализ', et: 'Metaanalüüs', en: 'Meta-analysis'},
      pmid: '37277010',
    },
  },
  {
    id: 'alcohol-and-sleep', source: 'Kolla et al., 2018',
    title: {ru: 'Алкоголь, сон и дыхание', et: 'Alkohol, uni ja hingamine', en: 'Alcohol, sleep and breathing'},
    lead: {ru: 'Почему более быстрое засыпание не означает более качественный сон?', et: 'Miks ei tähenda kiirem uinumine paremat und?', en: 'Why does falling asleep faster not mean better sleep?'},
    question: {ru: 'Как алкоголь связан с дыханием во сне?', et: 'Kuidas on alkohol seotud uneaegse hingamisega?', en: 'How is alcohol linked to breathing during sleep?'},
    answer: {ru: 'В метаанализе контролируемых исследований после алкоголя в среднем возрастало число эпизодов нарушенного дыхания во сне и немного снижалась средняя насыщенность крови кислородом.', et: 'Kontrollitud uuringute metaanalüüsis suurenes pärast alkoholi tarvitamist keskmiselt uneaegsete hingamishäirete episoodide arv ning vere keskmine hapnikuküllastus veidi langes.', en: 'In a meta-analysis of controlled studies, after alcohol the number of episodes of disordered breathing during sleep increased on average and mean blood oxygen saturation fell slightly.'},
    measured: {ru: 'Авторы объединили 14 исследований с 422 участниками. Сравнивали объективные показатели дыхания и кислорода во сне до и после приёма алкоголя.', et: 'Autorid ühendasid 14 uuringut 422 osalejaga. Võrreldi uneaegse hingamise ja hapnikusisalduse objektiivseid näitajaid enne ja pärast alkoholi tarvitamist.', en: 'The authors pooled 14 studies with 422 participants. They compared objective measures of breathing and oxygen during sleep before and after alcohol.'},
    found: {ru: 'Эффект был заметнее у людей, которые храпят, и у участников с обструктивным апноэ сна. Это согласуется с тем, что алкоголь может ухудшать уже существующие нарушения дыхания во сне.', et: 'Mõju oli suurem norskavatel inimestel ja obstruktiivse uneapnoega osalejatel. See sobib järeldusega, et alkohol võib olemasolevaid uneaegseid hingamishäireid süvendada.', en: 'The effect was more marked in people who snore and in participants with obstructive sleep apnoea. This is consistent with alcohol being able to worsen existing sleep-disordered breathing.'},
    limits: {ru: 'Обзор не означает, что у каждого человека после одной порции возникнет апноэ сна. Риск зависит от особенностей дыхания, дозы, времени употребления и состояния здоровья.', et: 'Ülevaade ei tähenda, et igal inimesel tekib pärast üht alkoholiannust uneapnoe. Risk sõltub hingamise eripäradest, annusest, tarvitamise ajast ja terviseseisundist.', en: 'The review does not mean that everyone will develop sleep apnoea after a single serving. The risk depends on breathing characteristics, dose, timing of drinking and health status.'},
    citation: 'Sleep Medicine Reviews, 2018 · systematic review and meta-analysis', url: 'https://pubmed.ncbi.nlm.nih.gov/30017492/',
    evidence: {
      kind: {ru: 'Систематический обзор и метаанализ', et: 'Süstemaatiline ülevaade ja metaanalüüs', en: 'Systematic review and meta-analysis'},
      sample: {ru: '14 исследований · 422 участника', et: '14 uuringut · 422 osalejat', en: '14 studies · 422 participants'},
      pmid: '30017492', doi: '10.1016/j.smrv.2018.05.007',
    },
  },
  {
    id: 'alcohol-and-driving', source: 'NHTSA · Drunk Driving',
    title: {ru: 'Алкоголь и вождение: почему нельзя судить по самочувствию', et: 'Alkohol ja autojuhtimine: miks enesetunde järgi ei saa otsustada', en: 'Alcohol and driving: why you cannot judge by how you feel'},
    lead: {ru: 'Почему ощущение бодрости не гарантирует безопасную реакцию за рулём?', et: 'Miks ei taga erksuse tunne roolis ohutut reageerimist?', en: 'Why does feeling alert not guarantee a safe reaction behind the wheel?'},
    question: {ru: 'Может ли человек сам надёжно оценить безопасность вождения после алкоголя?', et: 'Kas inimene saab pärast alkoholi tarvitamist ise usaldusväärselt hinnata autojuhtimise ohutust?', en: 'Can a person reliably judge their own driving safety after alcohol?'},
    answer: {ru: 'Нет. Алкоголь может одновременно влиять на реакцию, обработку информации, координацию и принятие решений. Поэтому субъективное ощущение контроля не является проверкой безопасности.', et: 'Ei. Alkohol võib korraga mõjutada reaktsiooni, infotöötlust, koordinatsiooni ja otsustamist. Seetõttu ei ole subjektiivne kontrollitunne ohutuse kontroll.', en: 'No. Alcohol can affect reaction, information processing, coordination and decision-making at the same time. A subjective feeling of control is therefore not a safety check.'},
    measured: {ru: 'Материал NHTSA обобщает данные о том, как алкоголь влияет на навыки, нужные для вождения: внимание, зрительную обработку, скорость реакции и координацию.', et: 'NHTSA materjal võtab kokku andmeid alkoholi mõjust autojuhtimiseks vajalikele oskustele: tähelepanule, visuaalsele infotöötlusele, reaktsioonikiirusele ja koordinatsioonile.', en: 'The NHTSA material summarises data on how alcohol affects the skills needed for driving: attention, visual processing, reaction speed and coordination.'},
    found: {ru: 'Важен не один навык, а их сочетание. Даже учебная задача на реакцию не показывает, может ли конкретный человек безопасно управлять автомобилем.', et: 'Oluline ei ole üks oskus, vaid nende koosmõju. Isegi õppeotstarbeline reaktsiooniülesanne ei näita, kas konkreetne inimene saab autot ohutult juhtida.', en: 'What matters is not one skill but their combination. Even a learning reaction task does not show whether a particular person can drive safely.'},
    limits: {ru: 'Это образовательное объяснение, а не способ рассчитать личный риск или определить, когда можно садиться за руль. Безопасное решение — не водить после употребления алкоголя.', et: 'See on hariv selgitus, mitte viis isikliku riski arvutamiseks või rooli istumise aja määramiseks. Ohutu otsus on pärast alkoholi tarvitamist mitte juhtida.', en: 'This is an educational explanation, not a way to calculate personal risk or to decide when it is acceptable to drive. The safe decision is not to drive after drinking alcohol.'},
    citation: 'National Highway Traffic Safety Administration · evidence summary', url: 'https://www.nhtsa.gov/risky-driving/drunk-driving',
    evidence: {
      kind: {ru: 'Официальный обзор доказательств', et: 'Ametlik tõendite ülevaade', en: 'Official evidence review'},
    },
  },
  {
    id: 'reward-and-habits', source: 'NIAAA · The Brain in Addiction and Recovery',
    title: {ru: 'Система вознаграждения и привычки', et: 'Tasustamissüsteem ja harjumused', en: 'The reward system and habits'},
    lead: {ru: 'Как удовольствие, обучение и сигналы среды могут связываться с алкоголем?', et: 'Kuidas võivad nauding, õppimine ja keskkonnamärgid alkoholiga seostuda?', en: 'How can pleasure, learning and environmental cues become linked with alcohol?'},
    question: {ru: 'Почему алкогольные сигналы могут становиться значимыми?', et: 'Miks võivad alkoholiga seotud märgid muutuda tähenduslikuks?', en: 'Why can alcohol-related cues become meaningful?'},
    answer: {ru: 'Алкоголь может активировать системы вознаграждения. Дофамин участвует в обучении связям между эффектом алкоголя и людьми, местами или ситуациями, в которых он употреблялся.', et: 'Alkohol võib aktiveerida tasustamissüsteeme. Dopamiin osaleb seoste õppimises alkoholi toime ning inimeste, kohtade või olukordade vahel, kus seda tarvitati.', en: 'Alcohol can activate reward systems. Dopamine takes part in learning the links between the effect of alcohol and the people, places or situations in which it was used.'},
    measured: {ru: 'Страница NIAAA обобщает нейробиологические исследования систем вознаграждения, привычек, стресса и самоконтроля при расстройстве, связанном с употреблением алкоголя.', et: 'NIAAA leht võtab kokku neurobioloogilisi uuringuid tasu, harjumuste, stressi ja enesekontrolli süsteemidest alkoholi tarvitamise häire korral.', en: 'The NIAAA page summarises neurobiological research on the systems of reward, habit, stress and self-control in alcohol use disorder.'},
    found: {ru: 'Повторяющееся тяжёлое употребление может сопровождаться переходом от поиска награды к привычному поведению и попыткам уменьшить неприятные состояния. Это один из научных механизмов, а не описание каждого человека.', et: 'Korduva rohke tarvitamisega võib kaasneda üleminek tasu otsimiselt harjumuspärasele käitumisele ja ebameeldivate seisundite leevendamise katsetele. See on üks teaduslik mehhanism, mitte iga inimese kirjeldus.', en: 'Repeated heavy use may be accompanied by a shift from seeking reward to habitual behaviour and attempts to relieve unpleasant states. This is one scientific mechanism, not a description of every person.'},
    limits: {ru: 'Дофамин не равен «гормону удовольствия», а схема не означает, что зависимость развивается у каждого. На риск влияют биологические, психологические и социальные факторы.', et: 'Dopamiin ei võrdu „naudinguhormooniga“ ning skeem ei tähenda, et sõltuvus kujuneb kõigil. Riski mõjutavad bioloogilised, psühholoogilised ja sotsiaalsed tegurid.', en: 'Dopamine is not the same as a “pleasure hormone”, and the diagram does not mean that dependence develops in everyone. Risk is influenced by biological, psychological and social factors.'},
    citation: 'National Institute on Alcohol Abuse and Alcoholism · evidence summary', url: 'https://www.niaaa.nih.gov/health-professionals-communities/core-resource-on-alcohol/neuroscience-brain-addiction-and-recovery',
    evidence: {
      kind: {ru: 'Официальный обзор доказательств', et: 'Ametlik tõendite ülevaade', en: 'Official evidence review'},
    },
  },
  {
    id: 'recovery-and-brain', source: 'Powell et al., 2024',
    title: {ru: 'Восстановление когнитивных функций', et: 'Kognitiivsete funktsioonide taastumine', en: 'Recovery of cognitive functions'},
    lead: {ru: 'Что известно о мышлении и памяти после прекращения употребления при алкогольном расстройстве?', et: 'Mida teatakse mõtlemise ja mälu kohta pärast tarvitamise lõpetamist alkoholi tarvitamise häire korral?', en: 'What is known about thinking and memory after stopping use in alcohol use disorder?'},
    question: {ru: 'Может ли часть когнитивных функций улучшаться при воздержании?', et: 'Kas osa kognitiivseid funktsioone võib karskuse ajal paraneda?', en: 'Can some cognitive functions improve during abstinence?'},
    answer: {ru: 'Систематический обзор продольных исследований описывает улучшения некоторых когнитивных функций при воздержании, но скорость и полнота восстановления различаются между функциями и людьми.', et: 'Pikisuunaliste uuringute süstemaatiline ülevaade kirjeldab mõne kognitiivse funktsiooni paranemist karskuse ajal, kuid taastumise kiirus ja täielikkus erinevad funktsioonide ja inimeste vahel.', en: 'A systematic review of longitudinal studies describes improvement in some cognitive functions during abstinence, but the speed and completeness of recovery differ between functions and people.'},
    measured: {ru: 'Авторы рассматривали исследования взрослых с расстройством, связанным с употреблением алкоголя, в которых когнитивные показатели измеряли повторно после начала воздержания.', et: 'Autorid käsitlesid alkoholi tarvitamise häirega täiskasvanute uuringuid, kus kognitiivseid näitajaid mõõdeti korduvalt pärast karskuse algust.', en: 'The authors reviewed studies of adults with alcohol use disorder in which cognitive measures were taken repeatedly after the start of abstinence.'},
    found: {ru: 'В литературе есть основания говорить о возможном восстановлении части функций, но для разных навыков сроки неодинаковы, а данные по некоторым областям всё ещё ограничены.', et: 'Kirjanduses on alust rääkida osa funktsioonide võimalikust taastumisest, kuid eri oskuste ajakava ei ole sama ning mõne valdkonna andmed on endiselt piiratud.', en: 'The literature gives grounds to speak of possible recovery of some functions, but the timelines differ between skills, and data for some areas are still limited.'},
    limits: {ru: 'Это не обещание одинакового восстановления и не руководство по лечению. Участники исследований — взрослые с диагностированным расстройством; индивидуальную помощь планируют со специалистом.', et: 'See ei ole lubadus ühesugusest taastumisest ega ravijuhis. Uuringute osalejad olid diagnoositud häirega täiskasvanud; individuaalset abi planeeritakse koos spetsialistiga.', en: 'This is not a promise of uniform recovery and not a treatment guideline. Study participants were adults with a diagnosed disorder; individual help is planned together with a specialist.'},
    citation: 'PLOS ONE, 2024 · systematic review of longitudinal studies', url: 'https://pubmed.ncbi.nlm.nih.gov/38166127/',
    evidence: {
      kind: {ru: 'Систематический обзор продольных исследований', et: 'Pikisuunaliste uuringute süstemaatiline ülevaade', en: 'Systematic review of longitudinal studies'},
      pmid: '38166127',
    },
  }
];

function articleFromPath(){
  const path = window.location.pathname;
  return articles.find(article => path.includes(article.id)) ?? articles[0];
}

export default function ArticleApp(){
  const [lang, setLang] = useState<Lang>(() => {
    const requested = new URLSearchParams(location.search).get('lang');
    if (requested === 'ru' || requested === 'et' || requested === 'en') return requested;
    try { const saved = localStorage.getItem('alkohol-ja-aju:language'); return saved === 'ru' || saved === 'en' ? saved : 'et'; }
    catch { return 'et'; }
  });
  const article = useMemo(articleFromPath, []);
  const ru = lang === 'ru';
  const T = (r: string, e: string, n: string) => (lang === 'ru' ? r : lang === 'en' ? n : e);

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem('alkohol-ja-aju:language', lang);
    document.title = `${article.title[lang]} — ${T('Алкоголь и мозг', 'Alkohol ja aju', 'Alcohol and the brain')}`;
  }, [article, lang, ru]);

  return <main className={`article-page topic-${article.id}`}>
    <header className="article-header">
      <a className="article-brand" href="../"><img src="../logo-mark.svg" alt=""/>{T('алкоголь и мозг', 'alkohol ja aju', 'alcohol and the brain')}</a>
      <div className="article-language" role="group" aria-label={T('Язык', 'Keel', 'Language')}>
        <button aria-pressed={lang === 'et'} className={lang === 'et' ? 'active' : ''} onClick={() => setLang('et')}>ET</button>
        <button aria-pressed={lang === 'ru'} className={lang === 'ru' ? 'active' : ''} onClick={() => setLang('ru')}>RU</button>
        <button aria-pressed={lang === 'en'} className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
      </div>
    </header>
    <section className="article-hero">
      <p>{T('НАУЧНАЯ ТЕМА', 'TEADUSTEEMA', 'SCIENCE TOPIC')} · {article.source}</p>
      <h1>{article.title[lang]}</h1>
      <p className="article-lead">{article.lead[lang]}</p>
    </section>
    <nav className="article-nav" aria-label={T('Научные темы', 'Teadusteemad', 'Science topics')}>
      {articles.map(item => <a className={item.id === article.id ? 'active' : ''} href={`../${item.id}/`} key={item.id}>{item.title[lang]}</a>)}
    </nav>
    <section className="article-answer" aria-labelledby="short-answer">
      <span>{T('КРАТКИЙ ОТВЕТ', 'LÜHIVASTUS', 'SHORT ANSWER')}</span>
      <h2 id="short-answer">{article.question[lang]}</h2>
      <p>{article.answer[lang]}</p>
    </section>
    <section className="article-evidence" aria-label={T('Как читать исследование', 'Kuidas uuringut lugeda', 'How to read a study')}>
      <article><span>01</span><h2>{T('Что изучали', 'Mida uuriti', 'What was studied')}</h2><p>{article.measured[lang]}</p></article>
      <article><span>02</span><h2>{T('Что нашли', 'Mida leiti', 'What was found')}</h2><p>{article.found[lang]}</p></article>
      <article><span>03</span><h2>{T('Границы вывода', 'Järelduse piirid', 'Limits of the conclusion')}</h2><p>{article.limits[lang]}</p></article>
    </section>
    <EvidenceSourceCard article={article} lang={lang}/>
    {article.id === "alcohol-and-sleep" && <section aria-labelledby="sleep-onset"><h2 id="sleep-onset">{T('Засыпание и качество сна', 'Uinumine ja une kvaliteet', 'Falling asleep and sleep quality')}</h2><p>{lang === 'en' ? 'The NIAAA review explains why falling asleep quickly after alcohol can go together with fragmented sleep. The meta-analysis on this page measured breathing and blood oxygen saturation during sleep.' : ru ? "Обзор NIAAA объясняет, почему быстрое засыпание после алкоголя может сочетаться с прерывистым сном. Метаанализ на этой странице измерял дыхание и насыщение крови кислородом во сне." : "NIAAA ülevaade selgitab, miks kiirem uinumine pärast alkoholi võib kaasneda katkendliku unega. Selle lehe metaanalüüsis mõõdeti hingamist ja vere hapnikusisaldust une ajal."} <a href="https://www.niaaa.nih.gov/publications/brochures-and-fact-sheets/hangovers">NIAAA</a></p></section>}
    <RelatedNextSteps articleId={article.id} topics={articles.map(({id,title})=>({id,title}))} lang={lang}/>
    <footer className="article-footer"><a href="../">{lang === 'en' ? 'Back to the English start page' : T('Вернуться к учебному маршруту', 'Tagasi õpperajale', '')}</a></footer>
  </main>;
}


