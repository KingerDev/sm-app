// HOME screen (V2-based) — "spolu už" + big day count + shortcuts + recent moment

const Home = ({ navigate, mascotVariant = 'pebbles', notes = [], onAddNote }) => {
  const m = MOMENTS[0]; // most recent
  const nextCapsule = CAPSULES
    .map(c => ({ ...c, daysLeft: daysUntil(c.unlock) }))
    .filter(c => c.unlock > TODAY)
    .sort((a, b) => a.unlock - b.unlock)[0];

  // "Na dnes" — nearest upcoming milestone (anniversary / day-milestone / capsule)
  const nextEvent = (() => {
    const evs = [];
    const y0 = TOGETHER_SINCE.getFullYear();
    for (let y = TODAY.getFullYear(); y <= TODAY.getFullYear() + 2; y++) {
      evs.push({ date: new Date(y, 0, 21), title: `${y - y0}. výročie`, icon: '♥', kind: 'anniv' });
    }
    [750, 1000, 1500, 2000].forEach(n => evs.push({
      date: new Date(TOGETHER_SINCE.getTime() + n * 86400000),
      title: `${n.toLocaleString('sk-SK')} dní spolu`, icon: '✦', kind: 'milestone',
    }));
    CAPSULES.forEach(c => evs.push({ date: c.unlock, title: c.title, icon: '🔒', kind: 'capsule' }));
    return evs.filter(e => e.date >= TODAY).sort((a, b) => a.date - b.date)[0];
  })();
  const eventDaysLeft = nextEvent ? daysUntil(nextEvent.date) : 0;

  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px 8px',
        gap: 10,
      }}>
        <div className="row gap-10" style={{ alignItems: 'center', minWidth: 0 }}>
          <Mascot variant={mascotVariant} size={44} />
          <div className="col" style={{ gap: 1, minWidth: 0 }}>
            <div className="eyebrow" style={{ whiteSpace: 'nowrap' }}>náš priestor</div>
            <div className="serif" style={{ fontSize: 30, color: 'var(--green)', fontWeight: 600, lineHeight: 1 }}>
              S+M
            </div>
          </div>
        </div>
        <div className="row gap-8" style={{ flexShrink: 0 }}>
          <button className="icon-btn" onClick={() => navigate('moment-add')}>{Icons.plus}</button>
          <button className="icon-btn" onClick={() => navigate('calendar')}>{Icons.cal}</button>
        </div>
      </div>
      <div className="scroll">
        {/* Hero — big day counter */}
        <div className="col gap-4" style={{ alignItems: 'center', padding: '8px 0 16px' }}>
          <div className="eyebrow">spolu už</div>
          <div className="num" style={{ fontSize: 132, color: 'var(--green)', lineHeight: 0.9 }}>
            {STATS.daysTogether.toLocaleString('sk-SK')}
          </div>
          <div className="row gap-6" style={{ marginTop: 2 }}>
            <span style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 500 }}>
              dní · 2 roky 3 mes 23 dní
            </span>
          </div>
          <div className="handwritten" style={{ fontSize: 18, marginTop: 8 }}>
            ♡ od 1. 12. 2024
          </div>
        </div>

        <div className="divider" style={{ margin: '4px 0 20px' }} />

        {/* Momentka — quick capture of an ordinary-day moment */}
        <QuickNote onAdd={onAddNote} recent={notes.slice(0, 2)} navigate={navigate} />

        {/* Na dnes — nearest upcoming milestone */}
        {nextEvent && (
          <button className="card tint" style={{
            width: '100%', marginBottom: 18, padding: 14, textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
            border: 'none', font: 'inherit', color: 'inherit',
          }} onClick={() => navigate('calendar')}>
            <div style={{
              width: 54, height: 54, borderRadius: 14, flexShrink: 0,
              background: 'var(--green)', color: 'var(--paper)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
            }}>
              <span className="num" style={{ fontSize: 22, color: 'var(--paper)' }}>{eventDaysLeft}</span>
              <span style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.6, opacity: 0.85 }}>dní</span>
            </div>
            <div className="col grow" style={{ gap: 2, minWidth: 0 }}>
              <div className="eyebrow" style={{ color: 'var(--green)' }}>na dnes · {formatDateSk(TODAY)}</div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{nextEvent.icon} {nextEvent.title}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>
                {eventDaysLeft === 0 ? 'dnes je ten deň!' : eventDaysLeft === 1 ? 'už zajtra' : `o ${eventDaysLeft} dní`} · {formatDateSk(nextEvent.date)}
              </div>
            </div>
            <span style={{ color: 'var(--green)', flexShrink: 0 }}>{Icons.arrow}</span>
          </button>
        )}

        {/* Shortcuts grid (2x2) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button className="card" style={shortcutCard} onClick={() => navigate('bucket')}>
            <div className="row between">
              <div style={iconBg}>{Icons.bucket}</div>
              <span className="eyebrow" style={{ fontSize: 9.5 }}>{STATS.bucketDone}/{STATS.bucketTotal}</span>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>Bucket list</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>14 splnených</div>
            </div>
            <ProgressBar value={STATS.bucketDone / STATS.bucketTotal} />
          </button>

          <button className="card" style={shortcutCard} onClick={() => navigate('map')}>
            <div className="row between">
              <div style={iconBg}>{Icons.pin}</div>
              <span className="eyebrow" style={{ fontSize: 9.5 }}>{STATS.countries} krajín</span>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>Mapa sveta</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{STATS.cities} miest navštívených</div>
            </div>
            {/* mini world dots */}
            <MiniMapStrip />
          </button>

          <button className="card" style={shortcutCard} onClick={() => navigate('gallery')}>
            <div className="row between">
              <div style={iconBg}>{Icons.img}</div>
              <span className="eyebrow" style={{ fontSize: 9.5 }}>{STATS.photos.toLocaleString('sk-SK')}</span>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>Galéria</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>6 momentov</div>
            </div>
            <div className="row gap-4">
              {MOMENTS.slice(0, 4).map(mm => (
                <Photo key={mm.id} seed={mm.seed}
                  style={{ width: 30, height: 30, borderRadius: 6 }} />
              ))}
            </div>
          </button>

          <button className="card hero" style={{ ...shortcutCard, padding: 14 }}
            onClick={() => navigate('wrapped')}>
            <div className="row between">
              <div style={{ ...iconBg, background: 'rgba(255,255,255,0.15)', color: 'var(--paper)' }}>
                {Icons.sparkle}
              </div>
              <span style={{ fontSize: 9.5, opacity: 0.85, letterSpacing: 1.4, textTransform: 'uppercase' }}>2026</span>
            </div>
            <div>
              <div className="serif" style={{ fontSize: 26, fontWeight: 600, lineHeight: 1 }}>Wrapped</div>
              <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 2 }}>náš rok v 6 slidoch</div>
            </div>
            <div className="row gap-6" style={{ marginTop: 2 }}>
              <span style={{ fontSize: 11, opacity: 0.85 }}>spustiť →</span>
            </div>
          </button>
        </div>

        {/* On this day */}
        <div className="row between" style={{ margin: '24px 0 10px' }}>
          <div className="handwritten" style={{ fontSize: 22 }}>Najnovší moment</div>
          <button className="btn ghost" style={{ padding: '4px 8px', fontSize: 12, color: 'var(--muted)' }}
            onClick={() => navigate('gallery')}>
            všetky →
          </button>
        </div>

        <button className="card flush" style={{ width: '100%', padding: 0, border: '0.5px solid var(--line)', cursor: 'pointer', background: 'var(--surface)' }}
          onClick={() => navigate('moment:' + m.id)}>
          <Photo seed={m.seed} style={{ height: 200, borderRadius: 0 }} />
          <div className="col gap-6" style={{ padding: 14, textAlign: 'left' }}>
            <div className="row between">
              <div className="eyebrow">{m.dateShort} · {m.placeShort}</div>
            </div>
            <div style={{ fontSize: 17, fontWeight: 500 }}>{m.title}</div>
            <div className="row gap-6 wrap">
              {m.tags.map(t => <span key={t} className="chip soft">{t}</span>)}
            </div>
          </div>
        </button>

        {/* Time Capsule featured card */}
        {nextCapsule && (
          <button className="card flush" style={{
            width: '100%', marginTop: 16, padding: 0, textAlign: 'left',
            cursor: 'pointer', border: '0.5px solid var(--line)',
            background: 'var(--surface)', font: 'inherit', color: 'inherit',
            overflow: 'hidden', position: 'relative',
          }}
            onClick={() => navigate('capsule')}>
            <div style={{
              padding: 16, display: 'flex', gap: 14, alignItems: 'center',
              background: 'linear-gradient(115deg, #1f3f2b 0%, #2d5a3d 70%, #3a6a4a 100%)',
              color: 'var(--paper)',
            }}>
              {/* Wax seal */}
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, #d97240 0%, #b85a1b 60%, #8a3f0e 100%)',
                display: 'grid', placeItems: 'center',
                color: 'var(--paper)',
                fontFamily: 'Caveat', fontSize: 24, fontWeight: 700,
                boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.2)',
                position: 'relative',
                flexShrink: 0,
              }}>
                <span style={{ filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.3))' }}>S+M</span>
              </div>
              <div className="col grow" style={{ gap: 4, minWidth: 0 }}>
                <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.75)' }}>časová kapsula</div>
                <div style={{ fontSize: 15, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {nextCapsule.title}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
                  odomkne sa za <span className="serif" style={{ fontSize: 18, color: 'var(--paper)', fontWeight: 600 }}>
                    {nextCapsule.daysLeft}
                  </span> dní
                </div>
              </div>
            </div>
          </button>
        )}
      </div>
    </>
  );
};

