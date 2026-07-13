// CALENDAR — "dôležité dni" overlay (from Home calendar icon)

const SK_MONTHS = ['január', 'február', 'marec', 'apríl', 'máj', 'jún',
  'júl', 'august', 'september', 'október', 'november', 'december'];
const SK_DOW = ['po', 'ut', 'st', 'št', 'pi', 'so', 'ne'];

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// Build the list of important dated events.
const buildEvents = () => {
  const ev = [];

  // Recurring anniversary (21 Jan), a few years around now
  const y0 = TOGETHER_SINCE.getFullYear();
  for (let y = y0 + 1; y <= TODAY.getFullYear() + 2; y++) {
    ev.push({
      date: new Date(y, 0, 21),
      title: `${y - y0}. výročie`,
      kind: 'anniv', icon: '♥',
    });
  }

  // Day milestones (e.g. 1000 dní)
  [500, 750, 1000, 1500].forEach(n => {
    ev.push({
      date: new Date(TOGETHER_SINCE.getTime() + n * 86400000),
      title: `${n.toLocaleString('sk-SK')} dní spolu`,
      kind: 'milestone', icon: '✦',
    });
  });

  // Capsule unlocks
  CAPSULES.forEach(c => ev.push({
    date: c.unlock,
    title: c.title,
    sub: `kapsula · vložil/a ${c.by}`,
    kind: 'capsule', icon: '🔒',
  }));

  return ev.sort((a, b) => a.date - b.date);
};

const KIND_COLOR = {
  anniv: 'var(--green)',
  milestone: '#b85a1b',
  capsule: 'var(--green-deep)',
  plan: '#2a6f8a',
  date: '#a13d6d',
};

