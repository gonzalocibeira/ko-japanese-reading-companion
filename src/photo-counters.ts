import {normalizePhotoLabel,singularPhotoLabel} from './photo-vocabulary';

// Readings and usage checked against TUFS, UT Austin JOSHU, and the Japan
// Foundation. English labels are Kō's own mappings for likely image detections.
export const photoCounterGuide='https://www.coelang.tufs.ac.jp/mt/ja/gmod/contents/explanation/017.html';

interface CounterRule {reading:string;changes?:Partial<Record<number,string>>;labels:string[]}
const rules={
  本:{reading:'ほん',changes:{1:'いっぽん',3:'さんぼん',6:'ろっぽん',8:'はっぽん',10:'じゅっぽん'},labels:[
    'bottle','water bottle','plastic bottle','glass bottle','wine bottle','beer bottle','pen','pencil','marker',
    'umbrella','straw','candle','carrot','banana','cucumber','screwdriver','pole','tree','branch','stick','log',
    'cable','rope','skewer',
  ]},
  冊:{reading:'さつ',changes:{1:'いっさつ',8:'はっさつ',10:'じゅっさつ'},labels:[
    'book','notebook','magazine','textbook','comic book','dictionary','booklet','photo album','cookbook','sketchbook',
    'journal',
  ]},
  枚:{reading:'まい',labels:[
    'paper','sheet of paper','leaf','picture','photograph','photo','card','plate','ticket','sticker','postcard',
    'stamp','sheet','towel','handkerchief','shirt','t shirt','banknote','poster','painting','disc','cd','dvd',
  ]},
  匹:{reading:'ひき',changes:{1:'いっぴき',3:'さんびき',6:'ろっぴき',8:'はっぴき',10:'じゅっぴき'},labels:[
    'animal','pet','cat','kitten','dog','puppy','rabbit','fish','goldfish','hamster','mouse','rat','squirrel','frog',
    'toad','turtle','lizard','snake','insect','butterfly','beetle','bee','ant','spider','crab','shrimp','lobster',
    'snail','squid','octopus','monkey','fox','raccoon',
  ]},
  個:{reading:'こ',changes:{1:'いっこ',6:'ろっこ',8:'はっこ',10:'じゅっこ'},labels:[
    'ball','apple','orange','egg','cup','glass','mug','bowl','bean','stone','box','cookie','onion','tomato','potato',
    'peach','pear','strawberry','lemon','lime','rock','coin','button','dice','die','block','brick','doughnut','donut',
    'bun','sandwich','candy','bead','battery','can',
  ]},
  台:{reading:'だい',labels:[
    'car','sports car','passenger car','truck','pickup truck','bus','van','minivan','taxi','motorcycle','motorbike',
    'bicycle','bike','scooter','tractor','ambulance','police car','fire truck','forklift','excavator','machine',
    'computer','laptop','tablet','phone','mobile phone','smartphone','television','tv','monitor','camera','printer',
    'refrigerator','fridge','microwave','washing machine','vacuum cleaner','air conditioner','fan','piano',
  ]},
  人:{reading:'にん',changes:{4:'よにん'},labels:[
    'person','human','man','woman','adult','child','boy','girl','baby','toddler','teenager','student','teacher',
    'worker','pedestrian','rider','driver','cyclist','runner','player','athlete','tourist','customer','passenger',
    'chef','waiter','nurse','doctor','police officer','firefighter','skateboarder','skier','surfer',
  ]},
  頭:{reading:'とう',changes:{1:'いっとう',8:'はっとう',10:'じゅっとう'},labels:[
    'horse','cow','bull','cattle','ox','donkey','elephant','giraffe','zebra','bear','lion','tiger','hippopotamus',
    'rhinoceros','rhino','camel','buffalo','sheep','goat','deer','whale',
  ]},
  羽:{reading:'わ',labels:[
    'bird','chicken','rooster','hen','duck','goose','swan','pigeon','dove','sparrow','crow','raven','eagle','hawk',
    'owl','parrot','penguin','flamingo','seagull',
  ]},
  軒:{reading:'けん',changes:{1:'いっけん',3:'さんげん',6:'ろっけん',8:'はっけん',10:'じゅっけん'},labels:[
    'house','home','cottage','shop','store','convenience store','restaurant','cafe','coffee shop','bakery',
    'bookstore','movie theater','cinema',
  ]},
  足:{reading:'そく',changes:{1:'いっそく',3:'さんぞく',8:'はっそく',10:'じゅっそく'},labels:[
    'pair of shoes','pair of boots','pair of socks','pair of sandals','pair of slippers','pair of sneakers',
  ]},
  着:{reading:'ちゃく',changes:{1:'いっちゃく',8:'はっちゃく',10:'じゅっちゃく'},labels:[
    'coat','jacket','dress','suit','kimono','uniform','outfit','raincoat','swimsuit','costume',
  ]},
  隻:{reading:'せき',changes:{1:'いっせき',8:'はっせき',10:'じゅっせき'},labels:[
    'ship','ferry','cargo ship','cruise ship','warship','tanker','container ship','battleship','aircraft carrier',
  ]},
  脚:{reading:'きゃく',changes:{1:'いっきゃく',6:'ろっきゃく',8:'はっきゃく',10:'じゅっきゃく'},labels:[
    'chair','stool','office chair','dining chair',
  ]},
  両:{reading:'りょう',labels:['train car','train carriage','railcar','railway carriage','subway car']},
  機:{reading:'き',changes:{1:'いっき',6:'ろっき',8:'はっき',10:'じゅっき'},labels:[
    'airplane','aeroplane','plane','aircraft','airliner','helicopter','jet plane','fighter jet',
  ]},
  杯:{reading:'はい',changes:{1:'いっぱい',3:'さんばい',6:'ろっぱい',8:'はっぱい',10:'じゅっぱい'},labels:[
    'cup of coffee','cup of tea','cup of water','glass of water','glass of wine','glass of beer','mug of beer',
    'bowl of soup','bowl of rice','bowl of noodles',
  ]},
} satisfies Record<string,CounterRule>;

