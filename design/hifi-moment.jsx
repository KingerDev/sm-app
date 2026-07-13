// MOMENT DETAIL — drilled-in screen from gallery / home

const MomentDetail = ({ id, onBack }) => {
  const m = MOMENTS.find(mm => mm.id === id) || MOMENTS[0];
  const [sheet, setSheet] = React.useState(null); // 'menu' | 'all' | 'add'

  return (
    <>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '54px 16px 8px',
        display: 'flex', justifyContent: 'space-between',
        zIndex: 10,
        pointerEvents: 'none',
      }}>
        <button className="icon-btn" style={{
          pointerEvents: 'auto',
          background: 'rgba(250, 250, 247, 0.9)',
          backdropFilter: 'blur(8px)',
        }} onClick={onBack}>{Icons.back}</button>
        <div className="row gap-8" style={{ pointerEvents: 'auto' }}>
          <button className="icon-btn" style={{
            background: 'rgba(250, 250, 247, 0.9)', backdropFilter: 'blur(8px)',
          }} onClick={() => setSheet('menu')}>{Icons.more}</button>
        </div>
      </div>

      <div className="scroll no-pad-top" style={{ paddingTop: 0 }}>
        {/* Hero photo */}
        <div style={{ margin: '-8px -20px 0', position: 'relative' }}>
          <Photo seed={m.seed} style={{ height: 320, borderRadius: 0 }} />
          <div style={{
            position: 'absolute', inset: 'auto 0 0 0',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.45))',
            padding: '60px 20px 16px',
          }}>
            <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {m.date} · 📍 {m.place}
            </div>
            <div className="serif" style={{
              color: 'var(--paper)', fontSize: 36, fontWeight: 600, marginTop: 4,
              lineHeight: 1,
            }}>{m.title}</div>
          </div>
        </div>

        <div style={{ padding: '18px 0' }}>
          {/* Tags */}
          <div className="row gap-6 wrap" style={{ marginTop: 4 }}>
            {m.tags.map(t => <span key={t} className="chip soft">{t}</span>)}
            <span className="chip">pridal/a {m.who}</span>
          </div>

          {/* Description */}
          <div style={{
            marginTop: 16,
            paddingLeft: 14,
            borderLeft: '2px solid var(--green)',
          }}>
            <div style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--ink-soft)' }}>
              {m.desc}
            </div>
          </div>

          {/* Pinned favourites */}
          <div className="row between" style={{ margin: '24px 0 10px' }}>
            <div className="handwritten" style={{ fontSize: 22 }}>
              ♡ pripnuté ({m.pinned})
            </div>
            <span className="eyebrow">obľúbené</span>
          </div>
          <div style={{ margin: '0 -20px', overflowX: 'auto', paddingLeft: 20 }}>
            <div className="row gap-8" style={{ width: 'max-content', paddingRight: 20 }}>
              {Array.from({ length: m.pinned }).map((_, i) => (
                <Photo key={i} seed={`${m.seed}-pin-${i}`}
                  style={{ width: 180, height: 230, borderRadius: 14, flexShrink: 0 }} />
              ))}
            </div>
          </div>

          {/* All photos grid */}
          <div className="row between" style={{ margin: '24px 0 10px' }}>
            <div className="handwritten" style={{ fontSize: 22 }}>
              všetky fotky · {m.photos}
            </div>
            <button className="btn ghost" style={{ padding: '4px 8px', fontSize: 12, color: 'var(--muted)' }}>
              {Icons.filter}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <Photo key={i} seed={`${m.seed}-g-${i}`}
                style={{ aspectRatio: '1', borderRadius: 4 }} />
            ))}
          </div>
          <button className="btn ghost" onClick={() => setSheet('all')} style={{
            width: '100%', marginTop: 10, justifyContent: 'center',
            color: 'var(--green)', borderColor: 'var(--green-line)',
            background: 'var(--green-soft)',
          }}>
            zobraziť všetkých {m.photos} fotiek
          </button>

          {/* Add photo CTA */}
          <div className="card tint" style={{ marginTop: 16, padding: 14 }}>
            <div className="row between">
              <div className="col gap-2">
                <div className="eyebrow" style={{ color: 'var(--green)' }}>k tomuto momentu</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Pridať ďalšiu fotku</div>
              </div>
              <button className="icon-btn green" onClick={() => setSheet('add')}>{Icons.plus}</button>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Sub-sheets ---- */}
      {sheet === 'menu' && <MomentMenu m={m} onClose={() => setSheet(null)} onEdit={() => setSheet('edit')} />}
      {sheet === 'edit' && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 30,
          background: 'var(--paper)', display: 'flex', flexDirection: 'column',
          animation: 'slideUp 300ms ease both',
        }}>
          <MomentAdd moment={m} onBack={() => setSheet(null)} />
        </div>
      )}
      {sheet === 'all' && <AllPhotos m={m} onClose={() => setSheet(null)} onAdd={() => setSheet('add')} />}
      {sheet === 'add' && <AddPhotos m={m} onClose={() => setSheet(null)} />}
    </>
  );
};

