// GALLERY screen (V4-based) — Timeline / Albums / Places views

const Gallery = ({ navigate, notes = [] }) => {
  const [view, setView] = React.useState('timeline');

  // Build a timeline grouped by year, with milestones interleaved.
  // Momentky (micro-notes) sit at the top — they're the most recent, everyday entries.
  const items = [
    ...notes.map(n => ({ type: 'note', note: n })),
    { type: 'milestone', date: 'máj 2026', title: 'Štátnice spolu', sub: 'urobili sme to' },
    { type: 'moment', mom: MOMENTS.find(m => m.id === 'wien-26') },
    { type: 'moment', mom: MOMENTS.find(m => m.id === 'statnice') },
    { type: 'moment', mom: MOMENTS.find(m => m.id === 'tatry-26') },
    { type: 'milestone', date: 'jan 2026', title: '2. výročie ♡', sub: '731 dní spolu' },
    { type: 'moment', mom: MOMENTS.find(m => m.id === 'vyrocie') },
    { type: 'moment', mom: MOMENTS.find(m => m.id === 'vianoce') },
    { type: 'moment', mom: MOMENTS.find(m => m.id === 'praha-25') },
  ];

  // Group by tag → albums
  const albumMap = {};
  MOMENTS.forEach(m => m.tags.forEach(t => {
    (albumMap[t] = albumMap[t] || []).push(m);
  }));
  const albums = Object.entries(albumMap)
    .map(([tag, moms]) => ({
      tag, moms,
      photos: moms.reduce((s, m) => s + m.photos, 0),
      cover: moms[0].seed,
    }))
    .sort((a, b) => b.moms.length - a.moms.length);

  // Group by place
  const placeMap = {};
  MOMENTS.forEach(m => {
    const k = m.placeShort;
    (placeMap[k] = placeMap[k] || { place: m.place, moms: [] }).moms.push(m);
  });
  const places = Object.entries(placeMap)
    .map(([k, v]) => ({ key: k, place: v.place, moms: v.moms }))
    .sort((a, b) => b.moms.length - a.moms.length);

  const tabs = [
    { id: 'timeline', label: 'Časová os' },
    { id: 'places', label: 'Po mieste' },
  ];

  const momentWord = (n) => n === 1 ? 'moment' : n < 5 ? 'momenty' : 'momentov';

  return (
    <>
      <AppHeader
        eyebrow="2024 → dnes"
        title="naše momenty"
        right={
          <>
            <button className="icon-btn" onClick={() => navigate('moment-search')}>{Icons.search}</button>
            <button className="icon-btn green" onClick={() => navigate('moment-add')}>{Icons.plus}</button>
          </>
        }
      >
        <div className="row gap-6" style={{ marginTop: 10 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setView(t.id)}
              className={'chip' + (view === t.id ? ' green' : '')}
              style={{ cursor: 'pointer', border: 'none', font: 'inherit' }}>{t.label}</button>
          ))}
        </div>
      </AppHeader>

      <div className="scroll" key={view}>
        {/* ---- Timeline ---- */}
        {view === 'timeline' && (
          <div style={{ position: 'relative', paddingLeft: 28 }}>
            <div style={{
              position: 'absolute', left: 7, top: 12, bottom: 12, width: 1.5,
              background: 'linear-gradient(var(--green-line), var(--line) 90%)',
            }} />
            <div className="col gap-20">
              {items.map((it, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: it.type === 'note' ? -27 : -28, top: it.type === 'note' ? 11 : 10,
                    width: it.type === 'note' ? 15 : 17, height: it.type === 'note' ? 15 : 17, borderRadius: '50%',
                    background: it.type === 'milestone' ? 'var(--green)' : it.type === 'note' ? 'var(--green-soft)' : 'var(--surface)',
                    border: '1.5px solid var(--green)',
                    boxShadow: '0 0 0 4px var(--paper)',
                    display: 'grid', placeItems: 'center', color: it.type === 'note' ? 'var(--green)' : 'var(--paper)', fontSize: it.type === 'note' ? 8 : 9,
                  }}>
                    {it.type === 'milestone' && '♥'}
                    {it.type === 'note' && '✎'}
                  </div>

                  {it.type === 'note' ? (
                    <button onClick={() => navigate('momentka:' + it.note.id)} style={{
                      display: 'flex', gap: 12, alignItems: 'center', width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit',
                      cursor: 'pointer', border: 'none',
                      background: 'var(--green-soft)', borderRadius: 14, padding: 11,
                    }}>
                      {it.note.seed && <Photo seed={it.note.seed} style={{ width: 76, height: 76, borderRadius: 10, flexShrink: 0 }} />}
                      <div className="col" style={{ gap: 6, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink)' }}>{it.note.text}</div>
                        <div className="eyebrow" style={{ color: 'var(--green)' }}>
                          {it.note.dateShort} · {it.note.who} · chvíľka
                        </div>
                      </div>
                    </button>
                  ) : it.type === 'milestone' ? (
                    <div className="card tint" style={{ padding: 14 }}>
                      <div className="eyebrow" style={{ color: 'var(--green)' }}>{it.date} · míľnik</div>
                      <div className="serif" style={{ fontSize: 24, fontWeight: 600, color: 'var(--green-deep)', marginTop: 2 }}>
                        {it.title}
                      </div>
                      {it.sub && <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2 }}>{it.sub}</div>}
                    </div>
                  ) : (
                    <button className="card flush" style={{
                      width: '100%', padding: 0, textAlign: 'left',
                      border: '0.5px solid var(--line)', cursor: 'pointer',
                      background: 'var(--surface)', font: 'inherit', color: 'inherit',
                    }} onClick={() => navigate('moment:' + it.mom.id)}>
                      <Photo seed={it.mom.seed} style={{ height: 170, borderRadius: 0 }} />
                      <div className="col gap-6" style={{ padding: 14 }}>
                        <div className="row between">
                          <div className="eyebrow">{it.mom.dateShort} · 📍 {it.mom.placeShort}</div>
                          <div className="row gap-6" style={{ color: 'var(--muted)' }}>
                            <span style={{ fontSize: 11 }}>{it.mom.photos} fotiek</span>
                          </div>
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 500 }}>{it.mom.title}</div>
                        <div className="row gap-4 wrap" style={{ marginTop: 2 }}>
                          {it.mom.tags.map(t => <span key={t} className="chip" style={{ fontSize: 10.5, padding: '3px 8px' }}>{t}</span>)}
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              ))}

              {/* Beginning */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: -28, top: 6,
                  width: 17, height: 17, borderRadius: '50%',
                  background: 'var(--green)', border: '1.5px solid var(--green)',
                  boxShadow: '0 0 0 4px var(--paper)',
                  color: 'var(--paper)', fontSize: 10, display: 'grid', placeItems: 'center',
                }}>♥</div>
                <div className="col gap-2" style={{ padding: '4px 0' }}>
                  <div className="eyebrow" style={{ color: 'var(--green)' }}>21. január 2024</div>
                  <div className="handwritten" style={{ fontSize: 22, color: 'var(--green-deep)' }}>
                    začiatok všetkého ♡
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---- Places ---- */}
        {view === 'places' && (
          <div className="col gap-14">
            <button className="card tint" onClick={() => navigate('map')} style={{
              width: '100%', padding: 14, cursor: 'pointer', textAlign: 'left',
              border: 'none', font: 'inherit', color: 'inherit',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: 'var(--green)', color: 'var(--paper)',
                display: 'grid', placeItems: 'center',
              }}>{React.cloneElement(Icons.map, { style: { width: 20, height: 20 } })}</span>
              <div className="col grow">
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--green-deep)' }}>Zobraziť na mape</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>{places.length} miest · celá cesta</div>
              </div>
              <span style={{ color: 'var(--green)' }}>{React.cloneElement(Icons.arrow, { style: { width: 18, height: 18 } })}</span>
            </button>

            {places.map(p => (
              <div key={p.key} className="col gap-8">
                <div className="row gap-6" style={{ alignItems: 'center' }}>
                  <span style={{ color: 'var(--green)' }}>
                    {React.cloneElement(Icons.pin, { style: { width: 16, height: 16 } })}
                  </span>
                  <div style={{ fontSize: 14.5, fontWeight: 500 }}>{p.place}</div>
                  <div className="grow" />
                  <span className="eyebrow">{p.moms.length} {momentWord(p.moms.length)}</span>
                </div>
                <div style={{ margin: '0 -20px', overflowX: 'auto', paddingLeft: 20 }}>
                  <div className="row gap-8" style={{ width: 'max-content', paddingRight: 20 }}>
                    {p.moms.map(m => (
                      <button key={m.id} className="card flush" onClick={() => navigate('moment:' + m.id)}
                        style={{
                          padding: 0, cursor: 'pointer', overflow: 'hidden', width: 150,
                          border: '0.5px solid var(--line)', background: 'var(--surface)',
                          font: 'inherit', color: 'inherit', textAlign: 'left', flexShrink: 0,
                        }}>
                        <Photo seed={m.seed} style={{ width: 150, height: 100, borderRadius: 0 }} />
                        <div className="col gap-2" style={{ padding: '8px 10px 10px' }}>
                          <div style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.2 }}>{m.title}</div>
                          <div className="eyebrow" style={{ textTransform: 'none', letterSpacing: 0 }}>
                            {m.dateShort} · {m.photos} fotiek
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

Object.assign(window, { Gallery });
