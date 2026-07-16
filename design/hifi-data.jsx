// Shared data + helpers for S+M app

const TOGETHER_SINCE = new Date('2024-01-21');
const TODAY = new Date('2026-05-14'); // pinned for the prototype
const daysBetween = (a, b) => Math.floor((b - a) / 86400000);
const DAYS_TOGETHER = daysBetween(TOGETHER_SINCE, TODAY);

const MOMENTS = [
  {
    id: 'wien-26',
    title: 'Víkend vo Viedni',
    place: 'Viedeň · Rakúsko',
    placeShort: 'Viedeň, AT',
    date: '12. – 14. apríl 2026',
    dateShort: 'apr 2026',
    tags: ['cestovanie', 'my dvaja'],
    photos: 47,
    pinned: 3,
    who: 'S',
    seed: 'vienna',
    desc: 'Predĺžený víkend, ktorý sme plánovali pol roka. Schönbrunn pred otvorením, kávičky v Café Central, večerná prechádzka okolo Stephansdomu. Vrátili sme sa s 47 fotkami a pár kg navyše.',
  },
  {
    id: 'statnice',
    title: 'Učenie na štátnice',
    place: 'doma · Bratislava',
    placeShort: 'doma',
    date: '5. – 30. marec 2026',
    dateShort: 'mar 2026',
    tags: ['my dvaja'],
    photos: 12,
    pinned: 1,
    who: 'M',
    seed: 'desk',
    desc: 'Tri týždne pri stoloch, káva v termoske, jeden druhému sme robili kartičky. Stálo to za to.',
  },
  {
    id: 'tatry-26',
    title: 'Tatry · zimná päťka',
    place: 'Štrbské Pleso · SK',
    placeShort: 'Tatry',
    date: '8. – 12. február 2026',
    dateShort: 'feb 2026',
    tags: ['cestovanie', 'zážitky'],
    photos: 89,
    pinned: 5,
    who: 'spolu',
    seed: 'ski',
    desc: 'Päť dní snehu, jedna večera v hoteli, dva pády na svahu. Najfoto deň: 17. február — 23 záberov.',
  },
  {
    id: 'vyrocie',
    title: '2. výročie ♡',
    place: 'reštaurácia STROM',
    placeShort: 'BA',
    date: '21. január 2026',
    dateShort: 'jan 2026',
    tags: ['my dvaja'],
    photos: 8,
    pinned: 2,
    who: 'spolu',
    seed: 'party',
    desc: 'Tichá večera, prvá fľaša Saint-Émilion. Spolu už 731 dní.',
  },
  {
    id: 'vianoce',
    title: 'Vianoce u rodičov',
    place: 'Trenčín',
    placeShort: 'Trenčín',
    date: '24. – 27. december 2025',
    dateShort: 'dec 2025',
    tags: ['rodina'],
    photos: 31,
    pinned: 1,
    who: 'M',
    seed: 'home',
    desc: 'Prvé spoločné Vianoce u tvojich. Stromček, kapustnica, snežilo až po obed.',
  },
  {
    id: 'praha-25',
    title: 'Koncert v Prahe',
    place: 'O2 arena · Praha',
    placeShort: 'Praha',
    date: '14. september 2025',
    dateShort: 'sep 2025',
    tags: ['zážitky'],
    photos: 32,
    pinned: 2,
    who: 'S',
    seed: 'prague',
    desc: 'Stál som na špičkách, ty si si držala uši. Tri hodiny v daždi po koncerte v hľadaní hotela.',
  },
];

// Momentky — micro-notes for ordinary days. No place / tags / photos, they don't
// feed the Map or Stats. Just a quick line to remember a small everyday moment.
const SK_MONTHS = ['jan', 'feb', 'mar', 'apr', 'máj', 'jún', 'júl', 'aug', 'sep', 'okt', 'nov', 'dec'];
const formatShortSk = (d) => `${d.getDate()}. ${SK_MONTHS[d.getMonth()]}`;

const NOTES = [
  { id: 'note-1', text: 'Zmokli sme cestou z obchodu — dážď z ničoho nič. Bežali sme a smiali sa celú cestu domov.', dateShort: '13. máj', who: 'spolu', seed: 'road' },
  { id: 'note-2', text: 'Ranná káva na balkóne, prvý naozaj teplý deň. Ticho a vrabce.', dateShort: '9. máj', who: 'S' },
  { id: 'note-3', text: 'M spravila palacinky o polnoci, lebo „prečo nie". Najlepšie rozhodnutie týždňa.', dateShort: '2. máj', who: 'M' },
];

