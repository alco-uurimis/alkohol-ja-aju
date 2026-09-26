export type Lang='et'|'ru';
export type Option={value:string;label:string};
export type Question={id:string;title:string;type:'radio'|'multi';options:Option[];optional?:boolean;showWhen?:{field:string;notIn:string[]}};
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
      intro:ru?'Опрос предназначен только для совершеннолетних. Участие добровольное.':'Küsitlus on mõeldud ainult täisealistele. Osalemine on vabatahtlik.',
      questions:[
        {id:'adult',type:'radio',title:ru?'Тебе исполнилось 18 лет?':'Kas oled vähemalt 18-aastane?',options:ru?[{value:'yes',label:'Да'},{value:'no',label:'Нет'}]:[{value:'yes',label:'Jah'},{value:'no',label:'Ei'}]},
        {id:'consent',type:'radio',title:ru?'Согласен(на) добровольно участвовать и отправить обезличенные ответы для учебно-исследовательского анализа?':'Kas nõustud vabatahtlikult osalema ja saatma isikustamata vastused õppe- ja uurimisanalüüsiks?',options:ru?[{value:'yes',label:'Да, условия понятны'},{value:'no',label:'Нет'}]:[{value:'yes',label:'Jah, tingimused on arusaadavad'},{value:'no',label:'Ei'}]},
        {id:'ageGroup',type:'radio',title:ru?'Возрастная группа':'Vanuserühm',options:ru?[{value:'18_20',label:'18–20'},{value:'21_25',label:'21–25'},{value:'26_35',label:'26–35'},{value:'36_plus',label:'36+'},prefer(true)]:[{value:'18_20',label:'18–20'},{value:'21_25',label:'21–25'},{value:'26_35',label:'26–35'},{value:'36_plus',label:'36+'},prefer(false)]},
      ],
    },
    {
      title:ru?'Твой опыт':'Sinu kogemus',
      intro:ru?'Вопросы о частоте и контексте. Количество алкоголя в граммах или напитках мы не спрашиваем.':'Küsimused käsitlevad sagedust ja olukorda. Alkoholi kogust grammides või jookides me ei küsi.',
      questions:[
        {id:'ownUse',type:'radio',title:ru?'Как лучше всего описать твой опыт употребления алкоголя?':'Kuidas kirjeldaksid kõige paremini enda alkoholitarvitamise kogemust?',options:ru?[{value:'never',label:'Никогда'},{value:'once',label:'Пробовал(а) несколько раз'},{value:'rare',label:'Реже раза в месяц'},{value:'monthly',label:'Примерно раз в месяц или чаще'},{value:'weekly_plus',label:'Примерно раз в неделю или чаще'},prefer(true)]:[{value:'never',label:'Mitte kunagi'},{value:'once',label:'Olen proovinud mõnel korral'},{value:'rare',label:'Harvem kui kord kuus'},{value:'monthly',label:'Umbes kord kuus või sagedamini'},{value:'weekly_plus',label:'Umbes kord nädalas või sagedamini'},prefer(false)]},
        {id:'last30',type:'radio',title:ru?'В сколько дней за последние 30 дней ты употреблял(а) алкоголь?':'Mitmel päeval viimase 30 päeva jooksul tarvitasid alkoholi?',options:ru?[{value:'0',label:'0'},{value:'1_2',label:'1–2'},{value:'3_5',label:'3–5'},{value:'6_plus',label:'6 или больше'},prefer(true)]:[{value:'0',label:'0'},{value:'1_2',label:'1–2'},{value:'3_5',label:'3–5'},{value:'6_plus',label:'6 või rohkem'},prefer(false)]},
        {id:'contexts',type:'multi',optional:true,title:ru?'В каких ситуациях это чаще происходило?':'Millistes olukordades seda sagedamini juhtus?',showWhen:{field:'ownUse',notIn:['never','prefer_not']},options:ru?[{value:'friends',label:'С друзьями'},{value:'family',label:'С семьёй или родственниками'},{value:'event',label:'На вечеринке или мероприятии'},{value:'alone',label:'В одиночку'},{value:'other',label:'Другое'},prefer(true)]:[{value:'friends',label:'Sõpradega'},{value:'family',label:'Pere või sugulastega'},{value:'event',label:'Peol või üritusel'},{value:'alone',label:'Üksi'},{value:'other',label:'Muu'},prefer(false)]},
        {id:'peerNorm',type:'radio',title:ru?'Насколько распространено употребление алкоголя среди людей твоего возраста вокруг тебя?':'Kui levinud on alkoholitarvitamine sinu ümber olevate samaealiste seas?',options:ru?[{value:'rare',label:'Почти не встречается'},{value:'some',label:'Встречается у части людей'},{value:'common',label:'Довольно распространено'},{value:'very_common',label:'Очень распространено'},{value:'unsure',label:'Не знаю'},prefer(true)]:[{value:'rare',label:'Peaaegu ei esine'},{value:'some',label:'Esineb osal inimestest'},{value:'common',label:'Üsna levinud'},{value:'very_common',label:'Väga levinud'},{value:'unsure',label:'Ei tea'},prefer(false)]},
      ],
    },
    {
      title:ru?'Близкие':'Lähedased',
      intro:ru?'Не нужно указывать имена. «Близкий» означает человека, с которым у тебя важные личные отношения.':'Nimesid ei ole vaja kirjutada. „Lähedane“ tähendab inimest, kellega sul on oluline isiklik suhe.',
      questions:[
        {id:'closeExposure',type:'radio',title:ru?'Как часто за последний год ты видел(а) близкого человека заметно опьяневшим?':'Kui sageli oled viimase aasta jooksul näinud lähedast inimest selgelt joobnuna?',options:freq(ru)},
        {id:'closeRelations',type:'multi',optional:true,title:ru?'Кто это был? Можно выбрать несколько.':'Kes see oli? Võib valida mitu.',showWhen:{field:'closeExposure',notIn:['never','prefer_not']},options:ru?[{value:'partner',label:'Партнёр'},{value:'family',label:'Член семьи или родственник'},{value:'friend',label:'Друг'},{value:'other',label:'Другой близкий человек'},prefer(true)]:[{value:'partner',label:'Partner'},{value:'family',label:'Pereliige või sugulane'},{value:'friend',label:'Sõber'},{value:'other',label:'Muu lähedane inimene'},prefer(false)]},
        {id:'closeConflict',type:'radio',title:ru?'Как часто употребление алкоголя близким приводило к конфликтам или напряжению рядом с тобой?':'Kui sageli on lähedase alkoholitarvitamine põhjustanud sinu läheduses konflikte või pinget?',options:freq(ru)},
        {id:'closeUnsafe',type:'radio',title:ru?'Как часто из-за употребления близкого ситуация казалась непредсказуемой или небезопасной?':'Kui sageli tundus olukord lähedase tarvitamise tõttu ettearvamatu või ebaturvaline?',options:freq(ru)},
      ],
    },
    {
      title:ru?'Влияние на тебя':'Mõju sinule',
      intro:ru?'Отвечай только о ситуациях, связанных с употреблением алкоголя людьми вокруг тебя.':'Vasta ainult olukordade kohta, mis on seotud sinu ümber olevate inimeste alkoholitarvitamisega.',
      questions:[
        {id:'worry',type:'radio',title:ru?'Я переживал(а) из-за употребления близкого.':'Olen lähedase tarvitamise pärast muretsenud.',options:freq(ru)},
        {id:'sleep',type:'radio',title:ru?'Это мешало мне спокойно спать или отдыхать.':'See on häirinud minu und või puhkamist.',options:freq(ru)},
        {id:'study',type:'radio',title:ru?'Из-за этого было труднее сосредоточиться на учёбе или работе.':'Selle tõttu oli raskem õppimisele või tööle keskenduda.',options:freq(ru)},
        {id:'mood',type:'radio',title:ru?'Это заметно влияло на моё настроение.':'See mõjutas märgatavalt minu meeleolu.',options:freq(ru)},
        {id:'avoid',type:'radio',title:ru?'Я старался(ась) избегать человека или ситуации из-за алкоголя.':'Olen alkoholi tõttu püüdnud inimest või olukorda vältida.',options:freq(ru)},
        {id:'unsafe',type:'radio',title:ru?'Я чувствовал(а) себя небезопасно.':'Olen tundnud end ebaturvaliselt.',options:freq(ru)},
      ],
    },
    {
      title:ru?'Среда и поддержка':'Keskkond ja tugi',
      intro:ru?'Последний блок — про социальное давление, отказ и знание о помощи.':'Viimane osa käsitleb sotsiaalset survet, keeldumist ja abi leidmist.',
      questions:[
        {id:'pressure',type:'radio',title:ru?'Как часто ты чувствовал(а) давление со стороны компании выпить алкоголь?':'Kui sageli oled tundnud seltskonna survet alkoholi tarvitada?',options:freq(ru)},
        {id:'refusalNormal',type:'radio',title:ru?'Насколько нормально в твоём окружении отказаться от алкоголя без объяснений?':'Kui normaalne on sinu seltskonnas alkoholist keelduda ilma põhjendamata?',options:ru?[{value:'yes',label:'Полностью нормально'},{value:'mostly',label:'Скорее нормально'},{value:'unsure',label:'Не уверен(а)'},{value:'mostly_no',label:'Скорее сложно'},{value:'no',label:'Очень сложно'},prefer(true)]:[{value:'yes',label:'Täiesti normaalne'},{value:'mostly',label:'Pigem normaalne'},{value:'unsure',label:'Ei ole kindel'},{value:'mostly_no',label:'Pigem keeruline'},{value:'no',label:'Väga keeruline'},prefer(false)]},
        {id:'helpKnowledge',type:'radio',title:ru?'Знаешь ли ты, куда обратиться, если употребление алкоголя близким начинает мешать или пугать?':'Kas tead, kuhu pöörduda, kui lähedase alkoholitarvitamine hakkab häirima või hirmutama?',options:ru?[{value:'yes',label:'Да'},{value:'partly',label:'Примерно представляю'},{value:'no',label:'Нет'},prefer(true)]:[{value:'yes',label:'Jah'},{value:'partly',label:'Umbes tean'},{value:'no',label:'Ei'},prefer(false)]},
        {id:'supportChoice',type:'radio',title:ru?'К кому тебе было бы проще всего обратиться в такой ситуации?':'Kelle poole oleks sellises olukorras kõige lihtsam pöörduda?',options:ru?[{value:'friend',label:'К другу'},{value:'family',label:'К близкому взрослому'},{value:'school',label:'К школьному или университетскому специалисту'},{value:'doctor',label:'К медицинскому специалисту'},{value:'helpline',label:'В анонимную службу помощи'},{value:'none',label:'Ни к кому из перечисленных'},prefer(true)]:[{value:'friend',label:'Sõbra poole'},{value:'family',label:'Lähedase täiskasvanu poole'},{value:'school',label:'Kooli või ülikooli spetsialisti poole'},{value:'doctor',label:'Tervishoiuspetsialisti poole'},{value:'helpline',label:'Anonüümse abiteenuse poole'},{value:'none',label:'Mitte kellegi nimetatu poole'},prefer(false)]},
      ],
    },
  ];
}
