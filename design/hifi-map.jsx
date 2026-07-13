// MAP screen (V2-based) — map card + stats trio + recent destinations list

// Simplified world map (clean line silhouette in deep green)
const WorldMap = ({ height = 180, pins = [] }) => (
  <svg viewBox="0 0 360 180" style={{ width: '100%', height, display: 'block' }}>
    <defs>
      <linearGradient id="mapGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fafaf7" />
        <stop offset="100%" stopColor="#f1ede2" />
      </linearGradient>
    </defs>
    <rect width="360" height="180" fill="url(#mapGrad)" />

    <g fill="rgba(45, 90, 61, 0.08)" stroke="rgba(45, 90, 61, 0.55)" strokeWidth="0.7" strokeLinejoin="round">
      {/* north america */}
      <path d="M30 55 Q40 35 60 32 L95 36 Q110 42 115 58 L108 78 Q95 92 75 92 Q55 90 45 80 L30 70 Z" />
      {/* central + south america */}
      <path d="M90 95 Q100 92 108 100 L112 115 Q108 135 100 152 Q92 162 85 158 Q80 145 82 130 L86 110 Z" />
      {/* europe */}
      <path d="M165 50 Q178 42 200 45 L210 55 Q208 68 195 72 Q180 70 170 65 Z" />
      {/* africa */}
      <path d="M170 78 Q190 75 205 82 L215 105 Q210 130 195 145 Q180 150 172 140 L168 115 Q165 95 170 78 Z" />
      {/* asia */}
      <path d="M210 42 Q240 35 280 38 Q315 42 335 52 L340 70 Q325 82 295 85 Q260 84 235 78 L215 70 Z" />
      {/* southeast asia + indonesia */}
      <path d="M295 95 Q310 92 320 100 L318 110 Q305 115 295 110 Z" />
      {/* australia */}
      <path d="M295 130 Q315 127 335 132 Q340 145 325 152 Q305 152 295 142 Z" />
    </g>

    {/* Travel route lines (dashed connecting pins) */}
    <g stroke="rgba(45, 90, 61, 0.35)" strokeWidth="0.8" strokeDasharray="2 3" fill="none">
      <path d="M180 65 Q185 50 195 55" />
      <path d="M180 65 Q200 50 220 58" />
      <path d="M180 65 Q175 60 175 55" />
    </g>

    {/* Pins */}
    {pins.map((p, i) => (
      <g key={i} onClick={p.onClick} style={{ cursor: p.onClick ? 'pointer' : 'default' }}>
        <circle cx={p.x} cy={p.y} r="9" fill={p.active ? 'rgba(45, 90, 61, 0.22)' : 'rgba(45, 90, 61, 0.12)'} />
        <circle cx={p.x} cy={p.y} r={p.active ? 6 : 4.5} fill="var(--green)" />
        <circle cx={p.x} cy={p.y} r="1.6" fill="var(--paper)" />
      </g>
    ))}
  </svg>
);

