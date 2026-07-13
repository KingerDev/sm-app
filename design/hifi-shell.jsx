// Shared shell components for S+M hi-fi

// ---- Icons (consistent line icons) ----
const ico = (paths) => <svg viewBox="0 0 24 24" className="ico">{paths}</svg>;

const Icons = {
  home: ico(<path d="M3 11.5l9-7.5 9 7.5V20a1 1 0 0 1-1 1h-5v-6.5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1V21H4a1 1 0 0 1-1-1z" />),
  bucket: ico(<><path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .9H7.2a1 1 0 0 1-1-.9z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>),
  img: ico(<><rect x="3" y="5" width="18" height="14" rx="2.5" /><circle cx="9" cy="10.5" r="1.4" /><path d="M3 17l5.5-5 5 4.5L17 12l4 4" /></>),
  map: ico(<><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" /><path d="M9 4v14M15 6v14" /></>),
  chart: ico(<><path d="M4 20h17" /><rect x="5" y="13" width="3.5" height="6" rx="1" /><rect x="10.5" y="9" width="3.5" height="10" rx="1" /><rect x="16" y="5" width="3.5" height="14" rx="1" /></>),
  plus: ico(<path d="M12 5v14M5 12h14" />),
  back: ico(<path d="M15 5l-7 7 7 7" />),
  search: ico(<><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.4-4.4" /></>),
  filter: ico(<><path d="M5 6h14M8 12h8M11 18h2" /></>),
  pin: ico(<><path d="M12 21s7-7.5 7-12a7 7 0 1 0-14 0c0 4.5 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></>),
  heart: ico(<path d="M12 20.5s-7.2-4.5-9.5-9.2A5.4 5.4 0 0 1 12 5a5.4 5.4 0 0 1 9.5 6.3C19.2 16 12 20.5 12 20.5z" />),
  heartFill: <svg viewBox="0 0 24 24" className="ico" style={{ fill: 'currentColor', stroke: 'currentColor' }}><path d="M12 20.5s-7.2-4.5-9.5-9.2A5.4 5.4 0 0 1 12 5a5.4 5.4 0 0 1 9.5 6.3C19.2 16 12 20.5 12 20.5z" /></svg>,
  cal: ico(<><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>),
  more: ico(<><circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" /></>),
  play: <svg viewBox="0 0 24 24" className="ico" style={{ fill: 'currentColor', stroke: 'none' }}><path d="M7 4.5v15a1 1 0 0 0 1.5.87l13-7.5a1 1 0 0 0 0-1.74l-13-7.5A1 1 0 0 0 7 4.5z" /></svg>,
  sparkle: ico(<><path d="M12 4l1.5 4.5L18 10l-4.5 1.5L12 16l-1.5-4.5L6 10l4.5-1.5z" /><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" /></>),
  arrow: ico(<><path d="M5 12h14M13 6l6 6-6 6" /></>),
  arrowDown: ico(<path d="M6 9l6 6 6-6" />),
  close: ico(<path d="M6 6l12 12M18 6L6 18" />),
  check: ico(<path d="M5 13l4 4L19 7" />),
  edit: ico(<><path d="M4 20h4L18.5 9.5a2 2 0 0 0-2.8-2.8L5 17.5z" /><path d="M13.5 6.5l4 4" /></>),
  trash: ico(<><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" /></>),
  share: ico(<><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="M8.2 10.8l7.6-4.6M8.2 13.2l7.6 4.6" /></>),
  download: ico(<><path d="M12 4v11M7 11l5 5 5-5" /><path d="M5 20h14" /></>),
  send: ico(<><path d="M4 12l16-7-7 16-2.5-6.5z" /></>),
  loc: ico(<path d="M12 21s7-7.5 7-12a7 7 0 1 0-14 0c0 4.5 7 12 7 12z M12 9 m-2.5 0 a2.5 2.5 0 1 1 5 0 a2.5 2.5 0 1 1 -5 0" />),
  globe: ico(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>),
  battery: <svg viewBox="0 0 26 12" style={{ width: 24, height: 12 }}>
    <rect x="0.5" y="0.5" width="22" height="11" rx="3" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
    <rect x="23" y="4" width="2" height="4" rx="1" fill="currentColor" opacity="0.5" />
    <rect x="2" y="2" width="17" height="8" rx="1.5" fill="currentColor" />
  </svg>,
  wifi: <svg viewBox="0 0 18 12" style={{ width: 16, height: 12 }} fill="currentColor">
    <path d="M9 2C5.5 2 2.5 3.5 0 6l1.3 1.5C3.4 5.6 6 4.4 9 4.4s5.6 1.2 7.7 3.1L18 6c-2.5-2.5-5.5-4-9-4zm0 4C7 6 5 6.8 3.4 8.2L4.7 9.7c1.2-1 2.7-1.6 4.3-1.6s3.1.6 4.3 1.6l1.3-1.5C12.9 6.8 11 6 9 6zm0 4a1.5 1.5 0 0 0 0 3 1.5 1.5 0 0 0 0-3z" />
  </svg>,
  signal: <svg viewBox="0 0 18 12" style={{ width: 17, height: 12 }} fill="currentColor">
    <rect x="0" y="8" width="3" height="4" rx="0.5" />
    <rect x="5" y="5" width="3" height="7" rx="0.5" />
    <rect x="10" y="2" width="3" height="10" rx="0.5" />
    <rect x="15" y="0" width="3" height="12" rx="0.5" opacity="0.3" />
  </svg>,
};

// ---- Phone shell ----
const Phone = ({ children, caption }) => (
  <div className="col gap-12" style={{ alignItems: 'center' }}>
    <div className="device">
      <div className="device-inner">
        <div className="island" />
        <StatusBar />
        <div className="screen">{children}</div>
      </div>
    </div>
    {caption && <div className="phone-caption">{caption}</div>}
  </div>
);

const StatusBar = () => (
  <div className="statusbar">
    <span>9:41</span>
    <div className="right">
      {Icons.signal}
      {Icons.wifi}
      {Icons.battery}
    </div>
  </div>
);

// ---- Tab bar ----
const TabBar = ({ active, onChange }) => {
  const tabs = [
    { id: 'home', icon: Icons.home, label: 'Domov' },
    { id: 'bucket', icon: Icons.bucket, label: 'Bucket' },
    { id: 'gallery', icon: Icons.img, label: 'Galéria' },
    { id: 'map', icon: Icons.map, label: 'Mapa' },
    { id: 'stats', icon: Icons.chart, label: 'Štats' },
  ];
  return (
    <div className="tabbar">
      {tabs.map(t => (
        <button key={t.id} className={`tab ${active === t.id ? 'active' : ''}`}
          onClick={() => onChange(t.id)}>
          {t.icon}
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
};

// ---- App header (per screen) ----
const AppHeader = ({ eyebrow, title, titleGreen, right, children }) => (
  <div className="app-header">
    <div className="col" style={{ minWidth: 0 }}>
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h1 className={titleGreen ? 'green' : ''}>{title}</h1>
      {children}
    </div>
    {right && <div className="actions">{right}</div>}
  </div>
);

// ---- Photo placeholder ----
// Uses picsum with seed; fallback to gradient. The seed gives consistent imagery.
const PALETTES = {
  vienna:  ['#d6c8a4', '#7a6b4a'],
  tatry:   ['#cfd9d6', '#476859'],
  prague:  ['#e2d2bc', '#7a5b3e'],
  tromso:  ['#c4d5e0', '#3b5a72'],
  home:    ['#e8dcc2', '#9c815f'],
  picnic:  ['#c9d5b1', '#5b7240'],
  beach:   ['#e8d8be', '#a98c5f'],
  forest:  ['#bccfb6', '#3f5a3c'],
  cafe:    ['#e0c9aa', '#8a6843'],
  desk:    ['#dad2bf', '#6c5e44'],
  road:    ['#c8c2b1', '#534b3a'],
  party:   ['#d8c2c8', '#7a4b58'],
  ski:     ['#dbe4e8', '#4a6878'],
  city:    ['#cfc3a8', '#6a5840'],
  default: ['#c2d4c8', '#5a7062'],
};

const Photo = ({ seed = 'default', label, alt, className = '', style = {}, children, useReal = true, ...rest }) => {
  const pal = PALETTES[seed] || PALETTES.default;
  const inlineStyle = {
    '--ph-c1': pal[0],
    '--ph-c2': pal[1],
    ...style,
  };
  // pick image url
  const w = Math.round(style.width || 600);
  const h = Math.round(style.height || 400);
  const imgUrl = useReal ? `https://picsum.photos/seed/sm-${seed}/${w}/${h}` : null;
  return (
    <div className={`photo empty ${className}`} style={{ ...inlineStyle, backgroundImage: imgUrl ? `url(${imgUrl})` : undefined }} {...rest}>
      {children}
      {label && <div className="photo-label">{label}</div>}
    </div>
  );
};

Object.assign(window, { Icons, Phone, StatusBar, TabBar, AppHeader, Photo, PALETTES });