/* ---- Bottom-sheet action menu (three dots) ---- */
const MomentMenu = ({ m, onClose, onEdit }) => {
  const rowStyle = {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '14px 4px', width: '100%', textAlign: 'left',
    background: 'none', border: 'none', font: 'inherit', cursor: 'pointer',
    color: 'var(--ink)', fontSize: 15,
  };
  const ic = (icon, color) => (
    <span style={{ color: color || 'var(--muted)', display: 'grid', placeItems: 'center', width: 22 }}>
      {React.cloneElement(icon, { style: { width: 20, height: 20 } })}
    </span>
  );
  const actions = [
    { icon: Icons.share, label: 'Zdieľať moment', onClick: onClose },
    { icon: Icons.edit, label: 'Upraviť detaily', onClick: onEdit },
    { icon: Icons.heart, label: 'Pripnúť na Domov', onClick: onClose },
    { icon: Icons.download, label: 'Stiahnuť všetky fotky', onClick: onClose },
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
          margin: '4px auto 14px',
        }} />
        <div className="row gap-10" style={{ alignItems: 'center', paddingBottom: 12 }}>
          <Photo seed={m.seed} style={{ width: 42, height: 42, borderRadius: 10, flexShrink: 0 }} />
          <div className="col" style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{m.title}</div>
            <div className="eyebrow" style={{ textTransform: 'none', letterSpacing: 0 }}>
              {m.dateShort} · {m.photos} fotiek
            </div>
          </div>
        </div>
        <div className="divider" />
        {actions.map(a => (
          <button key={a.label} style={rowStyle} onClick={a.onClick}>
            {ic(a.icon)}{a.label}
          </button>
        ))}
        <div className="divider" />
        <button style={{ ...rowStyle, color: '#b0402a' }} onClick={onClose}>
          {ic(Icons.trash, '#b0402a')}Vymazať moment
        </button>
      </div>
    </div>
  );
};

