// ČASOVÁ KAPSULA — screen + dáta

// Anniversary date for unlock semantics
const CAPSULES = [
  {
    id: 'first-anniv',
    title: 'List pre 1. výročie',
    by: 'M',
    created: new Date('2024-12-20'),
    unlock: new Date('2025-01-21'),
    contains: { letter: true, photos: 5 },
    seed: 'cafe',
    note: 'Napísala som ti list ešte počas zimy. Otvor ho 21. januára.',
    preview: 'Drahý S, ak toto čítaš, prešiel rok. Pamätám si presne ten večer keď...',
  },
  {
    id: 'second-anniv',
    title: 'Fotky + zvuk pre 2. výročie',
    by: 'S',
    created: new Date('2025-08-14'),
    unlock: new Date('2026-01-21'),
    contains: { letter: true, photos: 12, audio: '1:24' },
    seed: 'home',
    note: 'Pesnička, ktorú sme si vtedy púšťali, a 12 fotiek z prvých dní.',
    preview: '12 fotiek z jari 2024, hlasovka 1:24 a list — všetko ti dnes dávam naraz.',
  },
  {
    id: 'tatry-future',
    title: 'Tatry — ako sme ich pamätali',
    by: 'spolu',
    created: new Date('2026-02-12'),
    unlock: new Date('2027-02-12'),
    contains: { letter: true, photos: 8 },
    seed: 'ski',
    note: 'Píšeme si dnes, ako sa cítime po Tatrách. Otvoríme o rok.',
  },
  {
    id: 'third-anniv',
    title: 'List pre 3. výročie',
    by: 'M',
    created: new Date('2026-03-30'),
    unlock: new Date('2027-01-21'),
    contains: { letter: true, photos: 3 },
    seed: 'forest',
    note: 'Tri veci, čo ťa na mne dnes prekvapujú.',
  },
  {
    id: 'fifth-anniv',
    title: 'Pre nás o päť rokov',
    by: 'spolu',
    created: new Date('2026-04-21'),
    unlock: new Date('2029-01-21'),
    contains: { letter: true, photos: 20, audio: '3:00' },
    seed: 'beach',
    note: 'Veľká kapsula. Spolu sme tam dali sny, fotky a 3 minútovú hlasovku.',
  },
];