const MapScreen = ({ navigate }) => {
  const [query, setQuery] = React.useState('');
  const [searching, setSearching] = React.useState(false);
  const [sort, setSort] = React.useState('az'); // 'az' | 'photos'
  const [openCountry, setOpenCountry] = React.useState(null);

  const pins = [
    { x: 178, y: 60, name: 'Slovensko' },
    { x: 175, y: 55, name: 'Rakúsko' },
    { x: 172, y: 53, name: 'Česko' },
    { x: 195, y: 55, name: 'Maďarsko' },
    { x: 220, y: 32, name: 'Nórsko' },
    { x: 195, y: 70, name: 'Taliansko' },
    { x: 165, y: 50, name: 'Nemecko' },
  ].map(p => {
    const c = COUNTRIES.find(cc => cc.name === p.name);
    return { ...p, onClick: c ? () => setOpenCountry(c) : undefined };
  });

  const q = query.trim().toLowerCase();
  const filtered = COUNTRIES
    .filter(c => !q ||
      c.name.toLowerCase().includes(q) ||
      c.cities.some(ci => ci.name.toLowerCase().includes(q)))
    .sort((a, b) => sort === 'az'
      ? a.name.localeCompare(b.name, 'sk')
      : b.photos - a.photos);

  const cityWord = (n) => n === 1 ? 'mesto' : n < 5 ? 'mestá' : 'miest';

  return (
    <>
      <AppHeader
        eyebrow="kam sme boli"
        title="mapa sveta"
        right={
          <>
            <button className={'icon-btn' + (searching ? ' green' : '')}
              onClick={() => { setSearching(!searching); if (searching) setQuery(''); }}>
              {Icons.search}
            </button>
            <button className={'icon-btn' + (sort === 'photos' ? ' green' : '')}
              onClick={() => setSort(sort === 'az' ? 'photos' : 'az')}>
              {Icons.filter}
            </button>
          </>
        }
      >
        {searching && (
          <div style={{ position: 'relative', marginTop: 10 }}>
            <span style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--muted-2)', display: 'grid', placeItems: 'center',
            }}>{React.cloneElement(Icons.search, { style: { width: 16, height: 16 } })}</span>
            <input value={query} onChange={e => setQuery(e.target.value)} autoFocus
              placeholder="hľadaj krajinu alebo mesto…"
              style={{
                width: '100%', font: 'inherit', fontSize: 14, color: 'var(--ink)',
                background: 'var(--surface)', border: '0.5px solid var(--line)',
                borderRadius: 999, padding: '10px 14px 10px 36px', outline: 'none',
              }} />
          </div>
        )}
      </AppHeader>
      <div className="scroll">
        {/* Map card */}
        <div className="card flush" style={{ borderRadius: 'var(--r-lg)' }}>
          <WorldMap pins={pins} height={220} />
        </div>

        {/* Stats trio */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14 }}>
          <div className="card" style={{ padding: 14, alignItems: 'center', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
            <div className="num" style={{ fontSize: 32, color: 'var(--green)' }}>{STATS.countries}</div>
            <div className="eyebrow" style={{ fontSize: 9.5 }}>krajín</div>
          </div>
          <div className="card" style={{ padding: 14, alignItems: 'center', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
            <div className="num" style={{ fontSize: 32, color: 'var(--green)' }}>{STATS.cities}</div>
            <div className="eyebrow" style={{ fontSize: 9.5 }}>miest</div>
          </div>
          <div className="card" style={{ padding: 14, alignItems: 'center', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
            <div className="num" style={{ fontSize: 32, color: 'var(--green)' }}>{STATS.km.toLocaleString('sk-SK')}</div>
            <div className="eyebrow" style={{ fontSize: 9.5 }}>km</div>
          </div>
        </div>

        {/* Countries list */}
        <div className="row between" style={{ margin: '24px 0 8px' }}>
          <div className="handwritten" style={{ fontSize: 22 }}>Krajiny</div>
          <span className="eyebrow">{sort === 'az' ? 'A → Z' : 'najviac fotiek'}</span>
        </div>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: 'center' }}>
            <div className="handwritten" style={{ fontSize: 20, color: 'var(--muted)' }}>nič sme nenašli</div>
            <div style={{ fontSize: 12, color: 'var(--muted-2)', marginTop: 4 }}>skús iné slovo</div>
          </div>
        ) : (
        <div className="card" style={{ padding: '4px 14px' }}>
          {filtered.map((c, i) => (
            <button key={c.name} className="row gap-12" onClick={() => setOpenCountry(c)}
              style={{
                padding: '12px 0', width: '100%', alignItems: 'center',
                borderTop: i === 0 ? 'none' : '0.5px solid var(--line)',
                background: 'none', border: 'none', font: 'inherit', color: 'inherit',
                cursor: 'pointer', textAlign: 'left',
                borderTopWidth: i === 0 ? 0 : 0.5, borderTopStyle: 'solid',
                borderTopColor: i === 0 ? 'transparent' : 'var(--line)',
              }}>
              <span style={{ fontSize: 22 }}>{c.flag}</span>
              <div className="col grow" style={{ gap: 2 }}>
                <span style={{ fontSize: 13.5, fontWeight: 500 }}>{c.name}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {c.cities.length} {cityWord(c.cities.length)} · {c.photos} fotiek
                </span>
              </div>
              <span style={{ color: 'var(--muted-2)' }}>{Icons.arrow}</span>
            </button>
          ))}
        </div>
        )}

        {/* Wishlist teaser */}
        <div className="card tint" style={{ marginTop: 16, padding: 14 }}>
          <div className="row gap-10">
            <div style={{ fontSize: 22 }}>🗺️</div>
            <div className="col gap-2 grow">
              <div className="eyebrow" style={{ color: 'var(--green)' }}>wishlist</div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>Island, Lisabon, Tokio</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>3 destinácie na rad</div>
            </div>
            <button className="btn ghost" style={{ padding: 6, color: 'var(--green)' }}>{Icons.arrow}</button>
          </div>
        </div>
      </div>

      {openCountry && (
        <CountryDetail country={openCountry} onClose={() => setOpenCountry(null)} navigate={navigate} />
      )}
    </>
  );
};