const NOTE_SEEDS = ['road', 'cafe', 'home', 'picnic', 'city', 'forest'];
const QuickNote = ({ onAdd, recent = [], navigate }) => {
  const [text, setText] = React.useState('');
  const [seed, setSeed] = React.useState(null);
  const submit = () => { const v = text.trim(); if (!v || !onAdd) return; onAdd(v, seed); setText(''); setSeed(null); };
  const attach = () => setSeed(NOTE_SEEDS[Math.floor(Math.random() * NOTE_SEEDS.length)]);
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="row between" style={{ marginBottom: 10, alignItems: 'baseline' }}>
        <div className="handwritten" style={{ fontSize: 22 }}>Dnešná chvíľka</div>
        <button className="btn ghost" onClick={() => navigate('momentka-add')}
          style={{ padding: '2px 4px', fontSize: 12, color: 'var(--muted)' }}>podrobnejšie →</button>
      </div>
      {seed && (
        <div style={{ position: 'relative', marginBottom: 8, width: 'fit-content' }}>
          <Photo seed={seed} style={{ width: 74, height: 74, borderRadius: 12 }} />
          <button onClick={() => setSeed(null)} style={{
            position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%',
            background: 'var(--ink)', color: 'var(--paper)', border: '2px solid var(--paper)',
            display: 'grid', placeItems: 'center', cursor: 'pointer', padding: 0,
          }}>{React.cloneElement(Icons.close, { style: { width: 12, height: 12 } })}</button>
        </div>
      )}
      <div className="row gap-8" style={{ alignItems: 'stretch' }}>
        <button className="icon-btn" onClick={attach} title="pridať fotku"
          style={{ flexShrink: 0, color: seed ? 'var(--green)' : 'var(--muted)' }}>
          {React.cloneElement(Icons.img, { style: { width: 19, height: 19 } })}
        </button>
        <input value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
          placeholder="čo sa dnes stalo? napr. zmokli sme…"
          style={{
            flex: 1, font: 'inherit', fontSize: 14, color: 'var(--ink)',
            background: 'var(--surface)', border: '0.5px solid var(--line)',
            borderRadius: 12, padding: '12px 14px', outline: 'none', minWidth: 0,
          }} />
        <button className="btn primary" onClick={submit} disabled={!text.trim()}
          style={{ flexShrink: 0, padding: '0 16px', opacity: text.trim() ? 1 : 0.4, cursor: text.trim() ? 'pointer' : 'default' }}>
          {React.cloneElement(Icons.send, { style: { width: 18, height: 18 } })}
        </button>
      </div>
      {recent.length > 0 && (
        <div className="col gap-6" style={{ marginTop: 12 }}>
          {recent.map(n => (
            <button key={n.id} onClick={() => navigate('momentka:' + n.id)} className="row gap-10" style={{
              alignItems: 'flex-start', padding: '10px 13px', textAlign: 'left', width: '100%',
              background: 'var(--green-soft)', borderRadius: 12, border: 'none', font: 'inherit', color: 'inherit', cursor: 'pointer',
            }}>
              {n.seed
                ? <Photo seed={n.seed} style={{ width: 40, height: 40, borderRadius: 9, flexShrink: 0 }} />
                : <span style={{ color: 'var(--green)', fontSize: 14, lineHeight: '19px', flexShrink: 0 }}>✎</span>}
              <div className="col" style={{ gap: 3, minWidth: 0 }}>
                <div style={{ fontSize: 13, lineHeight: 1.45 }}>{n.text}</div>
                <div className="eyebrow" style={{ color: 'var(--green)' }}>{n.dateShort} · {n.who}</div>
              </div>
            </button>
          ))}
          <button className="btn ghost" onClick={() => navigate('gallery')}
            style={{ alignSelf: 'flex-start', padding: '2px 4px', fontSize: 12, color: 'var(--muted)' }}>
            všetky chvíľky v galérii →
          </button>
        </div>
      )}
    </div>
  );
};