const daysUntil = (date) => Math.max(0, Math.ceil((date - TODAY) / 86400000));
const formatDateSk = (d) => {
  const months = ['januára', 'februára', 'marca', 'apríla', 'mája', 'júna',
    'júla', 'augusta', 'septembra', 'októbra', 'novembra', 'decembra'];
  return `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const Capsule = ({ onBack }) => {
  const [sheet, setSheet] = React.useState(null); // 'add'
  const [detail, setDetail] = React.useState(null); // capsule object
  const enriched = CAPSULES.map(c => ({
    ...c,
    daysLeft: daysUntil(c.unlock),
    isLocked: c.unlock > TODAY,
  }));
  const locked = enriched.filter(c => c.isLocked).sort((a, b) => a.unlock - b.unlock);
  const opened = enriched.filter(c => !c.isLocked).sort((a, b) => b.unlock - a.unlock);
  const next = locked[0];

  return (
    <>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '54px 16px 8px',
        display: 'flex', justifyContent: 'space-between',
        zIndex: 10, pointerEvents: 'none',
      }}>
        <button className="icon-btn" style={{
          pointerEvents: 'auto',
          background: 'rgba(250, 250, 247, 0.9)',
          backdropFilter: 'blur(8px)',
        }} onClick={onBack}>{Icons.back}</button>
        <button className="icon-btn green" style={{ pointerEvents: 'auto' }} onClick={() => setSheet('add')}>{Icons.plus}</button>
      </div>

      <div className="scroll no-pad-top" style={{ paddingTop: 50 }}>
        <div style={{ paddingLeft: 40 }}>
          <AppHeader
            eyebrow="vašu budúcnosť dnes"
            title="časová kapsula"
          />
        </div>

        {/* Hero — next unlock countdown */}
        {next && (
          <div className="card hero" style={{
            padding: 20,
            background: 'linear-gradient(165deg, #1f3f2b 0%, #2d5a3d 60%, #b85a1b 200%)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* decorative stars */}
            <svg viewBox="0 0 100 100" style={{ position: 'absolute', top: -10, right: -10, width: 120, height: 120, opacity: 0.18 }}>
              <circle cx="20" cy="20" r="1.5" fill="white" />
              <circle cx="60" cy="35" r="1" fill="white" />
              <circle cx="85" cy="60" r="1.5" fill="white" />
              <circle cx="30" cy="70" r="0.8" fill="white" />
              <circle cx="75" cy="15" r="2" fill="white" />
              <path d="M50 50 l1 -3 l1 3 l3 1 l-3 1 l-1 3 l-1 -3 l-3 -1 z" fill="white" />
            </svg>

            <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>
              najbližšia kapsula
            </div>
            <div className="num" style={{ fontSize: 80, color: 'var(--paper)', lineHeight: 0.9, marginTop: 6 }}>
              {next.daysLeft}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: -2 }}>
              dní do odomknutia
            </div>
            <div className="divider" style={{ background: 'rgba(255,255,255,0.2)', margin: '14px 0' }} />
            <div className="col gap-4">
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--paper)' }}>
                {next.title}
              </div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.75)' }}>
                otvorí sa {formatDateSk(next.unlock)} · vložila {next.by}
              </div>
            </div>
          </div>
        )}

        {/* Section: Opened */}
        {opened.length > 0 && (
          <>
            <div className="row between" style={{ margin: '24px 0 10px' }}>
              <div className="handwritten" style={{ fontSize: 22 }}>
                ✓ otvorené ({opened.length})
              </div>
              <span className="eyebrow">prečítané spolu</span>
            </div>
            <div className="col gap-10">
              {opened.map(c => <OpenedCapsule key={c.id} capsule={c} onOpen={() => setDetail(c)} />)}
            </div>
          </>
        )}

        {/* Section: Locked (queue) */}
        {locked.length > 0 && (
          <>
            <div className="row between" style={{ margin: '24px 0 10px' }}>
              <div className="handwritten" style={{ fontSize: 22 }}>
                🔒 zapečatené ({locked.length})
              </div>
              <span className="eyebrow">trpezlivosť</span>
            </div>
            <div className="col gap-10">
              {locked.map(c => <LockedCapsule key={c.id} capsule={c} onOpen={() => setDetail(c)} />)}
            </div>
          </>
        )}

        {/* New capsule CTA */}
        <div className="card tint" style={{ marginTop: 24, padding: 18 }}>
          <div className="row between" style={{ alignItems: 'flex-start' }}>
            <div className="col gap-4 grow">
              <div className="eyebrow" style={{ color: 'var(--green)' }}>nová kapsula</div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>Napíš list pre svoje budúce ja</div>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                Pridaj list, fotky, hlasovku. Vyber dátum, kedy sa otvorí.
              </div>
            </div>
            <button className="icon-btn green" style={{ flexShrink: 0 }} onClick={() => setSheet('add')}>{Icons.plus}</button>
          </div>
          <div className="row gap-6 wrap" style={{ marginTop: 12 }}>
            <span className="chip soft">na výročie</span>
            <span className="chip soft">o rok</span>
            <span className="chip soft">o 5 rokov</span>
            <span className="chip soft">vlastný dátum</span>
          </div>
        </div>

        <div className="handwritten" style={{
          textAlign: 'center', marginTop: 22, fontSize: 16,
          color: 'var(--muted)', lineHeight: 1.4,
        }}>
          kapsula je sľub<br />„toto si prečítame neskôr"
        </div>
      </div>

      {sheet === 'add' && <CapsuleAdd onClose={() => setSheet(null)} />}
      {detail && <CapsuleDetail capsule={detail} onClose={() => setDetail(null)} />}
    </>
  );
};

const LockedCapsule = ({ capsule: c, onOpen }) => (
  <button className="card flush" onClick={onOpen} style={{
    position: 'relative',
    display: 'flex',
    border: '0.5px solid var(--line)',
    width: '100%', textAlign: 'left', cursor: 'pointer',
    font: 'inherit', color: 'inherit', padding: 0, overflow: 'hidden',
  }}>
    {/* Blurred photo strip on left */}
    <div style={{
      width: 88, position: 'relative', overflow: 'hidden',
      borderRadius: 'var(--r-md) 0 0 var(--r-md)',
    }}>
      <Photo seed={c.seed} style={{
        width: '100%', height: '100%',
        filter: 'blur(8px) saturate(0.7)',
        transform: 'scale(1.15)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(31, 63, 43, 0.4), rgba(31, 63, 43, 0.7))',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'grid', placeItems: 'center',
      }}>
        <svg viewBox="0 0 24 24" style={{ width: 28, height: 28, fill: 'var(--paper)' }}>
          <path d="M6 10V7a6 6 0 0 1 12 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1zm2 0h8V7a4 4 0 1 0-8 0v3z" />
        </svg>
      </div>
    </div>
    {/* Content */}
    <div className="col grow" style={{ padding: 12, gap: 6 }}>
      <div className="row between">
        <span className="eyebrow" style={{ color: 'var(--green)' }}>{c.daysLeft} dní</span>
        <span className="eyebrow" style={{ fontSize: 9 }}>vložil/a {c.by}</span>
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 500 }}>{c.title}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)' }}>
        odomkne sa {formatDateSk(c.unlock)}
      </div>
      <div className="row gap-6" style={{ marginTop: 2 }}>
        {c.contains.letter && <span className="chip" style={{ fontSize: 9.5, padding: '2px 7px' }}>✉ list</span>}
        {c.contains.photos > 0 && <span className="chip" style={{ fontSize: 9.5, padding: '2px 7px' }}>📷 {c.contains.photos}</span>}
        {c.contains.audio && <span className="chip" style={{ fontSize: 9.5, padding: '2px 7px' }}>🎙 {c.contains.audio}</span>}
      </div>
    </div>
  </button>
);

const OpenedCapsule = ({ capsule: c, onOpen }) => (
  <button className="card flush" onClick={onOpen} style={{
    border: '0.5px solid var(--line)',
    width: '100%', textAlign: 'left', cursor: 'pointer',
    font: 'inherit', color: 'inherit', padding: 0, overflow: 'hidden', display: 'block',
  }}>
    <div style={{ position: 'relative' }}>
      <Photo seed={c.seed} style={{ height: 110, borderRadius: 0 }} />
      <div style={{
        position: 'absolute', top: 10, left: 10,
        background: 'rgba(45, 90, 61, 0.92)', color: 'var(--paper)',
        padding: '3px 9px', borderRadius: 999, fontSize: 10,
        fontWeight: 500, letterSpacing: 0.3,
      }}>
        ✓ otvorené {formatDateSk(c.unlock)}
      </div>
    </div>
    <div className="col gap-6" style={{ padding: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 500 }}>{c.title}</div>
      {c.preview && (
        <div style={{
          fontSize: 12, fontStyle: 'italic', lineHeight: 1.5,
          color: 'var(--ink-soft)',
          paddingLeft: 10, borderLeft: '2px solid var(--green-line)',
        }}>
          „{c.preview}"
        </div>
      )}
      <div className="row between" style={{ marginTop: 2 }}>
        <div className="row gap-4">
          {c.contains.letter && <span style={{ fontSize: 10, color: 'var(--muted)' }}>✉ list</span>}
          {c.contains.photos > 0 && <span style={{ fontSize: 10, color: 'var(--muted)' }}>· 📷 {c.contains.photos}</span>}
          {c.contains.audio && <span style={{ fontSize: 10, color: 'var(--muted)' }}>· 🎙 {c.contains.audio}</span>}
        </div>
        <span className="eyebrow" style={{ fontSize: 9, color: 'var(--green)' }}>otvoriť →</span>
      </div>
    </div>
  </button>
);

/* ---------- Capsule detail ---------- */
const CapsuleDetail = ({ capsule: c, onClose }) => {
  const locked = c.unlock > TODAY;
  const daysLeft = daysUntil(c.unlock);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 30,
      background: locked ? '#1f3f2b' : 'var(--paper)',
      display: 'flex', flexDirection: 'column',
      animation: 'slideUp 320ms ease both',
      color: locked ? 'var(--paper)' : 'var(--ink)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '54px 16px 12px', flexShrink: 0,
      }}>
        <button className="icon-btn" onClick={onClose} style={{
          flexShrink: 0,
          background: locked ? 'rgba(255,255,255,0.15)' : 'var(--surface)',
          border: locked ? 'none' : '0.5px solid var(--line)',
          color: locked ? 'var(--paper)' : 'var(--ink)',
        }}>{Icons.back}</button>
        <div className="col grow" style={{ minWidth: 0 }}>
          <div className="eyebrow" style={{ color: locked ? 'rgba(255,255,255,0.7)' : 'var(--muted)' }}>
            {locked ? 'zapečatené' : '✓ otvorené ' + formatDateSk(c.unlock)}
          </div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{c.title}</div>
        </div>
      </div>

      {locked ? (
        /* ---- Locked state ---- */
        <div className="col" style={{ flex: 1, padding: '0 24px', justifyContent: 'center', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
          <svg viewBox="0 0 24 24" style={{ width: 44, height: 44, fill: 'rgba(255,255,255,0.9)', marginBottom: 20 }}>
            <path d="M6 10V7a6 6 0 0 1 12 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1zm2 0h8V7a4 4 0 1 0-8 0v3z" />
          </svg>
          <div className="num" style={{ fontSize: 88, lineHeight: 0.9, color: 'var(--paper)' }}>{daysLeft}</div>
          <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>dní do odomknutia</div>
          <div style={{ fontSize: 12.5, opacity: 0.7, marginTop: 16, lineHeight: 1.5, maxWidth: 260 }}>
            Otvorí sa {formatDateSk(c.unlock)}. Vložila {c.by}.
          </div>
          {c.note && (
            <div style={{
              marginTop: 24, padding: '14px 16px', maxWidth: 300,
              background: 'rgba(255,255,255,0.1)', borderRadius: 14,
              fontSize: 13, fontStyle: 'italic', lineHeight: 1.5, opacity: 0.92,
            }}>„{c.note}"</div>
          )}
          <div className="row gap-6" style={{ marginTop: 24 }}>
            {c.contains.letter && <span className="chip" style={{ background: 'rgba(255,255,255,0.15)', color: 'var(--paper)', border: 'none' }}>✉ list</span>}
            {c.contains.photos > 0 && <span className="chip" style={{ background: 'rgba(255,255,255,0.15)', color: 'var(--paper)', border: 'none' }}>📷 {c.contains.photos} fotiek</span>}
            {c.contains.audio && <span className="chip" style={{ background: 'rgba(255,255,255,0.15)', color: 'var(--paper)', border: 'none' }}>🎙 {c.contains.audio}</span>}
          </div>
          <div className="handwritten" style={{ marginTop: 28, fontSize: 17, opacity: 0.8 }}>
            ešte chvíľu počkáme ♡
          </div>
        </div>
      ) : (
        /* ---- Opened state ---- */
        <div className="scroll" style={{ flex: 1, paddingTop: 6 }}>
          <div style={{ position: 'relative', margin: '0 -20px 20px' }}>
            <Photo seed={c.seed} style={{ height: 180, borderRadius: 0 }} />
          </div>

          {c.contains.letter && (
            <div className="card" style={{ padding: 18, marginBottom: 16 }}>
              <div className="eyebrow" style={{ color: 'var(--green)', marginBottom: 10 }}>✉ list od {c.by}</div>
              <div className="serif" style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink)' }}>
                {c.preview || c.note}
              </div>
              <div className="handwritten" style={{ marginTop: 14, fontSize: 20, color: 'var(--green-deep)', textAlign: 'right' }}>
                — {c.by}
              </div>
            </div>
          )}

          {c.contains.audio && (
            <div className="card tint" style={{ padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="icon-btn green" style={{ flexShrink: 0 }}>{Icons.play}</button>
              <div className="col grow">
                <div style={{ fontSize: 13, fontWeight: 500 }}>Hlasovka</div>
                <div className="row gap-2" style={{ alignItems: 'center', marginTop: 6, height: 20 }}>
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} style={{
                      flex: 1, borderRadius: 2,
                      height: `${20 + Math.abs(Math.sin(i * 1.7)) * 70}%`,
                      background: i < 8 ? 'var(--green)' : 'var(--green-line)',
                    }} />
                  ))}
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>{c.contains.audio}</span>
            </div>
          )}

          {c.contains.photos > 0 && (
            <>
              <div className="eyebrow" style={{ marginBottom: 10 }}>📷 {c.contains.photos} fotiek z tej doby</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, marginBottom: 20 }}>
                {Array.from({ length: c.contains.photos }).map((_, i) => (
                  <Photo key={i} seed={`${c.seed}-cap-${i}`} style={{ aspectRatio: '1', borderRadius: 6 }} />
                ))}
              </div>
            </>
          )}

          <div className="handwritten" style={{ textAlign: 'center', margin: '8px 0 20px', fontSize: 18, color: 'var(--muted)' }}>
            otvorené spolu · {formatDateSk(c.unlock)} ♡
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------- Add capsule ---------- */
const capInput = {
  width: '100%', font: 'inherit', fontSize: 15, color: 'var(--ink)',
  background: 'var(--surface)', border: '0.5px solid var(--line)',
  borderRadius: 12, padding: '13px 14px', outline: 'none',
};

const CapsuleAdd = ({ onClose }) => {
  const [title, setTitle] = React.useState('');
  const [letter, setLetter] = React.useState('');
  const [by, setBy] = React.useState('spolu');
  const [when, setWhen] = React.useState('anniv');
  const [withLetter, setWithLetter] = React.useState(true);
  const [withPhotos, setWithPhotos] = React.useState(true);
  const [withAudio, setWithAudio] = React.useState(false);

  const whenOptions = [
    { id: 'anniv', label: 'na výročie', sub: '21. jan 2027' },
    { id: 'year', label: 'o rok', sub: formatDateSk(new Date(TODAY.getTime() + 365 * 86400000)) },
    { id: 'five', label: 'o 5 rokov', sub: formatDateSk(new Date(TODAY.getTime() + 5 * 365 * 86400000)) },
    { id: 'custom', label: 'vlastný dátum', sub: 'vyber v kalendári' },
  ];

  const canSave = title.trim().length > 0;

  const contentRow = (on, setOn, icon, label) => (
    <button onClick={() => setOn(!on)} className="row gap-12" style={{
      width: '100%', padding: '12px 14px', alignItems: 'center', textAlign: 'left',
      background: on ? 'var(--green-soft)' : 'var(--surface)',
      border: '0.5px solid ' + (on ? 'var(--green-line)' : 'var(--line)'),
      borderRadius: 12, cursor: 'pointer', font: 'inherit',
      color: on ? 'var(--green-deep)' : 'var(--ink)',
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span className="grow" style={{ fontSize: 13.5, fontWeight: 500 }}>{label}</span>
      <span style={{
        width: 20, height: 20, borderRadius: '50%',
        display: 'grid', placeItems: 'center', flexShrink: 0,
        background: on ? 'var(--green)' : 'transparent',
        border: '1.5px solid ' + (on ? 'var(--green)' : 'var(--line)'),
        color: 'var(--paper)',
      }}>{on && React.cloneElement(Icons.check, { style: { width: 13, height: 13 } })}</span>
    </button>
  );

  return (
    <div className="col" style={{
      position: 'absolute', inset: 0, zIndex: 30, background: 'var(--paper)',
      animation: 'slideUp 320ms ease both',
    }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 12, padding: '54px 20px 12px', flexShrink: 0,
      }}>
        <div className="col" style={{ minWidth: 0 }}>
          <div className="eyebrow">sľub do budúcna</div>
          <h1 style={{ margin: 0 }}>nová kapsula</h1>
        </div>
        <button className="icon-btn" onClick={onClose}>{Icons.close}</button>
      </div>

      <div className="scroll" style={{ flex: 1 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>názov</div>
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder="napr. List pre 3. výročie"
          style={{ ...capInput, marginBottom: 18 }} />

        <div className="eyebrow" style={{ marginBottom: 10 }}>list</div>
        <textarea value={letter} onChange={e => setLetter(e.target.value)}
          placeholder="Drahý/á… napíš, čo si dnes praješ, na čo nechceš zabudnúť."
          rows={4}
          style={{ ...capInput, resize: 'none', lineHeight: 1.6, marginBottom: 18 }} />

        <div className="eyebrow" style={{ marginBottom: 10 }}>čo pridáš</div>
        <div className="col gap-8" style={{ marginBottom: 18 }}>
          {contentRow(withLetter, setWithLetter, '✉', 'List')}
          {contentRow(withPhotos, setWithPhotos, '📷', 'Fotky')}
          {contentRow(withAudio, setWithAudio, '🎙', 'Hlasová správa')}
        </div>

        <div className="eyebrow" style={{ marginBottom: 10 }}>kto ju vkladá</div>
        <div className="row" style={{
          gap: 0, background: 'var(--surface)', border: '0.5px solid var(--line)',
          borderRadius: 12, padding: 4, marginBottom: 18,
        }}>
          {['S', 'M', 'spolu'].map(w => (
            <button key={w} onClick={() => setBy(w)} style={{
              flex: 1, padding: '9px', borderRadius: 9, font: 'inherit',
              fontSize: 13.5, fontWeight: 500, cursor: 'pointer', border: 'none',
              background: by === w ? 'var(--green)' : 'transparent',
              color: by === w ? 'var(--paper)' : 'var(--muted)',
            }}>{w}</button>
          ))}
        </div>

        <div className="eyebrow" style={{ marginBottom: 10 }}>kedy sa otvorí</div>
        <div className="col gap-8">
          {whenOptions.map(o => (
            <button key={o.id} onClick={() => setWhen(o.id)} className="row gap-12" style={{
              width: '100%', padding: '13px 14px', alignItems: 'center', textAlign: 'left',
              background: when === o.id ? 'var(--green-soft)' : 'var(--surface)',
              border: '0.5px solid ' + (when === o.id ? 'var(--green-line)' : 'var(--line)'),
              borderRadius: 12, cursor: 'pointer', font: 'inherit',
              color: when === o.id ? 'var(--green-deep)' : 'var(--ink)',
            }}>
              <span style={{ color: 'var(--green)', flexShrink: 0 }}>
                {React.cloneElement(Icons.cal, { style: { width: 18, height: 18 } })}
              </span>
              <div className="col grow" style={{ gap: 1 }}>
                <span style={{ fontSize: 13.5, fontWeight: 500 }}>{o.label}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{o.sub}</span>
              </div>
              {when === o.id && <span style={{ color: 'var(--green)' }}>
                {React.cloneElement(Icons.check, { style: { width: 17, height: 17 } })}
              </span>}
            </button>
          ))}
        </div>

        <div className="handwritten" style={{ textAlign: 'center', marginTop: 22, fontSize: 17, color: 'var(--muted)' }}>
          zapečatíme a otvoríme neskôr ♡
        </div>
      </div>

      <div style={{
        padding: '14px 20px calc(14px + env(safe-area-inset-bottom))',
        borderTop: '0.5px solid var(--line)', background: 'var(--paper)', flexShrink: 0,
      }}>
        <button className="btn primary" disabled={!canSave} onClick={onClose}
          style={{ width: '100%', padding: '15px', fontSize: 15,
            opacity: canSave ? 1 : 0.45, cursor: canSave ? 'pointer' : 'default' }}>
          zapečatiť kapsulu
        </button>
      </div>
    </div>
  );
};

Object.assign(window, { Capsule, CapsuleAdd, CapsuleDetail, CAPSULES, daysUntil, formatDateSk });
