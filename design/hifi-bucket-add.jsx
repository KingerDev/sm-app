// BUCKET ADD — overlay sheet for creating a new bucket list (category)

const NEW_ICONS = ['✈', '◉', '★', '♡', '✿', '☕', '⛰', '♪', '⚑', '✦', '☀', '⚓'];

const inputBase = {
  width: '100%',
  font: 'inherit',
  fontSize: 15,
  color: 'var(--ink)',
  background: 'var(--surface)',
  border: '0.5px solid var(--line)',
  borderRadius: 12,
  padding: '13px 14px',
  outline: 'none',
};

const BucketAdd = ({ onBack }) => {
  const [icon, setIcon] = React.useState('✈');
  const [name, setName] = React.useState('');
  const [items, setItems] = React.useState(['', '']);

  const setItem = (i, v) => setItems(items.map((it, j) => (j === i ? v : it)));
  const addItem = () => setItems([...items, '']);
  const removeItem = (i) => setItems(items.filter((_, j) => j !== i));

  const canSave = name.trim().length > 0;

  return (
    <div className="col" style={{ height: '100%', background: 'var(--paper)' }}>
      {/* Header */}
      <div className="app-header" style={{ paddingBottom: 12 }}>
        <div className="col" style={{ minWidth: 0 }}>
          <div className="eyebrow">nový zoznam snov</div>
          <h1>nový bucket list</h1>
        </div>
        <div className="actions">
          <button className="icon-btn" onClick={onBack}>{Icons.close}</button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="scroll" style={{ flex: 1 }}>
        {/* Preview card */}
        <div className="card" style={{
          padding: 16, display: 'flex', gap: 12, alignItems: 'center',
          marginBottom: 20,
        }}>
          <div style={{
            fontSize: 26, width: 48, height: 48, borderRadius: 14,
            background: 'var(--green-soft)', color: 'var(--green)',
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>{icon}</div>
          <div className="col grow" style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 16, fontWeight: 500,
              color: name.trim() ? 'var(--ink)' : 'var(--muted-2)',
            }}>{name.trim() || 'Názov zoznamu'}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              {items.filter(i => i.trim()).length} snov na začiatok
            </div>
          </div>
        </div>

        {/* Icon picker */}
        <div className="eyebrow" style={{ marginBottom: 10 }}>ikonka</div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8,
          marginBottom: 22,
        }}>
          {NEW_ICONS.map(ic => (
            <button key={ic}
              onClick={() => setIcon(ic)}
              style={{
                aspectRatio: '1', borderRadius: 12, cursor: 'pointer',
                fontSize: 20, font: 'inherit',
                display: 'grid', placeItems: 'center',
                background: icon === ic ? 'var(--green)' : 'var(--surface)',
                color: icon === ic ? 'var(--paper)' : 'var(--ink-soft)',
                border: '0.5px solid ' + (icon === ic ? 'var(--green)' : 'var(--line)'),
              }}>{ic}</button>
          ))}
        </div>

        {/* Name field */}
        <div className="eyebrow" style={{ marginBottom: 10 }}>názov</div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="napr. Cestovanie, Jedlo, My dvaja…"
          style={{ ...inputBase, marginBottom: 22 }}
        />

        {/* First items */}
        <div className="row between" style={{ marginBottom: 10, alignItems: 'baseline' }}>
          <div className="eyebrow">prvé sny</div>
          <span style={{ fontSize: 11, color: 'var(--muted-2)' }}>voliteľné</span>
        </div>
        <div className="col" style={{ gap: 8 }}>
          {items.map((it, i) => (
            <div key={i} className="row gap-8" style={{ alignItems: 'center' }}>
              <div style={{
                width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                border: '1.5px solid var(--line)', background: 'transparent',
              }} />
              <input
                value={it}
                onChange={(e) => setItem(i, e.target.value)}
                placeholder={'sen č. ' + (i + 1)}
                style={{ ...inputBase, fontSize: 14, padding: '11px 13px' }}
              />
              {items.length > 1 && (
                <button className="btn ghost" style={{ padding: 6, color: 'var(--muted-2)' }}
                  onClick={() => removeItem(i)}>
                  {React.cloneElement(Icons.close, { style: { width: 16, height: 16 } })}
                </button>
              )}
            </div>
          ))}
          <button className="btn ghost" style={{
            marginTop: 4, padding: '10px', justifyContent: 'flex-start',
            fontSize: 12.5, color: 'var(--green)', gap: 8,
          }} onClick={addItem}>
            {React.cloneElement(Icons.plus, { style: { width: 16, height: 16 } })} pridať ďalší
          </button>
        </div>

        <div className="handwritten" style={{
          marginTop: 22, textAlign: 'center', fontSize: 17, color: 'var(--muted)',
        }}>
          sny sa plnia ľahšie, keď sú zapísané ✎
        </div>
      </div>

      {/* Sticky footer */}
      <div style={{
        padding: '14px 20px calc(14px + env(safe-area-inset-bottom))',
        borderTop: '0.5px solid var(--line)',
        background: 'var(--paper)',
      }}>
        <button
          className="btn primary"
          disabled={!canSave}
          onClick={onBack}
          style={{
            width: '100%', padding: '15px', fontSize: 15,
            opacity: canSave ? 1 : 0.45,
            cursor: canSave ? 'pointer' : 'default',
          }}>
          vytvoriť zoznam
        </button>
      </div>
    </div>
  );
};

Object.assign(window, { BucketAdd });
