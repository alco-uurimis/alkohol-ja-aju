export type Lang='et'|'ru';
export type Option={value:string;label:string};
export type Question={id:string;title:string;type:'radio'|'multi';options:Option[];optional?:boolean;hint?:string;showWhen?:{field:string;notIn:string[]}};
export type Step={title:string;intro:string;questions:Question[]};

const prefer=(ru:boolean):Option=>({value:'prefer_not',label:ru?'Предпочитаю не отвечать':'Eelistan mitte vastata'});
const freq=(ru:boolean):Option[]=>ru?
  [{value:'never',label:'Никогда'},{value:'rare',label:'Редко'},{value:'sometimes',label:'Иногда'},{value:'often',label:'Часто'},prefer(true)]:
  [{value:'never',label:'Mitte kunagi'},{value:'rare',label:'Harva'},{value:'sometimes',label:'Mõnikord'},{value:'often',label:'Sageli'},prefer(false)];

export function getResearchSteps(lang:Lang):Step[]{
  const ru=lang==='ru';
  return [
    {
      title:ru?'Согласие и возраст':'Nõusolek ja vanus',
      intro:ru?'Опрос предназначен только для совершеннолетних. Участие добровольное, и его можно прекратить до отправки ответа.':'Küsitlus on mõeldud ainult täisealistele. Osalemine on vabatahtlik ning selle võib enne vastuse saatmist katkestada.',
      questions:[
        {id:'adult',type:'radio',title:ru?'Тебе исполнилось 18 лет?':'Kas oled vähemalt 18-aastane?',options:ru?[{value:'yes',label:'Да'},{value:'no',label:'Нет'}]:[{value:'yes',label:'Jah'},{value:'no',label:'Ei'}]},
        {id:'consent',type:'radio',title:ru?'Согласен(на) добровольно участвовать и отправить обезличенные ответы для учебно-исследовательского анализа?':'Kas nõustud vabatahtlikult osalema ja saatma isikustamata vastused õppe- ja uurimisanalüüsiks?',options:ru?[{value:'yes',label:'Да, условия понятны'},{value:'no',label:'Нет'}]:[{value:'yes',label:'Jah, tingimused on arusaadavad'},{value:'no',label:'Ei'}]},
        {id:'ageGroup',type:'radio',title:ru?'Возрастная группа':'Vanuserühm',options:ru?[{value:'18_20',label:'18–20'},{value:'21_25',label:'21–25'},{value:'26_35',label:'26–35'},{value:'36_plus',label:'36+'},prefer(true)]:[{value:'18_20',label:'18–20'},{value:'21_25',label:'21–25'},{value:'26_35',label:'26–35'},{value:'36_plus',label:'36+'},prefer(false)]},
      ],
    },
    {
      title:ru?'Твой опыт':'Sinu kogemus',
      intro:ru?'В этом блоке один период сравнения — последние 12 месяцев. Одна алкогольная единица = 10 г чистого алкоголя: примерно 244 мл пива 5,2%, 106 мл вина 12% или 32 мл крепкого алкоголя 40%.':'Selles osas kasutame sama ajavahemikku — viimased 12 kuud. Üks alkoholiühik = 10 g puhast alkoholi: umbes 244 ml 5,2% õlut, 106 ml 12% veini või 32 ml 40% kanget alkoholi.',
      questions:[
        {id:'ownUse',type:'radio',title:ru?'За последние 12 месяцев как часто ты употреблял(а) напиток, содержащий алкоголь?':'Kui sageli tarvitasid viimase 12 kuu jooksul alkoholi sisaldavat jooki?',options:ru?[{value:'never',label:'Никогда'},{value:'less_monthly',label:'Реже одного раза в месяц'},{value:'monthly',label:'Примерно раз в месяц'},{value:'two_four_month',label:'2–4 раза в месяц'},{value:'two_three_week',label:'2–3 раза в неделю'},{value:'four_plus_week',label:'4 раза в неделю или чаще'},prefer(true)]:[{value:'never',label:'Mitte kunagi'},{value:'less_monthly',label:'Harvem kui kord kuus'},{value:'monthly',label:'Umbes kord kuus'},{value:'two_four_month',label:'2–4 korda kuus'},{value:'two_three_week',label:'2–3 korda nädalas'},{value:'four_plus_week',label:'4 korda nädalas või sagedamini'},prefer(false)]},
        {id:'typicalUnits',type:'radio',title:ru?'В обычный день употребления за последние 12 месяцев сколько алкогольных единиц ты обычно выпивал(а)?':'Mitu alkoholiühikut tarvitasid viimase 12 kuu jooksul tavalisel tarvitamispäeval?',hint:ru?'Если напитки были разными, оцени их суммарно. Это не медицинский тест и результат не является диагнозом.':'Kui joogid olid erinevad, hinda nende kogust kokku. See ei ole meditsiiniline test ega diagnoos.',showWhen:{field:'ownUse',notIn:['never','prefer_not']},options:ru?[{value:'1_2',label:'1–2'},{value:'3_4',label:'3–4'},{value:'5_6',label:'5–6'},{value:'7_9',label:'7–9'},{value:'10_plus',label:'10 или больше'},prefer(true)]:[{value:'1_2',label:'1–2'},{value:'3_4',label:'3–4'},{value:'5_6',label:'5–6'},{value:'7_9',label:'7–9'},{value:'10_plus',label:'10 või rohkem'},prefer(false)]},
        {id:'sixPlus',type:'radio',title:ru?'За последние 12 месяцев как часто ты употреблял(а) 6 или больше алкогольных единиц за один раз?':'Kui sageli tarvitasid viimase 12 kuu jooksul korraga 6 või rohkem alkoholiühikut?',showWhen:{field:'ownUse',notIn:['never','prefer_not']},options:ru?[{value:'never',label:'Никогда'},{value:'less_monthly',label:'Реже раза в месяц'},{value:'monthly',label:'Примерно раз в месяц'},{value:'weekly',label:'Примерно раз в неделю'},{value:'daily_almost',label:'Ежедневно или почти ежедневно'},prefer(true)]:[{value:'never',label:'Mitte kunagi'},{value:'less_monthly',label:'Harvem kui kord kuus'},{value:'monthly',label:'Umbes kord kuus'},{value:'weekly',label:'Umbes kord nädalas'},{value:'daily_almost',label:'Iga päev või peaaegu iga päev'},prefer(false)]},
        {id:'contexts',type:'multi',optional:true,title:ru?'В каких ситуациях употребление происходило чаще всего?':'Millistes olukordades toimus tarvitamine kõige sagedamini?',showWhen:{field:'ownUse',notIn:['never','prefer_not']},options:ru?[{value:'friends',label:'С друзьями'},{value:'family',label:'С семьёй или родственниками'},{value:'event',label:'На вечеринке или мероприятии'},{value:'alone',label:'В одиночку'},{value:'other',label:'Другое'},prefer(true)]:[{value:'friends',label:'Sõpradega'},{value:'family',label:'Pere või sugulastega'},{value:'event',label:'Peol või üritusel'},{value:'alone',label:'Üksi'},{value:'other',label:'Muu'},prefer(false)]},
        {id:'peerNorm',type:'radio',title:ru?'Насколько распространено употребление алкоголя среди людей примерно твоего возраста в твоём окружении?':'Kui levinud on alkoholitarvitamine sinu ümber olevate ligikaudu samaealiste inimeste seas?',options:ru?[{value:'rare',label:'Почти не встречается'},{value:'some',label:'Встречается у части людей'},{value:'common',label:'Довольно распространено'},{value:'very_common',label:'Очень распространено'},{value:'unsure',label:'Не знаю'},prefer(true)]:[{value:'rare',label:'Peaaegu ei esine'},{value:'some',label:'Esineb osal inimestest'},{value:'common',label:'Üsna levinud'},{value:'very_common',label:'Väga levinud'},{value:'unsure',label:'Ei tea'},prefer(false)]},
      ],
    },
    {
      title:ru?'Близкие':'Lähedased',
      intro:ru?'Во всех вопросах этого блока речь идёт о последних 12 месяцах. Не нужно указывать имена. «Близкий» — человек, с которым у тебя важные личные отношения.':'Kõik selle osa küsimused puudutavad viimast 12 kuud. Nimesid ei ole vaja märkida. „Lähedane“ tähendab inimest, kellega sul on oluline isiklik suhe.',
      questions:[
        {id:'closeExposure',type:'radio',title:ru?'Как часто за последние 12 месяцев ты видел(а) близкого человека заметно опьяневшим?':'Kui sageli oled viimase 12 kuu jooksul näinud lähedast inimest selgelt joobnuna?',options:freq(ru)},
        {id:'closeRelations',type:'multi',title:ru?'Кто это был? Можно выбрать несколько вариантов.':'Kes see oli? Võid valida mitu vastust.',showWhen:{field:'closeExposure',notIn:['never','prefer_not']},options:ru?[{value:'partner',label:'Партнёр'},{value:'family',label:'Член семьи или родственник'},{value:'friend',label:'Друг'},{value:'other',label:'Другой близкий человек'},prefer(true)]:[{value:'partner',label:'Partner'},{value:'family',label:'Pereliige või sugulane'},{value:'friend',label:'Sõber'},{value:'other',label:'Muu lähedane inimene'},prefer(false)]},
        {id:'closeHousehold',type:'radio',title:ru?'Жил ли кто-то из этих людей вместе с тобой хотя бы часть последних 12 месяцев?':'Kas mõni neist inimestest elas sinuga koos vähemalt osa viimase 12 kuu jooksul?',showWhen:{field:'closeExposure',notIn:['never','prefer_not']},options:ru?[{value:'yes',label:'Да'},{value:'sometimes',label:'Часть времени'},{value:'no',label:'Нет'},prefer(true)]:[{value:'yes',label:'Jah'},{value:'sometimes',label:'Osa ajast'},{value:'no',label:'Ei'},prefer(false)]},
        {id:'closeConflict',type:'radio',title:ru?'Как часто за последние 12 месяцев употребление алкоголя близким приводило к конфликтам или напряжению рядом с тобой?':'Kui sageli põhjustas lähedase alkoholitarvitamine viimase 12 kuu jooksul sinu läheduses konflikte või pinget?',options:freq(ru)},
        {id:'closeUnsafe',type:'radio',title:ru?'Как часто за последние 12 месяцев из-за употребления близкого ситуация казалась непредсказуемой или небезопасной?':'Kui sageli tundus olukord viimase 12 kuu jooksul lähedase alkoholitarvitamise tõttu ettearvamatu või ebaturvaline?',options:freq(ru)},
      ],
    },
    {
      title:ru?'Влияние на тебя':'Mõju sinule',
      intro:ru?'Во всех вопросах ниже речь идёт о последних 12 месяцах и только о ситуациях, связанных с употреблением алкоголя людьми вокруг тебя.':'Kõik allolevad küsimused puudutavad viimast 12 kuud ja ainult olukordi, mis on seotud sinu ümber olevate inimeste alkoholitarvitamisega.',
      questions:[
        {id:'worry',type:'radio',title:ru?'Я переживал(а) из-за употребления алкоголя близким человеком.':'Olen lähedase alkoholitarvitamise pärast muretsenud.',options:freq(ru)},
        {id:'sleep',type:'radio',title:ru?'Из-за этого мне было труднее спокойно спать или отдыхать.':'Selle tõttu oli mul raskem rahulikult magada või puhata.',options:freq(ru)},
        {id:'study',type:'radio',title:ru?'Из-за этого было труднее сосредоточиться на учёбе или работе.':'Selle tõttu oli raskem õppimisele või tööle keskenduda.',options:freq(ru)},
        {id:'mood',type:'radio',title:ru?'Это заметно влияло на моё настроение.':'See mõjutas märgatavalt minu meeleolu.',options:freq(ru)},
        {id:'avoid',type:'radio',title:ru?'Я старался(ась) избегать человека или ситуации из-за алкоголя.':'Olen alkoholi tõttu püüdnud inimest või olukorda vältida.',options:freq(ru)},
        {id:'unsafe',type:'radio',title:ru?'Из-за чужого употребления алкоголя я чувствовал(а) себя небезопасно.':'Olen teiste alkoholitarvitamise tõttu tundnud end ebaturvaliselt.',options:freq(ru)},
        {id:'extraResponsibility',type:'radio',title:ru?'Мне приходилось брать на себя дополнительные обязанности, заботиться о человеке или разбираться с последствиями его употребления.':'Pidin võtma enda peale lisakohustusi, hoolitsema inimese eest või tegelema tema alkoholitarvitamise tagajärgedega.',options:freq(ru)},
        {id:'overallImpact',type:'radio',title:ru?'В целом насколько употребление алкоголя другими людьми негативно повлияло на твоё благополучие за последние 12 месяцев?':'Kui tugevalt mõjutas teiste inimeste alkoholitarvitamine sinu heaolu viimase 12 kuu jooksul üldiselt negatiivselt?',options:ru?[{value:'none',label:'Не повлияло'},{value:'slight',label:'Незначительно'},{value:'moderate',label:'Умеренно'},{value:'strong',label:'Сильно'},{value:'very_strong',label:'Очень сильно'},prefer(true)]:[{value:'none',label:'Ei mõjutanud'},{value:'slight',label:'Vähesel määral'},{value:'moderate',label:'Mõõdukalt'},{value:'strong',label:'Tugevalt'},{value:'very_strong',label:'Väga tugevalt'},prefer(false)]},
      ],
    },
    {
      title:ru?'Среда и поддержка':'Keskkond ja tugi',
      intro:ru?'Последний блок — про социальное давление, возможность отказаться и знание о помощи.':'Viimane osa käsitleb sotsiaalset survet, keeldumise võimalust ja abi leidmist.',
      questions:[
        {id:'pressure',type:'radio',title:ru?'Как часто за последние 12 месяцев ты чувствовал(а) давление со стороны компании выпить алкоголь?':'Kui sageli oled viimase 12 kuu jooksul tundnud seltskonna survet alkoholi tarvitada?',options:freq(ru)},
        {id:'refusalNormal',type:'radio',title:ru?'Насколько нормально в твоём окружении отказаться от алкоголя без объяснений?':'Kui normaalne on sinu seltskonnas alkoholist keelduda ilma põhjendamata?',options:ru?[{value:'yes',label:'Полностью нормально'},{value:'mostly',label:'Скорее нормально'},{value:'unsure',label:'Не уверен(а)'},{value:'mostly_no',label:'Скорее сложно'},{value:'no',label:'Очень сложно'},prefer(true)]:[{value:'yes',label:'Täiesti normaalne'},{value:'mostly',label:'Pigem normaalne'},{value:'unsure',label:'Ei ole kindel'},{value:'mostly_no',label:'Pigem keeruline'},{value:'no',label:'Väga keeruline'},prefer(false)]},
        {id:'helpKnowledge',type:'radio',title:ru?'Знаешь ли ты, куда обратиться, если употребление алкоголя близким начинает мешать, тревожить или пугать?':'Kas tead, kuhu pöörduda, kui lähedase alkoholitarvitamine hakkab häirima, muret tekitama või hirmutama?',options:ru?[{value:'yes',label:'Да'},{value:'partly',label:'Примерно представляю'},{value:'no',label:'Нет'},prefer(true)]:[{value:'yes',label:'Jah'},{value:'partly',label:'Umbes tean'},{value:'no',label:'Ei'},prefer(false)]},
        {id:'supportChoice',type:'radio',title:ru?'К кому тебе было бы проще всего обратиться в такой ситуации?':'Kelle poole oleks sellises olukorras kõige lihtsam pöörduda?',options:ru?[{value:'friend',label:'К другу'},{value:'family',label:'К близкому взрослому'},{value:'school',label:'К специалисту школы или университета'},{value:'doctor',label:'К медицинскому или психологическому специалисту'},{value:'helpline',label:'В анонимную службу помощи'},{value:'none',label:'Ни к кому из перечисленных'},prefer(true)]:[{value:'friend',label:'Sõbra poole'},{value:'family',label:'Lähedase täiskasvanu poole'},{value:'school',label:'Kooli või ülikooli spetsialisti poole'},{value:'doctor',label:'Tervishoiu- või vaimse tervise spetsialisti poole'},{value:'helpline',label:'Anonüümse abiteenuse poole'},{value:'none',label:'Mitte kellegi nimetatu poole'},prefer(false)]},
      ],
    },
  ];
}