type Counter=keyof typeof rules;
const knownLabels=new Map<string,Counter>();
for(const counter of Object.keys(rules) as Counter[]) {
  for(const label of rules[counter].labels)knownLabels.set(label,counter);
}
const animateCounters=new Set<Counter>(['人','匹','頭','羽']);
const generalObjects=new Set(['bag','backpack','handbag','purse','wallet','suitcase','luggage tag','pillow','cushion','blanket','toy','gift','container','basket','bucket','park','parcel','package','shelf']);
const uncountableLabels=new Set(['sky','snow','sand','grass','water','ground','paved ground','dirt','soil','smoke','fog','mist','rain','crowd','flock','herd','group of people']);
const irregularLabels:ReadonlyMap<string,string>=new Map([
  ['people','person'],['men','man'],['women','woman'],['children','child'],['mice','mouse'],['geese','goose'],['oxen','ox'],['shelves','shelf'],
  ['cups of coffee','cup of coffee'],['cups of tea','cup of tea'],['cups of water','cup of water'],['glasses of water','glass of water'],['glasses of wine','glass of wine'],['glasses of beer','glass of beer'],
]);
const digitWords='一二三四五六七八九';
const digitReadings=['','いち','に','さん','よん','ご','ろく','なな','はち','きゅう'];
const nativeReadings=['ひとつ','ふたつ','みっつ','よっつ','いつつ','むっつ','ななつ','やっつ','ここのつ','とお'];
const visualModifiers=/^(?:(?:black|white|red|blue|green|yellow|orange|brown|gray|grey|pink|purple|beige|silver|golden|large|small|tiny) )+/;

function normalizedKind(raw:string) {
  const original=normalizePhotoLabel(raw);
  if(knownLabels.has(original) || generalObjects.has(original) || uncountableLabels.has(original))return original;
  const label=original.replace(visualModifiers,'');
  if(knownLabels.has(label) || generalObjects.has(label) || uncountableLabels.has(label))return label;
  const pair=label.replace(/^pairs of /,'pair of ');
  return irregularLabels.get(label) ?? (knownLabels.has(pair)?pair:singularPhotoLabel(label));
}

function numberParts(count:number) {
  const tens=Math.floor(count/10),ones=count%10;
  const word=(tens?(tens===1?'':digitWords[tens-1])+'十':'')+(ones?digitWords[ones-1]:'');
  const prefix=tens?(tens===1?'':digitReadings[tens])+'じゅう':'';
  return {tens,ones,word,prefix};
}

function specificCount(count:number,counter:Counter):PhotoCount {
  const {tens,ones,word,prefix}=numberParts(count);
  if(counter==='人' && count<=2)return {kind:'word',word:word+counter,reading:count===1?'ひとり':'ふたり'};
  const rule:CounterRule=rules[counter];
  const changes=rule.changes ?? {};
  const reading=ones
    ? prefix+(changes[ones] ?? digitReadings[ones]+rule.reading)
    : (tens===1?'':digitReadings[tens])+(changes[10] ?? 'じゅう'+rule.reading);
  return {kind:'word',word:word+counter,reading};
}

type PhotoCount=
  | {kind:'word'|'general'|'offer-general';word:string;reading:string}
  | {kind:'empty'|'mixed'|'unsupported'|'out-of-range'};

export function countPhotoObjects(labels:readonly string[],useGeneral=false):PhotoCount {
  const count=labels.length;
  if(!count)return {kind:'empty'};
  if(count>99)return {kind:'out-of-range'};
  const kinds=labels.map(normalizedKind),counters=kinds.map(kind=>knownLabels.get(kind));
  const first=counters[0];
  if(first && counters.every(counter=>counter===first))return specificCount(count,first);
  if(counters.some(counter=>counter && animateCounters.has(counter)))return {kind:'mixed'};
  if(kinds.some(kind=>uncountableLabels.has(kind)))return {kind:'unsupported'};
  // Unknown model labels need an explicit choice before using the counter for things.
  const generalKind=useGeneral || kinds.every(kind=>generalObjects.has(kind))?'general':'offer-general';
  const {word,prefix,ones}=numberParts(count);
  return {
    kind:generalKind,word:count<10?word+'つ':word,
    reading:count<=10?nativeReadings[count-1]:prefix+digitReadings[ones],
  };
}