const BUCKET_CATEGORIES = [
  { id: 'travel', icon: '✈', name: 'Cestovanie', done: 6, total: 14, color: '#2d5a3d' },
  { id: 'food', icon: '◉', name: 'Jedlo', done: 4, total: 9, color: '#2d5a3d' },
  { id: 'experiences', icon: '★', name: 'Zážitky', done: 3, total: 11, color: '#2d5a3d' },
  { id: 'us', icon: '♡', name: 'My dvaja', done: 1, total: 8, color: '#2d5a3d' },
];

const BUCKET_ITEMS = {
  travel: [
    { done: true, txt: 'Vidieť polárnu žiaru', sub: 'Tromsø · feb 2025' },
    { done: false, txt: 'Road trip po Islande', sub: 'leto 2027' },
    { done: false, txt: 'Lisabon na 3 dni' },
    { done: false, txt: 'Vlakom cez Alpy' },
    { done: true, txt: 'Víkend vo Viedni', sub: 'apr 2026' },
    { done: true, txt: 'Praha — koncert', sub: 'sep 2025' },
  ],
  food: [
    { done: false, txt: 'Spraviť domácu pizzu od základov' },
    { done: true, txt: 'Vyskúšať omakase' },
    { done: false, txt: 'Stužkový croissant zo St. Honoré' },
  ],
  experiences: [
    { done: true, txt: 'Skúsiť paragliding', sub: 'Donovaly · jún 2025' },
    { done: false, txt: 'Naučiť sa salsu' },
    { done: false, txt: 'Surfovať aspoň jeden deň' },
  ],
  us: [
    { done: false, txt: 'Víkend bez telefónov' },
    { done: false, txt: 'Spísať 100 vecí, čo na sebe máme radi' },
    { done: true, txt: 'Spoločná tatovačka', sub: 'apr 2025' },
  ],
};

const COUNTRIES = [
  { flag: '🇸🇰', name: 'Slovensko', photos: 412, x: 178, y: 60, cities: [
    { name: 'Bratislava', photos: 214, momentIds: ['vyrocie', 'statnice'] },
    { name: 'Vysoké Tatry', photos: 89, momentIds: ['tatry-26'] },
    { name: 'Trenčín', photos: 31, momentIds: ['vianoce'] },
    { name: 'Donovaly', photos: 42 },
    { name: 'Košice', photos: 36 },
  ] },
  { flag: '🇦🇹', name: 'Rakúsko', photos: 67, x: 175, y: 55, cities: [
    { name: 'Viedeň', photos: 54, momentIds: ['wien-26'] },
    { name: 'Salzburg', photos: 13 },
  ] },
  { flag: '🇨🇿', name: 'Česko', photos: 89, x: 172, y: 53, cities: [
    { name: 'Praha', photos: 71, momentIds: ['praha-25'] },
    { name: 'Brno', photos: 18 },
  ] },
  { flag: '🇭🇺', name: 'Maďarsko', photos: 34, x: 195, y: 55, cities: [
    { name: 'Budapešť', photos: 34 },
  ] },
  { flag: '🇳🇴', name: 'Nórsko', photos: 142, x: 220, y: 32, cities: [
    { name: 'Tromsø', photos: 142 },
  ] },
  { flag: '🇮🇹', name: 'Taliansko', photos: 28, x: 195, y: 70, cities: [
    { name: 'Rím', photos: 28 },
  ] },
  { flag: '🇩🇪', name: 'Nemecko', photos: 19, x: 165, y: 50, cities: [
    { name: 'Berlín', photos: 19 },
  ] },
];

const STATS = {
  daysTogether: DAYS_TOGETHER,
  photos: 1284,
  countries: COUNTRIES.length,
  cities: COUNTRIES.reduce((s, c) => s + c.cities.length, 0),
  bucketDone: 14,
  bucketTotal: 42,
  topMonth: { name: 'február', short: 'feb', photos: 187 },
  topCity: { name: 'Viedeň', visits: 5 },
  km: 4218,
};

Object.assign(window, {
  TOGETHER_SINCE, TODAY, DAYS_TOGETHER,
  MOMENTS, NOTES, formatShortSk, BUCKET_CATEGORIES, BUCKET_ITEMS, COUNTRIES, STATS,
});
