import { terms } from '../components/ReferenceGlossary';

export type SearchEntry = { kind: 'section' | 'page' | 'term'; ru: string; et: string; descRu?: string; descEt?: string; href: string; keys?: string };

// Terms without a Russian name (e.g. GABA) are also findable by their Cyrillic spelling.
const CYR: Record<string, string> = { a: 'а', b: 'б', c: 'к', d: 'д', e: 'е', f: 'ф', g: 'г', h: 'х', i: 'и', j: 'й', k: 'к', l: 'л', m: 'м', n: 'н', o: 'о', p: 'п', q: 'к', r: 'р', s: 'с', t: 'т', u: 'у', v: 'в', w: 'в', x: 'кс', y: 'ы', z: 'з' };
const translit = (v: string) => v.toLowerCase().split('').map(ch => CYR[ch] ?? ch).join('');

const s = (id: string, ru: string, et: string, keys = ''): SearchEntry => ({ kind: 'section', ru, et, href: '#' + id, keys });
const p = (href: string, ru: string, et: string, keys = ''): SearchEntry => ({ kind: 'page', ru, et, href, keys });

/** Everything searchable on the main page. Matching runs in the browser only; queries are never sent anywhere. */
export const searchIndex: SearchEntry[] = [
  s('valik', 'Выбрать формат', 'Vali vorm', '5 минут 20 минут урок tunnik'),
  s('aju', 'Влияние на мозг', 'Mõju ajule', 'мозг память внимание реакция решения aju'),
  s('infograafika', 'Схемы', 'Skeemid', 'инфографика схема skeem infograafika'),
  s('teadmised', 'Научная база', 'Teadusbaas', 'исследования доказательства uuringud'),
  s('malu', 'Упражнение на память', 'Mäluharjutus', 'память mälu слова'),
  s('tahelepanu', 'Упражнение на внимание', 'Tähelepanuharjutus', 'внимание tähelepanu буквы'),
  s('labor', 'Мини-игры', 'Minimängud', 'реакция stroop сигнал игра mäng reaktsioon'),
  s('viktoriin', 'Миф или факт', 'Müüt või fakt', 'викторина тест quiz viktoriin'),
  s('samoprov', 'Самопроверка', 'Enesekontroll', 'рефлексия'),
  s('obsuzhdenie', 'Обсуждение', 'Arutelu', 'вопросы класс'),
  s('tegevus', 'Что делать в ситуации', 'Mida teha olukorras', 'помощь телефон 116111 lasteabi 112 abi'),
  s('klassiruum', 'Для урока', 'Tunniks', 'учитель план урока билет выхода worksheet tööleht'),
  s('tagasiside', 'Обратная связь о сайте', 'Tagasiside veebilehe kohta', 'отзыв feedback'),
  s('isiklik-kokkuvote', 'Итог: что ты прошёл(а)', 'Kokkuvõte: mida oled teinud', 'прогресс progress'),
  s('moisted', 'Справочник терминов', 'Mõistete sõnastik', 'глоссарий термины sõnastik'),
  s('allikad', 'Источники и литература', 'Allikad ja kirjandus', 'источники ссылки литература doi pubmed'),
  p('start/', 'Урок за 5 минут', 'Õppetükk 5 minutiga', 'быстро кратко'),
  p('start/?mode=full', 'Урок за 20 минут', 'Õppetükk 20 minutiga', 'полный'),
  p('help/', 'Что делать / Нужна помощь', 'Mida teha / Vajan abi', 'помощь телефон 116111 lasteabi 112'),
  p('teacher/', 'Для учителя', 'Õpetajale', 'урок класс'),
  p('topics/', 'Научные темы', 'Teadusteemad', 'исследования'),
  p('acute-effects/', 'Острое воздействие: рабочая память', 'Äge mõju: töömälu', 'метаанализ spinola'),
  p('memory-blackouts/', 'Память и провалы памяти', 'Mälu ja mälulüngad', 'блэкаут blackout'),
  p('adolescent-brain/', 'Подростковый мозг', 'Nooruki aju', 'подростки noored'),
  p('self-control/', 'Самоконтроль и торможение реакции', 'Enesekontroll ja reaktsiooni pidurdamine', 'импульсивность'),
  p('alcohol-and-sleep/', 'Алкоголь, сон и дыхание', 'Alkohol, uni ja hingamine', 'сон uni'),
  p('alcohol-and-driving/', 'Алкоголь и вождение', 'Alkohol ja autojuhtimine', 'машина авто juhtimine'),
  p('reward-and-habits/', 'Система вознаграждения и привычки', 'Tasustamissüsteem ja harjumused', 'дофамин привычка'),
  p('recovery-and-brain/', 'Восстановление когнитивных функций', 'Kognitiivsete funktsioonide taastumine', 'восстановление taastumine'),
  p('science/', 'Добровольный опрос 15+', 'Vabatahtlik küsitlus 15+', 'исследование анкета küsitlus'),
  p('science/results/#estonia-data', 'Что показывают данные Эстонии?', 'Mida näitavad Eesti andmed?', 'ESPAD TAI школьники статистика kooliõpilased'),
  p('science/results/', 'Результаты опроса', 'Küsitluse tulemused', 'статистика графики'),
  p('methodology/', 'Методология', 'Metoodika', 'как сделан'),
  p('fact-check/', 'Как проверялись факты', 'Kuidas fakte kontrolliti', 'faktikontroll'),
  p('data-policy/', 'Данные и приватность', 'Andmed ja privaatsus', 'конфиденциальность privacy'),
  p('worksheet/', 'Рабочие листы A4', 'Töölehed A4', 'печать tööleht'),
  p('changelog/', 'История изменений', 'Muudatuste ajalugu', 'changelog'),
  ...terms.map((t): SearchEntry => ({ kind: 'term', ru: (t as { ruTerm?: string }).ruTerm ?? t.term, et: t.term, descRu: t.ru, descEt: t.et, href: '#moisted', keys: `${t.term} ${translit(t.term)}` })),
];
