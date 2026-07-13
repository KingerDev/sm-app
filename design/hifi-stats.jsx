// STATS screen (V3 entry) → WRAPPED (V4 story slides) — Monthly + Yearly

// ---- Themes for slide backgrounds (per season) ----
const SEASON_THEMES = {
  winter: 'linear-gradient(165deg, #1a3a2a 0%, #2d5a3d 100%)',
  spring: 'linear-gradient(165deg, #3a6f4d 0%, #6b8e4e 100%)',
  summer: 'linear-gradient(165deg, #2d5a3d 0%, #b85a1b 200%)',
  autumn: 'linear-gradient(165deg, #6f3a14 0%, #2d5a3d 100%)',
};

// ---- Monthly Wrapped data ----
const MONTHLY_WRAPPEDS = [
  {
    id: '2026-04', label: 'apríl 2026', month: 'apríl', short: 'apr',
    season: 'spring',
    days: '813–842',
    headline: 'mesiac vína a Schönbrunnu',
    photos: 92, topDay: '12. apr', topDayCount: 27,
    topMoment: { title: 'Víkend vo Viedni', place: 'Viedeň, AT', momId: 'wien-26' },
    bucket: 1, bucketTxt: 'Víkend vo Viedni',
    outro: 'Stálo to za tých 92 fotiek.',
  },
  {
    id: '2026-03', label: 'marec 2026', month: 'marec', short: 'mar',
    season: 'spring',
    days: '781–811',
    headline: 'mesiac kávy a kartičiek',
    photos: 41, topDay: '24. mar', topDayCount: 7,
    topMoment: { title: 'Učenie na štátnice', place: 'doma', momId: 'statnice' },
    bucket: 0,
    outro: 'Tri týždne, dva piloty Anki. Stálo to za to.',
  },
  {
    id: '2026-02', label: 'február 2026', month: 'február', short: 'feb',
    season: 'winter',
    days: '752–780',
    headline: 'najfoto mesiac roka',
    photos: 187, topDay: '17. feb', topDayCount: 23,
    topMoment: { title: 'Tatry · 5 dní', place: 'Štrbské Pleso', momId: 'tatry-26' },
    bucket: 0,
    outro: 'Priemer 6,7 fotiek na deň. Najviac za celý rok.',
    top: true,
  },
  {
    id: '2026-01', label: 'január 2026', month: 'január', short: 'jan',
    season: 'winter',
    days: '721–751',
    headline: 'dva roky spolu',
    photos: 38, topDay: '21. jan', topDayCount: 14,
    topMoment: { title: '2. výročie', place: 'reštaurácia STROM', momId: 'vyrocie' },
    bucket: 0,
    outro: '731. deň. Saint-Émilion, prvá fľaša.',
  },
  {
    id: '2025-12', label: 'december 2025', month: 'december', short: 'dec',
    season: 'winter',
    days: '690–720',
    headline: 'prvé spoločné Vianoce u tvojich',
    photos: 75, topDay: '24. dec', topDayCount: 18,
    topMoment: { title: 'Vianoce u rodičov', place: 'Trenčín', momId: 'vianoce' },
    bucket: 0,
    outro: 'Snežilo až po obed.',
  },
  {
    id: '2025-11', label: 'november 2025', month: 'november', short: 'nov',
    season: 'autumn',
    days: '660–689',
    headline: 'tichý mesiac',
    photos: 22, topDay: '15. nov', topDayCount: 5,
    topMoment: { title: 'Doma, pomaly', place: 'doma', momId: null },
    bucket: 1, bucketTxt: 'Spraviť domácu pizzu',
    outro: 'Nie každý mesiac musí mať veľký vrchol.',
  },
];

const monthlySlidesFor = (m) => {
  const bg = SEASON_THEMES[m.season];
  return [
    {
      bg, eyebrow: 'S+M Wrapped · ' + m.label,
      big: m.month, bigLabel: m.days + '. dni spolu',
      body: m.headline.charAt(0).toUpperCase() + m.headline.slice(1) + '.',
      sign: m.top ? '★' : '·',
    },
    {
      bg, eyebrow: 'top moment',
      big: m.topMoment.title, bigLabel: '📍 ' + m.topMoment.place,
      body: 'Najdôležitejšia chvíľa mesiaca.',
    },
    {
      bg, eyebrow: 'v číslach',
      big: m.photos, bigLabel: m.photos === 1 ? 'fotka' : 'fotiek za mesiac',
      body: 'Najviac · ' + m.topDay + ' (' + m.topDayCount + ' fotiek).' +
            (m.bucket > 0 ? '\nA ' + m.bucket + '× bucket: ' + m.bucketTxt + '.' : ''),
    },
    {
      bg, eyebrow: 'a posledná vec',
      big: 'ďakujem', bigLabel: m.month,
      body: m.outro,
      sign: '♡', last: true,
    },
  ];
};