const shortcutCard = {
  padding: 14,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  textAlign: 'left',
  cursor: 'pointer',
  border: '0.5px solid var(--line)',
  background: 'var(--surface)',
  borderRadius: 'var(--r-md)',
  minHeight: 130,
  justifyContent: 'space-between',
  font: 'inherit',
  color: 'inherit',
};

const iconBg = {
  width: 32, height: 32, borderRadius: 10,
  background: 'var(--green-soft)', color: 'var(--green)',
  display: 'grid', placeItems: 'center',
};

const ProgressBar = ({ value }) => (
  <div style={{ height: 4, borderRadius: 2, background: 'var(--line)', overflow: 'hidden' }}>
    <div style={{ width: `${value * 100}%`, height: '100%', background: 'var(--green)' }} />
  </div>
);

const MiniMapStrip = () => (
  <svg viewBox="0 0 100 14" style={{ width: '100%', height: 14 }}>
    <g fill="var(--green)">
      <circle cx="15" cy="7" r="2" />
      <circle cx="30" cy="5" r="2" />
      <circle cx="42" cy="8" r="2" />
      <circle cx="55" cy="6" r="2" />
      <circle cx="70" cy="9" r="2" />
      <circle cx="85" cy="7" r="2" />
      <circle cx="92" cy="5" r="2" />
    </g>
    <line x1="6" y1="7" x2="96" y2="7" stroke="var(--green-line)" strokeWidth="0.6" strokeDasharray="1.5 2" />
  </svg>
);

Object.assign(window, { Home });