const Calendar = ({ onBack, navigate }) => {
  const baseEvents = React.useMemo(buildEvents, []);
  const [custom, setCustom] = React.useState([]);
  const [adding, setAdding] = React.useState(false);
  const events = React.useMemo(
    () => [...baseEvents, ...custom].sort((a, b) => a.date - b.date),
    [baseEvents, custom]
  );
  const [cursor, setCursor] = React.useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const [selected, setSelected] = React.useState(TODAY);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  // Build the grid (Mon-first)
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // 0 = Monday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsOn = (d) => events.filter(e => sameDay(e.date, d));
  const monthEvents = events.filter(e => e.date.getFullYear() === year && e.date.getMonth() === month);
  const upcoming = events.filter(e => e.date >= TODAY).slice(0, 5);
  const selectedEvents = eventsOn(selected);

  const shift = (delta) => setCursor(new Date(year, month + delta, 1));

  return (
    <div className="col" style={{ height: '100%', background: 'var(--paper)' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '54px 16px 8px', flexShrink: 0,
      }}>
        <button className="icon-btn" onClick={onBack} style={{ flexShrink: 0 }}>{Icons.back}</button>
        <div className="col grow" style={{ minWidth: 0 }}>
          <div className="eyebrow">naše míľniky</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>dôležité dni</div>
        </div>
        <button className="icon-btn green" onClick={() => setAdding(true)} style={{ flexShrink: 0 }}>{Icons.plus}</button>
      </div>

      <div className="scroll" style={{ flex: 1 }}>
        {/* Month switcher */}
        <div className="row between" style={{ alignItems: 'center', marginBottom: 12 }}>
          <button className="icon-btn" onClick={() => shift(-1)} style={{ width: 34, height: 34 }}>
            {React.cloneElement(Icons.back, { style: { width: 18, height: 18 } })}
          </button>
          <div className="col" style={{ alignItems: 'center' }}>
            <div className="serif" style={{ fontSize: 22, fontWeight: 600, textTransform: 'capitalize' }}>
              {SK_MONTHS[month]}
            </div>
            <div className="eyebrow">{year}</div>
          </div>
          <button className="icon-btn" onClick={() => shift(1)} style={{ width: 34, height: 34 }}>
            {React.cloneElement(Icons.arrow, { style: { width: 18, height: 18 } })}
          </button>
        </div>

        {/* Weekday header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
          {SK_DOW.map(d => (
            <div key={d} className="eyebrow" style={{ textAlign: 'center', fontSize: 10 }}>{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 20 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const evs = eventsOn(d);
            const isToday = sameDay(d, TODAY);
            const isSel = sameDay(d, selected);
            return (
              <button key={i} onClick={() => setSelected(d)} style={{
                aspectRatio: '1', borderRadius: 10, border: 'none', cursor: 'pointer',
                font: 'inherit', position: 'relative',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                background: isSel ? 'var(--green)' : (isToday ? 'var(--green-soft)' : 'transparent'),
                color: isSel ? 'var(--paper)' : (isToday ? 'var(--green-deep)' : 'var(--ink)'),
                fontWeight: (isToday || isSel) ? 600 : 400, fontSize: 13,
              }}>
                {d.getDate()}
                <div style={{ display: 'flex', gap: 2, height: 4 }}>
                  {evs.slice(0, 3).map((e, j) => (
                    <span key={j} style={{
                      width: 4, height: 4, borderRadius: '50%',
                      background: isSel ? 'var(--paper)' : KIND_COLOR[e.kind],
                    }} />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected-day detail */}
        {selectedEvents.length > 0 && (
          <div className="card tint" style={{ padding: 14, marginBottom: 20 }}>
            <div className="eyebrow" style={{ color: 'var(--green)', marginBottom: 8 }}>
              {selected.getDate()}. {SK_MONTHS[selected.getMonth()]} {selected.getFullYear()}
            </div>
            <div className="col gap-8">
              {selectedEvents.map((e, i) => (
                <div key={i} className="row gap-10" style={{ alignItems: 'center' }}>
                  <span style={{ fontSize: 18 }}>{e.icon}</span>
                  <div className="col">
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{e.title}</div>
                    {e.sub && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{e.sub}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming list */}
        <div className="row between" style={{ marginBottom: 10 }}>
          <div className="handwritten" style={{ fontSize: 22 }}>Čoskoro</div>
          <span className="eyebrow">najbližších {upcoming.length}</span>
        </div>
        <div className="col gap-8">
          {upcoming.map((e, i) => {
            const days = Math.ceil((e.date - TODAY) / 86400000);
            const clickable = e.kind === 'capsule';
            return (
              <button key={i}
                onClick={clickable ? () => { onBack(); navigate('capsule'); } : undefined}
                className="row gap-12" style={{
                  width: '100%', padding: '12px 14px', alignItems: 'center', textAlign: 'left',
                  background: 'var(--surface)', border: '0.5px solid var(--line)',
                  borderRadius: 12, font: 'inherit', color: 'inherit',
                  cursor: clickable ? 'pointer' : 'default',
                }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--green-soft)', color: KIND_COLOR[e.kind], lineHeight: 1,
                }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{e.date.getDate()}</span>
                  <span style={{ fontSize: 8.5, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                    {SK_MONTHS[e.date.getMonth()].slice(0, 3)}
                  </span>
                </div>
                <div className="col grow" style={{ minWidth: 0, gap: 2 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{e.icon} {e.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                    {days === 0 ? 'dnes' : days === 1 ? 'zajtra' : `o ${days} dní`}
                    {e.sub ? ` · ${e.sub}` : ''}
                  </div>
                </div>
                {clickable && <span style={{ color: 'var(--muted-2)', flexShrink: 0 }}>{Icons.arrow}</span>}
              </button>
            );
          })}
        </div>

        <div className="handwritten" style={{ textAlign: 'center', margin: '22px 0', fontSize: 16, color: 'var(--muted)' }}>
          každý deň sa ráta ♡
        </div>
      </div>

      {adding && (
        <EventAdd
          initial={selected}
          onClose={() => setAdding(false)}
          onSave={(e) => {
            setCustom(c => [...c, e]);
            setCursor(new Date(e.date.getFullYear(), e.date.getMonth(), 1));
            setSelected(e.date);
            setAdding(false);
          }}
        />
      )}
    </div>
  );
};

/* ---------- Add custom event ---------- */
const calInput = {
  width: '100%', font: 'inherit', fontSize: 15, color: 'var(--ink)',
  background: 'var(--surface)', border: '0.5px solid var(--line)',
  borderRadius: 12, padding: '13px 14px', outline: 'none',
};

const pad2 = (n) => String(n).padStart(2, '0');
const toInputDate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const EVENT_KINDS = [
  { kind: 'anniv', icon: '♥', label: 'Výročie' },
  { kind: 'milestone', icon: '✦', label: 'Míľnik' },
  { kind: 'plan', icon: '✈', label: 'Plán / cesta' },
  { kind: 'date', icon: '🍽', label: 'Rande' },
];

const EventAdd = ({ initial, onClose, onSave }) => {
  const startDate = initial && initial >= TODAY ? initial : TODAY;
  const [title, setTitle] = React.useState('');
  const [dateStr, setDateStr] = React.useState(toInputDate(startDate));
  const [icon, setIcon] = React.useState('✈');
  const [kind, setKind] = React.useState('plan');
  const [note, setNote] = React.useState('');

  const parsed = (() => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return (y && m && d) ? new Date(y, m - 1, d) : null;
  })();
  const future = parsed && parsed >= new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
  const canSave = title.trim() && parsed && future;

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
        maxHeight: '90%', display: 'flex', flexDirection: 'column',
        animation: 'slideUp 300ms ease both',
      }}>
        <div style={{
          width: 38, height: 4, borderRadius: 999, background: 'var(--line)',
          margin: '4px auto 12px',
        }} />
        <div className="row between" style={{ alignItems: 'baseline', marginBottom: 4 }}>
          <div className="col">
            <div className="eyebrow" style={{ color: 'var(--green)' }}>do budúcna</div>
            <div style={{ fontSize: 17, fontWeight: 500 }}>Nová udalosť</div>
          </div>
          <button className="icon-btn" onClick={onClose}>
            {React.cloneElement(Icons.close, { style: { width: 18, height: 18 } })}
          </button>
        </div>

        <div className="scroll" style={{ flex: 1, minHeight: 0, margin: '10px -20px 0', padding: '0 20px' }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>názov</div>
          <input value={title} onChange={e => setTitle(e.target.value)} autoFocus
            placeholder="napr. Víkend v Chorvátsku"
            style={{ ...calInput, marginBottom: 18 }} />

          <div className="eyebrow" style={{ marginBottom: 10 }}>dátum</div>
          <input type="date" value={dateStr} min={toInputDate(TODAY)}
            onChange={e => setDateStr(e.target.value)}
            style={{ ...calInput, marginBottom: parsed && !future ? 8 : 18 }} />
          {parsed && !future && (
            <div style={{ fontSize: 11.5, color: '#b0402a', marginBottom: 14 }}>
              vyber dátum v budúcnosti
            </div>
          )}

          <div className="eyebrow" style={{ marginBottom: 10 }}>typ</div>
          <div className="row gap-8 wrap" style={{ marginBottom: 18 }}>
            {EVENT_KINDS.map(k => (
              <button key={k.kind} onClick={() => { setKind(k.kind); setIcon(k.icon); }}
                className="row gap-6" style={{
                  padding: '9px 13px', borderRadius: 999, cursor: 'pointer', font: 'inherit',
                  alignItems: 'center', fontSize: 13,
                  background: kind === k.kind ? 'var(--green)' : 'var(--surface)',
                  color: kind === k.kind ? 'var(--paper)' : 'var(--ink)',
                  border: '0.5px solid ' + (kind === k.kind ? 'var(--green)' : 'var(--line)'),
                }}>
                <span style={{ fontSize: 15 }}>{k.icon}</span>{k.label}
              </button>
            ))}
          </div>

          <div className="eyebrow" style={{ marginBottom: 10 }}>poznámka <span style={{ textTransform: 'none', letterSpacing: 0, color: 'var(--muted-2)' }}>· volitelné</span></div>
          <input value={note} onChange={e => setNote(e.target.value)}
            placeholder="krátka poznámka…"
            style={{ ...calInput, marginBottom: 6 }} />
        </div>

        <button className="btn primary" disabled={!canSave}
          onClick={() => onSave({
            date: parsed, title: title.trim(),
            sub: note.trim() || undefined, kind, icon, custom: true,
          })}
          style={{ width: '100%', marginTop: 14, padding: '15px', fontSize: 15,
            opacity: canSave ? 1 : 0.45, cursor: canSave ? 'pointer' : 'default' }}>
          pridať udalosť
        </button>
      </div>
    </div>
  );
};

Object.assign(window, { Calendar, EventAdd });