const Stats = ({ navigate }) => {
  const [menu, setMenu] = React.useState(false);
  return (
  <>
    <AppHeader
      eyebrow="náš vzťah v číslach"
      title="štatistiky"
      right={<button className={'icon-btn' + (menu ? ' green' : '')} onClick={() => setMenu(true)}>{Icons.more}</button>}
    />
    <div className="scroll">
      {/* Monthly Wrapped — horizontal carousel */}
      <div className="row between" style={{ marginBottom: 10 }}>
        <div className="handwritten" style={{ fontSize: 22 }}>Mesačné Wrapped</div>
        <span className="eyebrow">každý mesiac</span>
      </div>
      <div style={{ margin: '0 -20px 22px', overflowX: 'auto', paddingLeft: 20 }}>
        <div className="row gap-10" style={{ width: 'max-content', paddingRight: 20 }}>
          {MONTHLY_WRAPPEDS.map(m => (
            <button key={m.id}
              onClick={() => navigate('wrapped-month:' + m.id)}
              style={{
                width: 140, flexShrink: 0,
                padding: 0, border: '0.5px solid var(--line)',
                borderRadius: 'var(--r-md)', overflow: 'hidden',
                cursor: 'pointer', font: 'inherit', color: 'inherit',
                background: SEASON_THEMES[m.season],
                color: 'var(--paper)',
                position: 'relative',
                textAlign: 'left',
              }}>
              <div style={{ padding: 14, minHeight: 160, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {m.short} {m.label.split(' ')[1].slice(2)}
                </div>
                <div className="serif" style={{ fontSize: 28, lineHeight: 1, fontWeight: 600 }}>
                  {m.month}
                </div>
                <div className="num" style={{ fontSize: 32, lineHeight: 0.9, marginTop: 'auto' }}>
                  {m.photos}
                </div>
                <div style={{ fontSize: 10.5, opacity: 0.85 }}>
                  {m.photos === 1 ? 'fotka' : 'fotiek'} · ťukni
                </div>
                {m.top && (
                  <div style={{
                    position: 'absolute', top: 10, right: 10,
                    fontSize: 9, fontWeight: 600, letterSpacing: 0.5,
                    background: 'var(--paper)', color: 'var(--green-deep)',
                    padding: '3px 8px', borderRadius: 999,
                    textTransform: 'uppercase',
                  }}>top mesiac</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Yearly Wrapped CTA */}
      <div className="row between" style={{ marginBottom: 10 }}>
        <div className="handwritten" style={{ fontSize: 22 }}>Ročný Wrapped</div>
        <span className="eyebrow">každý január</span>
      </div>
      <button className="card hero" style={{
        padding: 20, width: '100%', textAlign: 'left',
        cursor: 'pointer', display: 'block', font: 'inherit', color: 'var(--paper)',
        background: 'linear-gradient(135deg, var(--green) 0%, var(--green-deep) 100%)',
      }}
        onClick={() => navigate('wrapped')}>
        <div className="row between">
          <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>2026 · pre nás dvoch</div>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            display: 'grid', placeItems: 'center',
          }}>{Icons.play}</div>
        </div>
        <div className="serif" style={{ fontSize: 48, fontWeight: 600, marginTop: 12, lineHeight: 0.95 }}>
          Wrapped
        </div>
        <div style={{ fontSize: 13, opacity: 0.85, marginTop: 6 }}>
          6 slidov o celom roku — vychádza každý január
        </div>
        <div className="row gap-6" style={{ marginTop: 14 }}>
          {[1, 1, 1, 1, 1, 1].map((_, i) => (
            <div key={i} className="grow" style={{
              height: 3, borderRadius: 2,
              background: 'rgba(255,255,255,0.35)',
            }} />
          ))}
        </div>
      </button>

      {/* Stat grid */}
      <div style={{ marginTop: 22 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>ťukni pre detail</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <StatCard
            big
            num={STATS.daysTogether.toLocaleString('sk-SK')}
            label="dní spolu"
            sub="2 roky 3 mes 23 dní"
            tint
          />
          <StatCard
            num={STATS.topMonth.short}
            label="mesiac s najviac fotkami"
            sub={`${STATS.topMonth.photos} fotiek`}
          />
          <StatCard num={STATS.photos.toLocaleString('sk-SK')} label="fotiek" />
          <StatCard num={STATS.countries} label="krajín" sub={`${STATS.cities} miest`} />
          <StatCard num={STATS.topCity.name} label="top mesto" sub={`${STATS.topCity.visits}× navštívené`} />
          <StatCard num={`${STATS.bucketDone}/${STATS.bucketTotal}`} label="bucket list" sub={`${Math.round(STATS.bucketDone / STATS.bucketTotal * 100)}% hotových`} />
        </div>
      </div>

      <div className="handwritten" style={{ marginTop: 22, textAlign: 'center', fontSize: 16 }}>
        ✦ mesačné posielame 1. dňa · ročné v januári
      </div>
    </div>

    {menu && <StatsMenu onClose={() => setMenu(false)} navigate={navigate} />}
  </>
  );
};

/* ---- Stats action sheet (three dots) ---- */
const StatsMenu = ({ onClose, navigate }) => {
  const rowStyle = {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '14px 4px', width: '100%', textAlign: 'left',
    background: 'none', border: 'none', font: 'inherit', cursor: 'pointer',
    color: 'var(--ink)', fontSize: 15,
  };
  const ic = (icon) => (
    <span style={{ color: 'var(--muted)', display: 'grid', placeItems: 'center', width: 22 }}>
      {React.cloneElement(icon, { style: { width: 20, height: 20 } })}
    </span>
  );
  const go = (target) => { onClose(); if (target) navigate(target); };
  const actions = [
    { icon: Icons.play, label: 'Prehrať ročný Wrapped', onClick: () => go('wrapped') },
    { icon: Icons.share, label: 'Zdieľať štatistiky', onClick: () => go() },
    { icon: Icons.download, label: 'Stiahnuť ako obrázok', onClick: () => go() },
    { icon: Icons.sparkle, label: 'Notifikácie o Wrapped', onClick: () => go() },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30 }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(20,30,22,0.4)',
        animation: 'fadeIn 200ms ease both',
      }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: 'var(--paper)', borderRadius: '22px 22px 0 0',
        padding: '10px 20px calc(18px + env(safe-area-inset-bottom))',
        animation: 'slideUp 300ms ease both',
      }}>
        <div style={{
          width: 38, height: 4, borderRadius: 999, background: 'var(--line)',
          margin: '4px auto 8px',
        }} />
        <div className="eyebrow" style={{ padding: '6px 4px 2px' }}>štatistiky S+M</div>
        {actions.map(a => (
          <button key={a.label} style={rowStyle} onClick={a.onClick}>
            {ic(a.icon)}{a.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const StatCard = ({ num, label, sub, big, tint }) => (
  <button className={`card ${tint ? 'tint' : ''}`}
    style={{
      padding: 16, textAlign: 'left',
      cursor: 'pointer',
      gridColumn: big ? 'span 2' : 'auto',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      minHeight: big ? 'auto' : 110,
      position: 'relative',
      font: 'inherit', color: 'inherit',
      border: '0.5px solid ' + (tint ? 'var(--green-line)' : 'var(--line)'),
    }}>
    <div className="num" style={{
      fontSize: big ? 72 : (String(num).length > 4 ? 28 : 36),
      color: 'var(--green)',
      lineHeight: 0.95,
    }}>{num}</div>
    <div style={{ marginTop: big ? 6 : 8 }}>
      <div className="eyebrow" style={{ fontSize: 10 }}>{label}</div>
      {sub && <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 3 }}>{sub}</div>}
    </div>
    <span style={{
      position: 'absolute', top: 12, right: 12,
      color: 'var(--muted-2)',
    }}>{Icons.arrow}</span>
  </button>
);

// ---- WRAPPED STORY ----
const YEARLY_SLIDES = [
  {
    bg: 'linear-gradient(165deg, #2d5a3d 0%, #1a3a2a 100%)',
    eyebrow: 'S+M Wrapped 2026',
    big: '847',
    bigLabel: 'dní spolu',
    body: 'A každý jeden bol pre vás malou kapitolou.',
    sign: '♡',
  },
  {
    bg: 'linear-gradient(165deg, #b85a1b 0%, #6f3a14 100%)',
    eyebrow: 'najfoto mesiac',
    big: 'február',
    bigLabel: '187 fotiek za 28 dní',
    body: 'To je asi 6,7 záberov denne. Najviac · 17. feb v Tatrách — 23 fotiek.',
    sign: '◉',
  },
  {
    bg: 'linear-gradient(165deg, #2d5a3d 0%, #5a7a4a 100%)',
    eyebrow: 'krajiny ✦',
    big: '7',
    bigLabel: 'krajín · 21 miest · 4 218 km',
    body: 'Najďalej ste boli v Tromsø — pre tú polárnu žiaru to stálo.',
    sign: '✈',
  },
  {
    bg: 'linear-gradient(165deg, #1a3a2a 0%, #2d5a3d 100%)',
    eyebrow: 'top mesto',
    big: 'Viedeň',
    bigLabel: 'navštívili ste ju 5×',
    body: 'Cafe Central vás videl 5×. A vždy ste si dali tú istú Sachertortu.',
    sign: '★',
  },
  {
    bg: 'linear-gradient(165deg, #2d5a3d 0%, #1a3a2a 100%)',
    eyebrow: 'bucket list',
    big: '14',
    bigLabel: 'splnených z 42',
    body: 'Tretina za vami. Vrátane polárnej žiare, paraglidingu a víkendu vo Viedni.',
    sign: '✓',
  },
  {
    bg: 'linear-gradient(165deg, #b85a1b 0%, #2d5a3d 100%)',
    eyebrow: 'a posledná vec',
    big: 'spolu',
    bigLabel: 'a o rok zas',
    body: 'Bola to dobrá éra. Ďalší rok ide.',
    sign: '♡',
    last: true,
  },
];

const bigFontSize = (s) => {
  const len = String(s).length;
  if (len > 9) return 50;
  if (len > 7) return 64;
  if (len > 5) return 80;
  return 110;
};

const Wrapped = ({ slides = YEARLY_SLIDES, onExit, kind = 'yearly' }) => {
  const [idx, setIdx] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const slide = slides[idx];

  React.useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => {
      if (idx < slides.length - 1) setIdx(idx + 1);
    }, 6000);
    return () => clearTimeout(t);
  }, [idx, paused, slides.length]);

  const next = () => idx < slides.length - 1 ? setIdx(idx + 1) : onExit();
  const prev = () => idx > 0 && setIdx(idx - 1);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: slide.bg,
      color: 'var(--paper)',
      display: 'flex', flexDirection: 'column',
      padding: '60px 24px 90px',
      zIndex: 25,
      transition: 'background 800ms ease',
    }}
      onMouseDown={() => setPaused(true)}
      onMouseUp={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* progress dots */}
      <div className="row gap-6" style={{ marginBottom: 24 }}>
        {slides.map((_, i) => (
          <div key={i} className="grow" style={{
            height: 2.5, borderRadius: 2,
            background: 'rgba(255,255,255,0.3)',
            overflow: 'hidden',
          }}>
            <div style={{
              width: i < idx ? '100%' : i === idx ? (paused ? '50%' : '100%') : '0%',
              height: '100%', background: 'var(--paper)',
              transition: i === idx ? (paused ? 'none' : 'width 6000ms linear') : 'width 200ms',
            }} />
          </div>
        ))}
      </div>
      <div className="row between" style={{ marginBottom: 'auto' }}>
        <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {slide.eyebrow}
        </div>
        <button className="icon-btn" style={{
          background: 'rgba(255,255,255,0.15)', border: 'none', color: 'var(--paper)',
          width: 32, height: 32,
        }} onClick={onExit}>{Icons.close}</button>
      </div>

      {/* Content */}
      <div className="col gap-16" style={{ flex: 1, justifyContent: 'center' }}>
        {slide.last && (
          <div style={{ alignSelf: 'flex-start', marginBottom: 8 }}>
            <Mascot size={80} animated />
          </div>
        )}
        <div className="num" style={{
          fontSize: bigFontSize(slide.big),
          lineHeight: 0.9,
          color: 'var(--paper)',
        }}>{slide.big}</div>
        <div style={{ fontSize: 16, opacity: 0.95, marginTop: -4 }}>
          {slide.bigLabel}
        </div>
        <div style={{
          fontSize: 14, opacity: 0.85, lineHeight: 1.5,
          maxWidth: 280,
          whiteSpace: 'pre-line',
        }}>{slide.body}</div>
      </div>

      {/* Bottom */}
      <div className="row between" style={{ marginTop: 24 }}>
        <div className="handwritten" style={{ color: 'var(--paper)', opacity: 0.85, fontSize: 18 }}>
          S + M
        </div>
        <div className="row gap-8">
          {slide.last && (
            <button className="btn invert" style={{ padding: '8px 14px', fontSize: 12 }}
              onClick={onExit}>
              {Icons.heart} hotovo
            </button>
          )}
        </div>
      </div>

      {/* Tap zones (left back, right forward) */}
      <div style={{ position: 'absolute', top: 60, bottom: 60, left: 0, width: '35%', cursor: 'pointer' }}
        onClick={prev} />
      <div style={{ position: 'absolute', top: 60, bottom: 60, right: 0, width: '35%', cursor: 'pointer' }}
        onClick={next} />
    </div>
  );
};

Object.assign(window, { Stats, StatsMenu, Wrapped, MONTHLY_WRAPPEDS, monthlySlidesFor, YEARLY_SLIDES });
