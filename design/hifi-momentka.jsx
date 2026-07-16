// MOMENTKA ADD + EDIT — lightweight sheet for everyday micro-notes

const MOMENTKA_SEEDS = ['road', 'cafe', 'home', 'picnic', 'city', 'forest'];

const mkInput = {
  width: '100%', font: 'inherit', fontSize: 15, color: 'var(--ink)',
  background: 'var(--surface)', border: '0.5px solid var(--line)',
  borderRadius: 12, padding: '13px 14px', outline: 'none',
};

const MomentkaEdit = ({ note, onBack, onSave, onDelete }) => {
  const edit = !!note;
  const [text, setText] = React.useState(edit ? note.text : '');
  const [seed, setSeed] = React.useState(edit ? (note.seed || null) : null);
  const [who, setWho] = React.useState(edit ? note.who : 'spolu');
  const [date, setDate] = React.useState(edit ? note.dateShort : formatShortSk(TODAY));

  const canSave = text.trim().length > 0;
  const attach = () => setSeed(MOMENTKA_SEEDS[Math.floor(Math.random() * MOMENTKA_SEEDS.length)]);
  const save = () => {
    if (!canSave) return;
    onSave({ text: text.trim(), seed, who, dateShort: date.trim() || formatShortSk(TODAY) });
  };

  return (
    <div className="col" style={{ height: '100%', background: 'var(--paper)' }}>
      <div className="app-header" style={{ paddingBottom: 12 }}>
        <div className="col" style={{ minWidth: 0 }}>
          <div className="eyebrow">{edit ? 'uprav chvíľku' : 'zachyť chvíľku'}</div>
          <h1>{edit ? 'upraviť chvíľku' : 'nová chvíľka'}</h1>
        </div>
        <div className="actions">
          <button className="icon-btn" onClick={onBack}>{Icons.close}</button>
        </div>
      </div>

      <div className="scroll" style={{ flex: 1 }}>
        {/* Photo (optional) */}
        {seed ? (
          <div style={{ position: 'relative', marginBottom: 18 }}>
            <Photo seed={seed} style={{ height: 150, borderRadius: 16 }} />
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 16,
              background: 'linear-gradient(transparent 45%, rgba(0,0,0,0.4))',
            }} />
            <div className="row gap-8" style={{ position: 'absolute', bottom: 12, right: 12 }}>
              <button className="btn" onClick={attach} style={{
                padding: '8px 12px', gap: 6, fontSize: 12.5, background: 'rgba(250,250,247,0.94)',
                backdropFilter: 'blur(8px)', border: 'none', color: 'var(--ink)',
              }}>{React.cloneElement(Icons.img, { style: { width: 15, height: 15 } })} zmeniť</button>
              <button className="btn" onClick={() => setSeed(null)} style={{
                padding: '8px 12px', gap: 6, fontSize: 12.5, background: 'rgba(250,250,247,0.94)',
                backdropFilter: 'blur(8px)', border: 'none', color: 'var(--ink)',
              }}>{React.cloneElement(Icons.trash, { style: { width: 15, height: 15 } })} odstrániť</button>
            </div>
          </div>
        ) : (
          <button onClick={attach} style={{
            width: '100%', border: '1.5px dashed var(--green-line)', borderRadius: 16,
            background: 'var(--green-soft)', padding: '16px', marginBottom: 18,
            display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
            font: 'inherit', textAlign: 'left',
          }}>
            <span style={{
              width: 38, height: 38, borderRadius: '50%', background: 'var(--green)',
              display: 'grid', placeItems: 'center', color: 'var(--paper)', flexShrink: 0,
            }}>{React.cloneElement(Icons.img, { style: { width: 19, height: 19 } })}</span>
            <div className="col" style={{ gap: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--green-deep)' }}>Pridať fotku</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>nepovinné · stačí aj pár slov</div>
            </div>
          </button>
        )}

        {/* Text */}
        <div className="eyebrow" style={{ marginBottom: 10 }}>čo sa stalo</div>
        <textarea value={text} onChange={e => setText(e.target.value)} autoFocus rows={3}
          placeholder="napr. zmokli sme cestou z obchodu…"
          style={{ ...mkInput, resize: 'none', lineHeight: 1.5, marginBottom: 18 }} />

        {/* Date */}
        <div className="eyebrow" style={{ marginBottom: 10 }}>kedy</div>
        <div style={{ position: 'relative', marginBottom: 18 }}>
          <span style={{
            position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--muted-2)', display: 'grid', placeItems: 'center', pointerEvents: 'none',
          }}>{React.cloneElement(Icons.cal, { style: { width: 18, height: 18 } })}</span>
          <input value={date} onChange={e => setDate(e.target.value)}
            placeholder="dátum" style={{ ...mkInput, paddingLeft: 42 }} />
        </div>

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

        {edit && (
          <button className="btn" onClick={onDelete} style={{
            width: '100%', padding: '12px', gap: 8, color: '#a4443a',
            borderColor: 'rgba(164,68,58,0.25)', background: 'rgba(164,68,58,0.06)',
          }}>{React.cloneElement(Icons.trash, { style: { width: 16, height: 16 } })} zmazať chvíľku</button>
        )}

        <div className="handwritten" style={{ marginTop: 20, textAlign: 'center', fontSize: 17, color: 'var(--muted)' }}>
          {edit ? 'aj drobnosti sa rátajú ✎' : 'obyčajný deň, pekná spomienka ♡'}
        </div>
      </div>

      <div style={{
        padding: '14px 20px calc(14px + env(safe-area-inset-bottom))',
        borderTop: '0.5px solid var(--line)', background: 'var(--paper)',
      }}>
        <button className="btn primary" disabled={!canSave} onClick={save}
          style={{ width: '100%', padding: '15px', fontSize: 15,
            opacity: canSave ? 1 : 0.45, cursor: canSave ? 'pointer' : 'default' }}>
          {edit ? 'uložiť zmeny' : 'uložiť chvíľku'}
        </button>
      </div>
    </div>
  );
};

Object.assign(window, { MomentkaEdit });