/* ---- Country drill-in overlay ---- */
const CountryDetail = ({ country, onClose, navigate }) => {
  const cityWord = (n) => n === 1 ? 'mesto' : n < 5 ? 'mestá' : 'miest';
  const pin = { x: country.x, y: country.y, name: country.name, active: true };
  const withMoments = country.cities.filter(c => c.momentIds && c.momentIds.length);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 30, background: 'var(--paper)',
      display: 'flex', flexDirection: 'column', animation: 'slideUp 300ms ease both',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '54px 16px 12px',
      }}>
        <button className="icon-btn" onClick={onClose} style={{ flexShrink: 0 }}>{Icons.back}</button>
        <div className="row gap-8 grow" style={{ alignItems: 'center', minWidth: 0 }}>
          <span style={{ fontSize: 26 }}>{country.flag}</span>
          <div className="col" style={{ minWidth: 0 }}>
            <div className="eyebrow">{country.cities.length} {cityWord(country.cities.length)} · {country.photos} fotiek</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{country.name}</div>
          </div>
        </div>
      </div>

      <div className="scroll" style={{ flex: 1 }}>
        {/* Focused map */}
        <div className="card flush" style={{ borderRadius: 'var(--r-lg)', marginBottom: 18 }}>
          <WorldMap pins={[pin]} height={150} />
        </div>

        {/* Cities */}
        <div className="eyebrow" style={{ marginBottom: 10 }}>mestá a miesta</div>
        <div className="card" style={{ padding: '4px 14px', marginBottom: 20 }}>
          {country.cities.map((ci, i) => {
            const linked = ci.momentIds && ci.momentIds.length;
            return (
              <button key={ci.name}
                onClick={linked ? () => navigate('moment:' + ci.momentIds[0]) : undefined}
                className="row gap-12"
                style={{
                  padding: '12px 0', width: '100%', alignItems: 'center',
                  borderTop: i === 0 ? 'none' : '0.5px solid var(--line)',
                  background: 'none', border: 'none', font: 'inherit', color: 'inherit',
                  cursor: linked ? 'pointer' : 'default', textAlign: 'left',
                }}>
                <span style={{ color: 'var(--green)', flexShrink: 0 }}>
                  {React.cloneElement(Icons.pin, { style: { width: 17, height: 17 } })}
                </span>
                <div className="col grow" style={{ gap: 2 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 500 }}>{ci.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                    {ci.photos} fotiek{linked ? ` · ${ci.momentIds.length} ${ci.momentIds.length === 1 ? 'moment' : 'momenty'}` : ''}
                  </span>
                </div>
                {linked && <span style={{ color: 'var(--muted-2)' }}>{Icons.arrow}</span>}
              </button>
            );
          })}
        </div>

        {/* Moments from this country */}
        {withMoments.length > 0 && (
          <>
            <div className="eyebrow" style={{ marginBottom: 10 }}>momenty odtiaľto</div>
            <div className="col gap-10">
              {withMoments.flatMap(ci => ci.momentIds).map(id => {
                const m = MOMENTS.find(mm => mm.id === id);
                if (!m) return null;
                return (
                  <button key={id} className="card flush" onClick={() => navigate('moment:' + id)}
                    style={{
                      display: 'flex', gap: 12, padding: 10, textAlign: 'left', width: '100%',
                      border: '0.5px solid var(--line)', cursor: 'pointer', alignItems: 'center',
                      background: 'var(--surface)', font: 'inherit', color: 'inherit',
                    }}>
                    <Photo seed={m.seed} style={{ width: 60, height: 60, borderRadius: 12, flexShrink: 0 }} />
                    <div className="col grow" style={{ minWidth: 0, gap: 3 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{m.title}</div>
                      <div className="eyebrow" style={{ textTransform: 'none', letterSpacing: 0 }}>
                        {m.dateShort} · {m.photos} fotiek
                      </div>
                    </div>
                    <span style={{ color: 'var(--muted-2)', flexShrink: 0 }}>{Icons.arrow}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { MapScreen, WorldMap, CountryDetail });