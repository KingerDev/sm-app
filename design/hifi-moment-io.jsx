// MOMENT ADD + MOMENT SEARCH — overlay sheets

const ALL_TAGS = ['cestovanie', 'jedlo', 'zážitky', 'my dvaja', 'rodina'];

const mInputBase = {
  width: '100%', font: 'inherit', fontSize: 15, color: 'var(--ink)',
  background: 'var(--surface)', border: '0.5px solid var(--line)',
  borderRadius: 12, padding: '13px 14px', outline: 'none',
};

/* ---------- Add moment ---------- */
const MomentAdd = ({ onBack, moment }) => {
  const edit = !!moment;
  const presetTags = edit ? moment.tags.filter(t => ALL_TAGS.includes(t)) : [];
  const presetCustom = edit ? moment.tags.filter(t => !ALL_TAGS.includes(t)) : [];
  const [title, setTitle] = React.useState(edit ? moment.title : '');
  const [place, setPlace] = React.useState(edit ? moment.place : '');
  const [date, setDate] = React.useState(edit ? moment.date : '');
  const [who, setWho] = React.useState(edit ? moment.who : 'spolu');
  const [placeSheet, setPlaceSheet] = React.useState(false);
  const [tags, setTags] = React.useState(edit ? moment.tags : []);
  const [customTags, setCustomTags] = React.useState(presetCustom);
  const [newTag, setNewTag] = React.useState('');
  const [note, setNote] = React.useState(edit ? moment.desc : '');

  const toggleTag = (t) => setTags(tags.includes(t) ? tags.filter(x => x !== t) : [...tags, t]);
  const addCustomTag = () => {
    const v = newTag.trim().toLowerCase();
    if (!v) return;
    const all = [...ALL_TAGS, ...customTags];
    if (!all.includes(v)) setCustomTags([...customTags, v]);
    if (!tags.includes(v)) setTags([...tags, v]);
    setNewTag('');
  };
  const canSave = title.trim().length > 0;

  const fieldWrap = { position: 'relative' };
  const fieldIcon = {
    position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
    color: 'var(--muted-2)', display: 'grid', placeItems: 'center', pointerEvents: 'none',
  };

  return (
    <div className="col" style={{ height: '100%', background: 'var(--paper)' }}>
      <div className="app-header" style={{ paddingBottom: 12 }}>
        <div className="col" style={{ minWidth: 0 }}>
          <div className="eyebrow">{edit ? 'uprav spomienku' : 'zachyť spomienku'}</div>
          <h1>{edit ? 'upraviť moment' : 'nový moment'}</h1>
        </div>
        <div className="actions">
          <button className="icon-btn" onClick={onBack}>{Icons.close}</button>
        </div>
      </div>

      <div className="scroll" style={{ flex: 1 }}>
        {/* Photo dropzone */}
        {edit ? (
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <Photo seed={moment.seed} style={{ height: 150, borderRadius: 16 }} />
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 16,
              background: 'linear-gradient(transparent 40%, rgba(0,0,0,0.4))',
            }} />
            <button className="btn" style={{
              position: 'absolute', bottom: 12, right: 12, padding: '8px 14px',
              gap: 6, fontSize: 12.5, background: 'rgba(250,250,247,0.94)',
              backdropFilter: 'blur(8px)', border: 'none', color: 'var(--ink)',
            }}>
              {React.cloneElement(Icons.img, { style: { width: 15, height: 15 } })} zmeniť fotku
            </button>
          </div>
        ) : (
          <div style={{
            border: '1.5px dashed var(--green-line)', borderRadius: 16,
            background: 'var(--green-soft)', padding: '26px 16px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            cursor: 'pointer', marginBottom: 20,
          }}>
            <div style={{
              width: 46, height: 46, borderRadius: '50%', background: 'var(--green)',
              display: 'grid', placeItems: 'center', color: 'var(--paper)',
            }}>{React.cloneElement(Icons.img, { style: { width: 22, height: 22 } })}</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--green-deep)' }}>Pridaj fotky</div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>ťukni alebo potiahni sem</div>
          </div>
        )}

        {/* Title */}
        <div className="eyebrow" style={{ marginBottom: 10 }}>názov</div>
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder="napr. Víkend vo Viedni"
          style={{ ...mInputBase, marginBottom: 18 }} />

        {/* Date + Place */}
        <div style={fieldWrap}>
          <span style={fieldIcon}>{React.cloneElement(Icons.cal, { style: { width: 18, height: 18 } })}</span>
          <input value={date} onChange={e => setDate(e.target.value)}
            placeholder="dátum"
            style={{ ...mInputBase, paddingLeft: 42, marginBottom: 10 }} />
        </div>
        <button onClick={() => setPlaceSheet(true)} style={{
          ...mInputBase, paddingLeft: 42, marginBottom: 18, position: 'relative',
          display: 'flex', alignItems: 'center', textAlign: 'left', cursor: 'pointer',
          color: place ? 'var(--ink)' : 'var(--muted-2)',
        }}>
          <span style={fieldIcon}>{React.cloneElement(Icons.pin, { style: { width: 18, height: 18 } })}</span>
          <span className="grow">{place || 'vyber miesto'}</span>
          <span style={{ color: 'var(--muted-2)' }}>
            {React.cloneElement(Icons.arrow, { style: { width: 16, height: 16 } })}
          </span>
        </button>

        {/* Who */}
        <div className="eyebrow" style={{ marginBottom: 10 }}>kto pridal</div>
        <div className="row" style={{
          gap: 0, background: 'var(--surface)', border: '0.5px solid var(--line)',
          borderRadius: 12, padding: 4, marginBottom: 18,
        }}>
          {['S', 'M', 'spolu'].map(w => (
            <button key={w} onClick={() => setWho(w)} style={{
              flex: 1, padding: '9px', borderRadius: 9, font: 'inherit',
              fontSize: 13.5, fontWeight: 500, cursor: 'pointer', border: 'none',
              background: who === w ? 'var(--green)' : 'transparent',
              color: who === w ? 'var(--paper)' : 'var(--muted)',
            }}>{w}</button>
          ))}
        </div>

        {/* Tags */}
        <div className="eyebrow" style={{ marginBottom: 10 }}>štítky</div>
        <div className="row gap-6 wrap" style={{ marginBottom: 10 }}>
          {[...ALL_TAGS, ...customTags].map(t => (
            <button key={t} onClick={() => toggleTag(t)}
              className={'chip' + (tags.includes(t) ? ' green' : '')}
              style={{ cursor: 'pointer', border: 'none', font: 'inherit' }}>{t}</button>
          ))}
        </div>
        <div className="row gap-8" style={{ marginBottom: 18 }}>
          <input value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag(); } }}
            placeholder="nový štítok…"
            style={{ ...mInputBase, fontSize: 14, padding: '10px 13px' }} />
          <button className="btn" onClick={addCustomTag} disabled={!newTag.trim()}
            style={{
              flexShrink: 0, padding: '10px 16px', gap: 6,
              color: 'var(--green)', borderColor: 'var(--green-line)',
              background: 'var(--green-soft)',
              opacity: newTag.trim() ? 1 : 0.45,
              cursor: newTag.trim() ? 'pointer' : 'default',
            }}>
            {React.cloneElement(Icons.plus, { style: { width: 15, height: 15 } })} pridať
          </button>
        </div>

        {/* Note */}
        <div className="eyebrow" style={{ marginBottom: 10 }}>poznámka</div>
        <textarea value={note} onChange={e => setNote(e.target.value)}
          placeholder="pár viet, aby sme nezabudli…" rows={3}
          style={{ ...mInputBase, resize: 'none', lineHeight: 1.5 }} />

        <div className="handwritten" style={{
          marginTop: 20, textAlign: 'center', fontSize: 17, color: 'var(--muted)',
        }}>
          {edit ? 'každý detail sa ráta ✎' : 'malá chvíľa, veľká spomienka ♡'}
        </div>
      </div>

      <div style={{
        padding: '14px 20px calc(14px + env(safe-area-inset-bottom))',
        borderTop: '0.5px solid var(--line)', background: 'var(--paper)',
      }}>
        <button className="btn primary" disabled={!canSave} onClick={onBack}
          style={{ width: '100%', padding: '15px', fontSize: 15,
            opacity: canSave ? 1 : 0.45, cursor: canSave ? 'pointer' : 'default' }}>
          {edit ? 'uložiť zmeny' : 'uložiť moment'}
        </button>
      </div>

      {placeSheet && (
        <PlacePicker
          current={place}
          onClose={() => setPlaceSheet(false)}
          onPick={(p) => { setPlace(p); setPlaceSheet(false); }}
        />
      )}
    </div>
  );
};

