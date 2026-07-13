// BUCKET screen (V3-based) — hero progress + grid of category cards + drill-in panel

const Bucket = ({ navigate }) => {
  const [activeCat, setActiveCat] = React.useState(null);
  const cat = activeCat ? BUCKET_CATEGORIES.find(c => c.id === activeCat) : null;
  const items = activeCat ? BUCKET_ITEMS[activeCat] : null;

  return (
    <>
      <AppHeader
        eyebrow="náš zoznam snov"
        title="bucket list"
        right={<button className="icon-btn green" onClick={() => navigate('bucket-add')}>{Icons.plus}</button>}
      />
      <div className="scroll">
        {/* Hero progress card */}
        <div className="card hero" style={{ padding: 18 }}>
          <div className="row between">
            <div className="col gap-4">
              <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.75)' }}>splnené spolu</span>
              <div className="row gap-8" style={{ alignItems: 'baseline' }}>
                <span className="num" style={{ fontSize: 56, color: 'var(--paper)' }}>{STATS.bucketDone}</span>
                <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)' }}>/ {STATS.bucketTotal}</span>
              </div>
            </div>
            <div style={{
              width: 64, height: 64,
              borderRadius: '50%',
              background: 'conic-gradient(var(--paper) 0 ' + (STATS.bucketDone / STATS.bucketTotal * 360) + 'deg, rgba(255,255,255,0.18) 0)',
              display: 'grid', placeItems: 'center',
            }}>
              <div style={{
                width: 50, height: 50, borderRadius: '50%',
                background: 'var(--green)', display: 'grid', placeItems: 'center',
                color: 'var(--paper)', fontSize: 13, fontWeight: 500,
              }}>{Math.round(STATS.bucketDone / STATS.bucketTotal * 100)}%</div>
            </div>
          </div>
          <div className="handwritten" style={{ color: 'var(--paper)', fontSize: 18, marginTop: 10, opacity: 0.9 }}>
            tretina za nami — ďakujem 🤍
          </div>
        </div>

        {/* Category grid */}
        <div className="eyebrow" style={{ margin: '24px 0 10px' }}>kategórie</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {BUCKET_CATEGORIES.map(c => (
            <button key={c.id}
              className="card"
              style={{
                padding: 16, textAlign: 'left',
                cursor: 'pointer',
                aspectRatio: '1',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                background: 'var(--surface)',
                font: 'inherit', color: 'inherit',
                border: '0.5px solid ' + (activeCat === c.id ? 'var(--green)' : 'var(--line)'),
              }}
              onClick={() => setActiveCat(activeCat === c.id ? null : c.id)}>
              <div className="row between">
                <div style={{
                  fontSize: 24, width: 38, height: 38, borderRadius: 12,
                  background: 'var(--green-soft)', color: 'var(--green)',
                  display: 'grid', placeItems: 'center',
                }}>{c.icon}</div>
                <span className="num" style={{ fontSize: 24, color: 'var(--green)' }}>
                  {Math.round(c.done / c.total * 100)}%
                </span>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
                  {c.done} z {c.total} splnené
                </div>
                <ProgressBar value={c.done / c.total} />
              </div>
            </button>
          ))}
        </div>

        {/* Drill-in panel for selected category */}
        {cat && (
          <div className="card" style={{ marginTop: 16, padding: 16 }} key={cat.id}>
            <div className="row between" style={{ marginBottom: 12 }}>
              <div className="row gap-8">
                <span style={{ fontSize: 18, color: 'var(--green)' }}>{cat.icon}</span>
                <div className="col">
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{cat.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{cat.done}/{cat.total} splnené</div>
                </div>
              </div>
              <button className="btn ghost" style={{ padding: 6, color: 'var(--muted)' }}
                onClick={() => setActiveCat(null)}>{Icons.close}</button>
            </div>
            <div className="col" style={{ gap: 0 }}>
              {items.map((it, i) => (
                <div key={i} className="row gap-12" style={{
                  padding: '12px 0',
                  borderTop: i === 0 ? 'none' : '0.5px solid var(--line)',
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 7,
                    border: '1.5px solid ' + (it.done ? 'var(--green)' : 'var(--line)'),
                    background: it.done ? 'var(--green)' : 'transparent',
                    display: 'grid', placeItems: 'center',
                    color: 'var(--paper)', fontSize: 12, flexShrink: 0,
                  }}>{it.done && '✓'}</div>
                  <div className="col grow">
                    <span style={{
                      fontSize: 13.5,
                      textDecoration: it.done ? 'line-through' : 'none',
                      color: it.done ? 'var(--muted)' : 'var(--ink)',
                    }}>{it.txt}</span>
                    {it.sub && <span style={{ fontSize: 10.5, color: 'var(--muted-2)', marginTop: 2 }}>{it.sub}</span>}
                  </div>
                </div>
              ))}
              <button className="btn ghost" style={{
                marginTop: 8, padding: '10px', justifyContent: 'flex-start',
                fontSize: 12.5, color: 'var(--green)', gap: 8,
              }}>
                {React.cloneElement(Icons.plus, { style: { width: 16, height: 16 } })} pridať položku
              </button>
            </div>
          </div>
        )}

        {!cat && (
          <div className="handwritten" style={{ marginTop: 22, textAlign: 'center', fontSize: 17 }}>
            ťukni kategóriu pre zoznam
          </div>
        )}
      </div>
    </>
  );
};

Object.assign(window, { Bucket });
