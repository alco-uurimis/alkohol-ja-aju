import { InfoCard, Section, SourceReference } from './Shared';

export default function Reflection({lang}:{lang:'et'|'ru'}){
  const ru=lang==='ru';
  const checks:[string,string][]=ru?[
    ['Отдели факт от вывода','Какая часть утверждения прямо показана исследованием, а где начинается более широкий вывод?'],
    ['Назови ограничение','Подумай, относятся ли данные к взрослым, подросткам, лабораторной задаче или наблюдению в обычной жизни.'],
    ['Проверь применимость','Почему результат мини-игры не может определить состояние здоровья, опьянение или способность управлять автомобилем?'],
  ]:[
    ['Erista fakt järeldusest','Milline osa väitest on uuringus otseselt näidatud ja kus algab laiem järeldus?'],
    ['Nimeta piirang','Mõtle, kas andmed käivad täiskasvanute, noorukite, laboriülesande või tavaelu vaatluse kohta.'],
    ['Kontrolli rakendatavust','Miks ei saa minimängu tulemus määrata terviseseisundit, joovet ega sõiduvõimet?'],
  ];
  const prompts:[string,string,number[]][]=ru?[
    ['Как говорить о риске без запугивания?','Обсуди, почему точная информация, границы вывода и уважительный тон помогают больше, чем страшные истории.',[14]],
    ['Какие ситуации повышают риск?','Подумай о компании, давлении сверстников, сочетании с вождением и быстром употреблении. Не нужно делиться личным опытом.',[12]],
    ['Почему важны разные виды исследований?','Сравни, что могут показать лабораторный эксперимент, обзор исследований и наблюдение за группой людей.',[13]],
  ]:[
    ['Kuidas rääkida riskist hirmutamata?','Arutle, miks täpne teave, järelduste piirid ja lugupidav toon aitavad rohkem kui hirmulood.',[14]],
    ['Millised olukorrad suurendavad riski?','Mõtle seltskonnale, eakaaslaste survele, juhtimisega seostamisele ja alkoholi kiirele tarvitamisele. Isiklikku kogemust ei ole vaja jagada.',[12]],
    ['Miks on eri tüüpi uuringud tähtsad?','Võrdle, mida võivad näidata laborikatse, uuringute ülevaade ja inimrühma jälgimine.',[13]],
  ];
  return <>
    <Section id="samoprov" number={ru?'08 / САМОПРОВЕРКА':'08 / ENESEKONTROLL'} title={ru?'Проверь ход рассуждения':'Kontrolli oma arutluskäiku'} intro={ru?'Это не тест на здоровье и не оценка. Эти три вопроса помогают заметить, как читать научное утверждение аккуратно.':'See ei ole tervisetest ega hinnang. Need kolm küsimust aitavad teadusväidet tähelepanelikult lugeda.'} className="reflection-section">
      <div className="reflection-grid">{checks.map(([title,text],i)=><InfoCard key={title} title={title}><span className="takeaway-number" aria-hidden="true">0{i+1}</span><p>{text}</p></InfoCard>)}</div>
    </Section>
    <Section id="obsuzhdenie" number={ru?'09 / ОБСУДИ':'09 / ARUTLE'} title={ru?'Вопросы для спокойного обсуждения':'Küsimused rahulikuks aruteluks'} intro={ru?'Их можно обсудить на уроке, дома или самостоятельно. Не нужно рассказывать о личном употреблении алкоголя.':'Neid saab arutada tunnis, kodus või iseseisvalt. Isiklikust alkoholitarvitamisest ei ole vaja rääkida.'} className="reflection-section discussion-section">
      <div className="reflection-grid">{prompts.map(([title,text,refs],i)=><InfoCard key={title} title={title}><span className="takeaway-number" aria-hidden="true">0{i+1}</span><p>{text} <SourceReference ids={refs} lang={lang}/></p></InfoCard>)}</div>
    </Section>
  </>;
}