/* ---------- Place picker ---------- */
const PlacePicker = ({ current, onClose, onPick }) => {
  const [q, setQ] = React.useState('');
  const [adding, setAdding] = React.useState(false);
  const [newCity, setNewCity] = React.useState('');
  const [newCountry, setNewCountry] = React.useState('');

  // Flatten known places from the map data: "Mesto · Krajina"
  const known = [];
  COUNTRIES.forEach(c => c.cities.forEach(ci => {
    known.push({ label: `${ci.name} · ${c.name}`, flag: c.flag, city: ci.name });
  }));

  const query = q.trim().toLowerCase();
  const filtered = known.filter(k => !query || k.label.toLowerCase().includes(query));

  const saveNew = () => {
    const city = newCity.trim();
    const country = newCountry.trim();
    if (!city) return;
    onPick(country ? `${city} · ${country}` : city);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40 }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(20,30,22,0.4)',
        animation: 'fadeIn 200ms ease both',
      }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: 'var(--paper)', borderRadius: '22px 22px 0 0',
        padding: '10px 20px calc(16px + env(safe-area-inset-bottom))',
        maxHeight: '86%', display: 'flex', flexDirection: 'column',
        animation: 'slideUp 300ms ease both',
      }}>
        <div style={{
          width: 38, height: 4, borderRadius: 999, background: 'var(--line)',
          margin: '4px auto 12px',
        }} />

        {!adding ? (
          <>
            <div className="row between" style={{ alignItems: 'baseline', marginBottom: 12 }}>
              <div className="col">
                <div className="eyebrow" style={{ color: 'var(--green)' }}>kde to bolo</div>
                <div style={{ fontSize: 17, fontWeight: 500 }}>Vyber miesto</div>
              </div>
              <button className="icon-btn" onClick={onClose}>
                {React.cloneElement(Icons.close, { style: { width: 18, height: 18 } })}
              </button>
            </div>

            <div style={{ position: 'relative', marginBottom: 12 }}>
              <span style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--muted-2)', display: 'grid', placeItems: 'center',
              }}>{React.cloneElement(Icons.search, { style: { width: 16, height: 16 } })}</span>
              <input value={q} onChange={e => setQ(e.target.value)} autoFocus
                placeholder="hľadaj mesto alebo krajinu…"
                style={{ ...mInputBase, paddingLeft: 38, borderRadius: 999 }} />
            </div>

            <div className="scroll" style={{ flex: 1, minHeight: 0, margin: '0 -20px', padding: '0 20px' }}>
              <button onClick={() => { setAdding(true); setNewCity(q); }} className="row gap-12" style={{
                width: '100%', padding: '12px 0', alignItems: 'center', textAlign: 'left',
                background: 'none', border: 'none', font: 'inherit', color: 'var(--green)',
                cursor: 'pointer', borderBottom: '0.5px solid var(--line)',
              }}>
                <span style={{
                  width: 30, height: 30, borderRadius: '50%', background: 'var(--green-soft)',
                  display: 'grid', placeItems: 'center', flexShrink: 0,
                }}>{React.cloneElement(Icons.plus, { style: { width: 16, height: 16 } })}</span>
                <span style={{ fontSize: 13.5, fontWeight: 500 }}>Pridať nové miesto</span>
              </button>

              {filtered.map(k => (
                <button key={k.label} onClick={() => onPick(k.label)} className="row gap-12" style={{
                  width: '100%', padding: '12px 0', alignItems: 'center', textAlign: 'left',
                  background: 'none', border: 'none', font: 'inherit',
                  color: current === k.label ? 'var(--green)' : 'var(--ink)',
                  cursor: 'pointer', borderBottom: '0.5px solid var(--line)',
                }}>
                  <span style={{ fontSize: 20 }}>{k.flag}</span>
                  <span className="grow" style={{ fontSize: 13.5, fontWeight: current === k.label ? 500 : 400 }}>{k.label}</span>
                  {current === k.label && <span style={{ color: 'var(--green)' }}>
                    {React.cloneElement(Icons.check, { style: { width: 17, height: 17 } })}
                  </span>}
                </button>
              ))}
              {filtered.length === 0 && (
                <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 12.5, color: 'var(--muted-2)' }}>
                  žiadne uložené miesto — pridaj nové ↑
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="row between" style={{ alignItems: 'baseline', marginBottom: 16 }}>
              <div className="col">
                <div className="eyebrow" style={{ color: 'var(--green)' }}>nové miesto</div>
                <div style={{ fontSize: 17, fontWeight: 500 }}>Kam ste išli?</div>
              </div>
              <button className="btn ghost" onClick={() => setAdding(false)}
                style={{ padding: 6, gap: 4, fontSize: 12.5, color: 'var(--muted)' }}>
                {React.cloneElement(Icons.back, { style: { width: 16, height: 16 } })} späť
              </button>
            </div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>mesto</div>
            <input value={newCity} onChange={e => setNewCity(e.target.value)} autoFocus
              placeholder="napr. Barcelona"
              style={{ ...mInputBase, marginBottom: 14 }} />
            <div className="eyebrow" style={{ marginBottom: 8 }}>krajina</div>
            <input value={newCountry} onChange={e => setNewCountry(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveNew(); }}
              placeholder="napr. Španielsko"
              style={{ ...mInputBase, marginBottom: 18 }} />
            <button className="btn primary" disabled={!newCity.trim()} onClick={saveNew}
              style={{ width: '100%', padding: '14px', fontSize: 15,
                opacity: newCity.trim() ? 1 : 0.45, cursor: newCity.trim() ? 'pointer' : 'default' }}>
              použiť toto miesto
            </button>
          </>
        )}
      </div>
    </div>
  );
};

