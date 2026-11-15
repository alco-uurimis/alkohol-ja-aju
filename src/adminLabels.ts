/** Russian labels for the admin view. Unknown codes fall back to the raw code, so new answers never disappear. */
import { A } from './adminI18n';
const LV = { never: A('Никогда'), rare: A('Редко'), sometimes: A('Иногда'), often: A('Часто'), prefer_not: A('Предпочитаю не отвечать') };
type Q = { title: string; multi?: boolean; codes: Record<string, string> };
export const adminQuestions: Record<string, Q> = {
  language: { title: A('Язык анкеты'), codes: { et: A('Эстонский'), ru: A('Русский'), en: A('Английский') } },
  ageGroup: { title: A('Возрастные группы'), codes: { '15_17': '15–17', '18_20': '18–20', '21_25': '21–25', '26_35': '26–35', '36_plus': '36+', prefer_not: A('Предпочитаю не отвечать') } },
  ownUse: { title: A('Частота употребления за 12 месяцев'), codes: { never: A('Никогда'), less_monthly: A('Реже раза в месяц'), monthly: A('Раз в месяц'), two_four_month: A('2–4 раза в месяц'), two_three_week: A('2–3 раза в неделю'), four_plus_week: A('4+ раза в неделю'), prefer_not: A('Предпочитаю не отвечать') } },
  typicalUnits: { title: A('Единиц алкоголя в обычный день'), codes: { '1_2': '1–2', '3_4': '3–4', '5_6': '5–6', '7_9': '7–9', '10_plus': '10+', prefer_not: A('Предпочитаю не отвечать') } },
  sixPlus: { title: A('Частота 6+ единиц за один раз'), codes: { never: A('Никогда'), less_monthly: A('Реже раза в месяц'), monthly: A('Раз в месяц'), weekly: A('Раз в неделю'), daily_almost: A('Почти каждый день'), prefer_not: A('Предпочитаю не отвечать') } },
  contexts: { title: A('Где и с кем употребляют (можно несколько)'), multi: true, codes: { friends: A('С друзьями'), family: A('В семье'), event: A('На мероприятиях'), alone: A('В одиночестве'), other: A('Другое'), prefer_not: A('Предпочитаю не отвечать') } },
  peerNorm: { title: A('Насколько распространено среди ровесников'), codes: { rare: A('Редко'), some: A('У некоторых'), common: A('Часто'), very_common: A('Очень часто'), unsure: A('Не уверен(а)'), prefer_not: A('Предпочитаю не отвечать') } },
  closeExposure: { title: A('Близкий был заметно пьян (12 мес.)'), codes: LV },
  closeRelations: { title: A('Кто из близких (можно несколько)'), multi: true, codes: { partner: A('Партнёр'), family: A('Семья'), friend: A('Друг'), other: A('Другое'), prefer_not: A('Предпочитаю не отвечать') } },
  closeHousehold: { title: A('Жил(а) вместе с этим человеком'), codes: { yes: A('Да'), sometimes: A('Иногда'), no: A('Нет'), prefer_not: A('Предпочитаю не отвечать') } },
  closeConflict: { title: A('Конфликты из-за чужого употребления'), codes: LV },
  closeUnsafe: { title: A('Непредсказуемость и небезопасность из-за близкого'), codes: LV },
  worry: { title: A('Переживания из-за чужого употребления'), codes: LV },
  sleep: { title: A('Влияние на сон и отдых'), codes: LV },
  study: { title: A('Влияние на учёбу или работу'), codes: LV },
  mood: { title: A('Влияние на настроение'), codes: LV },
  avoid: { title: A('Избегание человека или ситуации'), codes: LV },
  unsafe: { title: A('Чувство небезопасности'), codes: LV },
  extraResponsibility: { title: A('Дополнительные обязанности'), codes: LV },
  overallImpact: { title: A('Общее негативное влияние'), codes: { none: A('Не повлияло'), slight: A('Незначительно'), moderate: A('Умеренно'), strong: A('Сильно'), very_strong: A('Очень сильно'), prefer_not: A('Предпочитаю не отвечать') } },
  pressure: { title: A('Давление компании выпить (12 мес.)'), codes: LV },
  refusalNormal: { title: A('Нормально ли отказаться без объяснений'), codes: { yes: A('Да'), mostly: A('Скорее да'), unsure: A('Не уверен(а)'), mostly_no: A('Скорее нет'), no: A('Нет'), prefer_not: A('Предпочитаю не отвечать') } },
  helpKnowledge: { title: A('Знает, куда обратиться за помощью'), codes: { yes: A('Да'), partly: A('Частично'), no: A('Нет'), prefer_not: A('Предпочитаю не отвечать') } },
  supportChoice: { title: A('К кому проще обратиться'), codes: { friend: A('Друг'), family: A('Семья'), school: A('Школа'), doctor: A('Врач'), helpline: A('Телефон доверия'), none: A('Ни к кому'), prefer_not: A('Предпочитаю не отвечать') } },
};
