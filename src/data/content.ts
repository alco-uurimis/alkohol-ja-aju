export interface Source { id:number; organization:string; title:string; originalTitle:string; year:number|null; url:string; accessed:string; note:string }
export const sources:Source[] = [
 {id:1,organization:'NIAAA · USA riiklik alkoholiuuringute instituut',title:'Alkohol ja nooruki aju',originalTitle:'Alcohol and the Adolescent Brain',year:null,url:'https://www.niaaa.nih.gov/publications/alcohol-and-adolescent-brain',accessed:'2026-09-25',note:'Aju areng, vahetu toime ja pikaajalised seosed. Lehel ei olnud selget ilmumisaastat.'},
 {id:2,organization:'NIAAA',title:'Katkenud mälestused: alkoholist tingitud mälulüngad',originalTitle:'Interrupted Memories: Alcohol-Induced Blackouts',year:null,url:'https://www.niaaa.nih.gov/publications/brochures-and-fact-sheets/interrupted-memories-alcohol-induced-blackouts',accessed:'2026-09-25',note:'Mälestuste talletamine ja mälulünga erinevus teadvusekaotusest. Ilmumisaasta pole märgitud.'},
 {id:3,organization:'NHTSA · USA liiklusohutuse amet',title:'Alkoholijoobes juhtimine',originalTitle:'Drunk Driving',year:null,url:'https://www.nhtsa.gov/risky-driving/drunk-driving',accessed:'2026-09-25',note:'Tähelepanu, infotöötlus ja reageerimine. Liikluskonteksti tulemusi ei kasutata siin isikliku riski arvutamiseks. Ilmumisaasta pole märgitud.'},
 {id:4,organization:'MedlinePlus · USA riiklik meditsiiniraamatukogu',title:'Müüdid alkoholi tarvitamisest',originalTitle:'Myths about drinking alcohol',year:2024,url:'https://www.medlineplus.gov/ency/patientinstructions/000856.htm',accessed:'2026-09-25',note:'Kohv ja kainenemine. Aasta tähistab lehe sisulise ülevaatuse aastat (17.07.2024).'},
 {id:5,organization:'NIAAA',title:'Pohmell',originalTitle:'Hangovers',year:null,url:'https://www.niaaa.nih.gov/publications/brochures-and-fact-sheets/hangovers',accessed:'2026-09-25',note:'Alkohol ja katkendlik uni. Ilmumisaasta pole märgitud.'},
 {id:6,organization:'NIAAA',title:'Aju sõltuvuse ja taastumise ajal',originalTitle:'Neuroscience: The Brain in Addiction and Recovery',year:null,url:'https://www.niaaa.nih.gov/health-professionals-communities/core-resource-on-alcohol/neuroscience-brain-addiction-and-recovery',accessed:'2026-09-25',note:'Korduva rohke tarvitamise mõju. Ilmumisaasta pole märgitud.'},
];
export const topics = [
 {id:'memory',title:'Mälu',subtitle:'Kuidas kogemus meelde jääb?',symbol:'01',body:'Alkohol võib häirida uute mälestuste talletamist. Kui mälestus ei kujune, ei ole seda hiljem võimalik lihtsalt meenutamisega taastada.',detail:'Hipokampus osaleb uute mälestuste kujunemises. Alkoholist tingitud mälulünga ajal võib inimene olla ärkvel, kuid sündmused ei talletu tavapäraselt. Täieliku mälulünga puhul ei pruugi need hiljem meenuda ka vihjete abil.',refs:[2]},
 {id:'attention',title:'Tähelepanu',subtitle:'Mida märkad ja mille kõrvale jätad?',symbol:'02',body:'Alkohol võib raskendada keskendumist ja tähelepanu jagamist mitme ülesande vahel.',detail:'Ülesannete vahetamine tähendab fookuse ümber suunamist; jagatud tähelepanu puhul tuleb jälgida mitut asja korraga. Liiklusuuringute ülevaade kirjeldab alkoholi mõju jagatud tähelepanule, visuaalsele otsingule ja infotöötlusele. See ei anna selle veebiharjutuse tulemusele meditsiinilist tähendust.',refs:[3]},
 {id:'reaction',title:'Reaktsioonikiirus',subtitle:'Märkamisest tegutsemiseni.',symbol:'03',body:'Alkoholi mõjul võib reageerimine aeglustuda: häiritud võivad olla nii info töötlemine kui ka sellele vastamine.',detail:'Näiteks ootamatule olukorrale reageerimine nõuab märkamist, valikut ja liigutust. Alkoholi mõju ei piirdu ühe neist sammudest. Siinsed harjutused ei mõõda sõidukõlblikkust.',refs:[3]},
 {id:'decision',title:'Otsustamine',subtitle:'Kuidas kaalud valikute tagajärgi?',symbol:'04',body:'Alkohol võib nõrgendada otsustusvõimet ja impulsside pidurdamist.',detail:'Noorukieas arenevad veel planeerimise ja enesekontrolliga seotud ajusüsteemid. Alkohol võib muuta impulsside kontrollimise keerulisemaks. See ei tähenda, et kõigil inimestel oleks sama reaktsioon või sama arengutempo.',refs:[1]},
];
export const science = {
 acute:'Vahetu toime tähendab muutusi tarvitamise ajal: näiteks mälestuste talletamise või otsustamise häirumist.',
 repeated:'Korduvat rohket tarvitamist seostatakse mälu, tähelepanu ja enesekontrolliga seotud ajusüsteemide muutustega. Seda ei saa järeldada ühest veebiharjutusest.',
 correlation:'Seos ei tõesta üksinda põhjust. Uuringus koos esinevaid nähtusi võivad mõjutada ka muud tegurid. Ühe inimese tulevikku ei saa rühma tulemuse põhjal ette ennustada.',
 memory:'See on äratundmisülesanne: jätsid sõnad meelde, tegid vahepeal midagi muud ja tundsid need hiljem ära. Ülesanne puudutab info ajutist meelespidamist ja hilisemat äratundmist; see ei mõõda eraldi töömälu mahtu. Tulemus kirjeldab ainult seda katset.',
 memoryAlcohol:'Alkohol võib häirida uute mälestuste talletamist. Seda teadmist ei saa tõestada ega ümber lükata sinu tulemusega selles harjutuses.',
 attention:'Valikuline tähelepanu tähendab siin vajaliku märgi leidmist segavate märkide seast. Tulemus hõlmab ka märgi nägemist ja vastuse sisestamist ning ei ole puhas tähelepanu mõõt.',
 attentionAlcohol:'Alkohol võib häirida keskendumist ja tähelepanu jagamist. See harjutus ei näita, mida joobes inimene näeks või tunneks.',
};
export interface Question {id:string; statement:string; fact:boolean; explanation:string; refs:number[]; status:'verified'|'[ALLIKAS VAJALIK]'}
export const questions:Question[] = [
 {id:'coffee',statement:'Kohv teeb inimese kiiresti kaineks.',fact:false,explanation:'Kohv võib suurendada ärksust, kuid ei taasta alkoholist häiritud koordinatsiooni ega otsustusvõimet. Alkoholi lagundamiseks vajab organism aega.',refs:[4],status:'verified'},
 {id:'blackout',statement:'Mälulünga ajal võib inimene olla ärkvel.',fact:true,explanation:'Mälulünk ei ole sama mis teadvusekaotus. Inimene võib olla ärkvel, kuigi uusi mälestusi ei talletu.',refs:[2],status:'verified'},
 {id:'attention',statement:'Alkohol võib raskendada kahe ülesande korraga jälgimist.',fact:true,explanation:'Alkohol võib häirida jagatud tähelepanu ehk mitme tegevuse samaaegset jälgimist.',refs:[3],status:'verified'},
 {id:'reaction',statement:'Alkohol muudab ootamatule olukorrale reageerimise kiiremaks.',fact:false,explanation:'Alkohol võib aeglustada reageerimist ning häirida info töötlemist ja liigutuste koordineerimist.',refs:[3],status:'verified'},
 {id:'sleep',statement:'Kiirem uinumine pärast alkoholi tähendab alati paremat und.',fact:false,explanation:'Kuigi uinumine võib olla kiirem, võib uni muutuda katkendlikuks ja ärkamine varasemaks.',refs:[5],status:'verified'},
 {id:'decisions',statement:'Alkohol võib nõrgendada impulsside kontrollimist.',fact:true,explanation:'Alkohol võib häirida otsustamist ja muuta hetkeimpulsside pidurdamise keerulisemaks.',refs:[1],status:'verified'},
 {id:'development',statement:'Gümnaasiumieas on aju areng juba täielikult lõppenud.',fact:false,explanation:'Aju areng jätkub ka pärast noorukiiga. Planeerimise ja otsustamisega seotud piirkonnad küpsevad veel noores täiskasvanueas.',refs:[1],status:'verified'},
 {id:'recover',statement:'Täieliku alkoholist tingitud mälulünga sündmused ei pruugi hiljem meenuda.',fact:true,explanation:'Kui mälestusi ei moodustunud, ei saa neid hiljem lihtsalt meenutades taastada.',refs:[2],status:'verified'},
];
export const takeaways = [
 {title:'Mälu',text:'Meenutamiseks peab mälestus esmalt kujunema. Alkohol võib seda takistada.',refs:[2]},
 {title:'Tähelepanu',text:'Mitme asja korraga jälgimine võib alkoholi mõjul raskeneda.',refs:[3]},
 {title:'Reaktsioon',text:'Märkamine ja sellele vastamine võivad aeglustuda.',refs:[3]},
 {title:'Otsustamine',text:'Alkohol võib nõrgendada enesekontrolli ja otsustusvõimet.',refs:[1]},
 {title:'Uni',text:'Kiiremini magama jäämine ei tähenda tingimata paremat und.',refs:[5]},
];
// TODO [ALLIKAS VAJALIK]: Add any new quantitative or task-switching-specific
// claims only after checking a suitable source. This is an editorial queue,
// not a fabricated reference and is deliberately not displayed as a fact.
export const pendingClaims = [{claim:'Eraldi hinnang alkoholi mõjule ülesannete vahetamisel.',status:'[ALLIKAS VAJALIK]'}];
// Editable project metadata; never invent personal names.
export const project = {author:'Sofija Tsaika',school:'Tallinna Laagna Gümnaasium',supervisor:'[Juhendaja nimi]',year:'2026'};