/* ---------- Search moments ---------- */
const MomentSearch = ({ onBack, navigate }) => {
  const [q, setQ] = React.useState('');
  const [activeTag, setActiveTag] = React.useState(null);

  const query = q.trim().toLowerCase();
  const results = MOMENTS.filter(m => {
    const matchesQ = !query ||
      m.title.toLowerCase().includes(query) ||
      m.place.toLowerCase().includes(query) ||
      m.tags.some(t => t.toLowerCase().includes(query));
    const matchesTag = !activeTag || m.tags.includes(activeTag);
    return matchesQ && matchesTag;
  });

  const suggestions = ['Viedeň', 'Tatry', 'výročie', 'koncert'];

  return (
    <div className="col" style={{ height: '100%', background: 'var(--paper)' }}>
      {/* Search bar header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '54px 16px 12px',
      }}>
        <button className="icon-btn" onClick={onBack} style={{ flexShrink: 0 }}>{Icons.back}</button>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--muted-2)', display: 'grid', placeItems: 'center',
          }}>{React.cloneElement(Icons.search, { style: { width: 17, height: 17 } })}</span>
          <input value={q} onChange={e => setQ(e.target.value)} autoFocus
            placeholder="hľadaj v momentoch…"
            style={{ ...mInputBase, paddingLeft: 38, paddingRight: q ? 38 : 14, borderRadius: 999 }} />
          {q && (
            <button onClick={() => setQ('')} style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-2)',
              display: 'grid', placeItems: 'center', padding: 4,
            }}>{React.cloneElement(Icons.close, { style: { width: 15, height: 15 } })}</button>
          )}
        </div>
      </div>

      {/* Tag filters */}
      <div className="row gap-6 wrap" style={{ padding: '0 16px 12px' }}>
        {ALL_TAGS.map(t => (
          <button key={t} onClick={() => setActiveTag(activeTag === t ? null : t)}
            className={'chip' + (activeTag === t ? ' green' : '')}
            style={{ cursor: 'pointer', border: 'none', font: 'inherit' }}>{t}</button>
        ))}
      </div>

      <div className="scroll" style={{ flex: 1, paddingTop: 4 }}>
        {/* Suggestions when empty */}
        {!query && !activeTag && (
          <div style={{ marginBottom: 18 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>skús hľadať</div>
            <div className="row gap-6 wrap">
              {suggestions.map(s => (
                <button key={s} onClick={() => setQ(s)}
                  className="chip" style={{ cursor: 'pointer', border: 'none', font: 'inherit' }}>
                  {React.cloneElement(Icons.search, { style: { width: 12, height: 12, marginRight: 4 } })}{s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="row between" style={{ marginBottom: 12, alignItems: 'baseline' }}>
          <div className="eyebrow">{results.length} výsledkov</div>
        </div>

        {results.length === 0 ? (
          <div className="col" style={{ alignItems: 'center', gap: 6, padding: '40px 0' }}>
            <div className="handwritten" style={{ fontSize: 22, color: 'var(--muted)' }}>
              nič sme nenašli
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--muted-2)' }}>skús iné slovo alebo štítok</div>
          </div>
        ) : (
          <div className="col gap-10">
            {results.map(m => (
              <button key={m.id} className="card flush" onClick={() => navigate('moment:' + m.id)}
                style={{
                  display: 'flex', gap: 12, padding: 10, textAlign: 'left',
                  width: '100%', border: '0.5px solid var(--line)', cursor: 'pointer',
                  background: 'var(--surface)', font: 'inherit', color: 'inherit',
                  alignItems: 'center',
                }}>
                <Photo seed={m.seed} style={{ width: 64, height: 64, borderRadius: 12, flexShrink: 0 }} />
                <div className="col grow" style={{ minWidth: 0, gap: 3 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 500 }}>{m.title}</div>
                  <div className="eyebrow" style={{ textTransform: 'none', letterSpacing: 0 }}>
                    {m.dateShort} · 📍 {m.placeShort}
                  </div>
                  <div className="row gap-4 wrap" style={{ marginTop: 2 }}>
                    {m.tags.map(t => <span key={t} className="chip" style={{ fontSize: 9.5, padding: '2px 7px' }}>{t}</span>)}
                  </div>
                </div>
                <span style={{ color: 'var(--muted-2)', flexShrink: 0 }}>
                  {React.cloneElement(Icons.arrow, { style: { width: 18, height: 18 } })}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { MomentAdd, MomentSearch, ALL_TAGS });