/* ---- Full-screen: all photos ---- */
const AllPhotos = ({ m, onClose, onAdd }) => (
  <div style={{
    position: 'absolute', inset: 0, zIndex: 30, background: 'var(--paper)',
    display: 'flex', flexDirection: 'column', animation: 'slideUp 300ms ease both',
  }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '54px 16px 12px', borderBottom: '0.5px solid var(--line)',
    }}>
      <button className="icon-btn" onClick={onClose} style={{ flexShrink: 0 }}>{Icons.back}</button>
      <div className="col grow" style={{ minWidth: 0 }}>
        <div className="eyebrow">{m.title}</div>
        <div style={{ fontSize: 16, fontWeight: 500 }}>všetky fotky · {m.photos}</div>
      </div>
      <button className="icon-btn green" onClick={onAdd} style={{ flexShrink: 0 }}>{Icons.plus}</button>
    </div>
    <div className="scroll" style={{ flex: 1, padding: 3 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
        {Array.from({ length: m.photos }).map((_, i) => (
          <Photo key={i} seed={`${m.seed}-all-${i}`} style={{ aspectRatio: '1', borderRadius: 3 }}>
            {i < m.pinned && (
              <div style={{
                position: 'absolute', top: 5, right: 5, color: 'var(--paper)',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
              }}>{React.cloneElement(Icons.heartFill, { style: { width: 15, height: 15 } })}</div>
            )}
          </Photo>
        ))}
      </div>
    </div>
  </div>
);

/* ---- Bottom-sheet: add photos ---- */
const AddPhotos = ({ m, onClose }) => {
  const [picked, setPicked] = React.useState([]);
  const toggle = (i) => setPicked(picked.includes(i) ? picked.filter(x => x !== i) : [...picked, i]);
  const sources = [
    { icon: Icons.img, label: 'Z knižnice' },
    { icon: Icons.plus, label: 'Odfotiť' },
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
        padding: '10px 20px calc(16px + env(safe-area-inset-bottom))',
        maxHeight: '86%', display: 'flex', flexDirection: 'column',
        animation: 'slideUp 300ms ease both',
      }}>
        <div style={{
          width: 38, height: 4, borderRadius: 999, background: 'var(--line)',
          margin: '4px auto 12px',
        }} />
        <div className="row between" style={{ alignItems: 'baseline', marginBottom: 4 }}>
          <div className="col">
            <div className="eyebrow" style={{ color: 'var(--green)' }}>k momentu · {m.title}</div>
            <div style={{ fontSize: 17, fontWeight: 500 }}>Pridať fotky</div>
          </div>
          <button className="icon-btn" onClick={onClose}>
            {React.cloneElement(Icons.close, { style: { width: 18, height: 18 } })}
          </button>
        </div>

        <div className="row gap-8" style={{ margin: '12px 0 16px' }}>
          {sources.map(s => (
            <button key={s.label} className="card" style={{
              flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 8, cursor: 'pointer', font: 'inherit',
              background: 'var(--surface)', color: 'var(--ink)',
              border: '0.5px solid var(--line)',
            }}>
              <span style={{
                width: 40, height: 40, borderRadius: '50%', background: 'var(--green-soft)',
                color: 'var(--green)', display: 'grid', placeItems: 'center',
              }}>{React.cloneElement(s.icon, { style: { width: 20, height: 20 } })}</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{s.label}</span>
            </button>
          ))}
        </div>

        <div className="eyebrow" style={{ marginBottom: 10 }}>posledné · ťukni pre výber</div>
        <div className="scroll" style={{ flex: 1, minHeight: 0, margin: '0 -20px', padding: '0 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
            {Array.from({ length: 12 }).map((_, i) => {
              const sel = picked.includes(i);
              const n = picked.indexOf(i) + 1;
              return (
                <button key={i} onClick={() => toggle(i)} style={{
                  position: 'relative', padding: 0, border: 'none', cursor: 'pointer',
                  borderRadius: 8, overflow: 'hidden', background: 'none',
                }}>
                  <Photo seed={`${m.seed}-lib-${i}`} style={{ aspectRatio: '1', borderRadius: 8 }} />
                  <span style={{
                    position: 'absolute', top: 6, right: 6, width: 20, height: 20,
                    borderRadius: '50%', display: 'grid', placeItems: 'center',
                    fontSize: 11, fontWeight: 600, color: 'var(--paper)',
                    background: sel ? 'var(--green)' : 'rgba(20,30,22,0.25)',
                    border: '1.5px solid ' + (sel ? 'var(--paper)' : 'rgba(255,255,255,0.7)'),
                  }}>{sel ? n : ''}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button className="btn primary" disabled={picked.length === 0} onClick={onClose}
          style={{ width: '100%', marginTop: 14, padding: '15px', fontSize: 15,
            opacity: picked.length ? 1 : 0.45, cursor: picked.length ? 'pointer' : 'default' }}>
          {picked.length ? `Pridať ${picked.length} ${picked.length === 1 ? 'fotku' : picked.length < 5 ? 'fotky' : 'fotiek'}` : 'Vyber fotky'}
        </button>
      </div>
    </div>
  );
};

Object.assign(window, { MomentDetail });