// Časová kapsula — countdown hero + otvorené/zapečatené + nová kapsula (podľa design/hifi-capsule.jsx)
import { cloneElement, useState } from 'react';
import { api } from '../api';
import { useStore } from '../store';
import { Icons, Photo } from '../components/shell';
import Lightbox from '../components/Lightbox';
import { daysUntil, parseDate, today, toInputDate } from '../lib/dates';

// Genitív mesiacov — „21. januára 2027" (ako v prototype)
const MONTHS_GEN_SK = ['januára', 'februára', 'marca', 'apríla', 'mája', 'júna',
    'júla', 'augusta', 'septembra', 'októbra', 'novembra', 'decembra'];
const formatDateGenSk = (value) => {
    const d = parseDate(value);
    return `${d.getDate()}. ${MONTHS_GEN_SK[d.getMonth()]} ${d.getFullYear()}`;
};

const capInput = {
    width: '100%', font: 'inherit', fontSize: 15, color: 'var(--ink)',
    background: 'var(--surface)', border: '0.5px solid var(--line)',
    borderRadius: 12, padding: '13px 14px', outline: 'none',
};

const LockIcon = ({ size = 28, fill = 'var(--paper)' }) => (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size, fill }}>
        <path d="M6 10V7a6 6 0 0 1 12 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1zm2 0h8V7a4 4 0 1 0-8 0v3z" />
    </svg>
);

export default function CapsuleScreen({ onBack }) {
    const { capsules } = useStore();
    const [sheet, setSheet] = useState(null); // 'add'
    const [detail, setDetail] = useState(null); // capsule slug

    const enriched = capsules.map(c => ({
        ...c,
        daysLeft: Math.max(0, daysUntil(c.unlock_date)),
    }));
    const locked = enriched.filter(c => !c.is_unlocked)
        .sort((a, b) => parseDate(a.unlock_date) - parseDate(b.unlock_date));
    const opened = enriched.filter(c => c.is_unlocked)
        .sort((a, b) => parseDate(b.unlock_date) - parseDate(a.unlock_date));
    const next = locked[0];
    const detailCapsule = detail ? enriched.find(c => c.slug === detail) : null;

    return (
        <div className="col" style={{ height: '100%', background: 'var(--paper)', position: 'relative' }}>
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                padding: '16px 16px 8px',
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

            <div className="scroll no-pad-top" style={{ paddingTop: 62 }}>
                <div className="app-header" style={{ padding: '0 0 14px' }}>
                    <div className="col" style={{ minWidth: 0 }}>
                        <div className="eyebrow">vašu budúcnosť dnes</div>
                        <h1>časová kapsula</h1>
                    </div>
                </div>

                {/* Hero — najbližšie odomknutie */}
                {next && (
                    <div className="card hero" style={{
                        padding: 20,
                        background: 'linear-gradient(165deg, #1f3f2b 0%, #2d5a3d 60%, #b85a1b 200%)',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        {/* dekoratívne hviezdy */}
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
                                otvorí sa {formatDateGenSk(next.unlock_date)} · vložila {next.by}
                            </div>
                        </div>
                    </div>
                )}

                {/* Otvorené */}
                {opened.length > 0 && (
                    <>
                        <div className="row between" style={{ margin: '24px 0 10px' }}>
                            <div className="handwritten" style={{ fontSize: 22 }}>
                                ✓ otvorené ({opened.length})
                            </div>
                            <span className="eyebrow">prečítané spolu</span>
                        </div>
                        <div className="col gap-10">
                            {opened.map(c => <OpenedCapsule key={c.id} capsule={c} onOpen={() => setDetail(c.slug)} />)}
                        </div>
                    </>
                )}

                {/* Zapečatené */}
                {locked.length > 0 && (
                    <>
                        <div className="row between" style={{ margin: '24px 0 10px' }}>
                            <div className="handwritten" style={{ fontSize: 22 }}>
                                🔒 zapečatené ({locked.length})
                            </div>
                            <span className="eyebrow">trpezlivosť</span>
                        </div>
                        <div className="col gap-10">
                            {locked.map(c => <LockedCapsule key={c.id} capsule={c} onOpen={() => setDetail(c.slug)} />)}
                        </div>
                    </>
                )}

                {/* CTA nová kapsula */}
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
            {detailCapsule && <CapsuleDetail capsule={detailCapsule} onClose={() => setDetail(null)} />}
        </div>
    );
}

const LockedCapsule = ({ capsule: c, onOpen }) => (
    <button className="card flush" onClick={onOpen} style={{
        position: 'relative',
        display: 'flex',
        border: '0.5px solid var(--line)',
        width: '100%', textAlign: 'left', cursor: 'pointer',
        font: 'inherit', color: 'inherit', padding: 0, overflow: 'hidden',
    }}>
        {/* Rozmazaný pás vľavo */}
        <div style={{
            width: 88, position: 'relative', overflow: 'hidden',
            borderRadius: 'var(--r-md) 0 0 var(--r-md)', flexShrink: 0,
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
                <LockIcon />
            </div>
        </div>
        {/* Obsah */}
        <div className="col grow" style={{ padding: 12, gap: 6 }}>
            <div className="row between">
                <span className="eyebrow" style={{ color: 'var(--green)' }}>{c.daysLeft} dní</span>
                <span className="eyebrow" style={{ fontSize: 9 }}>vložil/a {c.by}</span>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>{c.title}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                odomkne sa {formatDateGenSk(c.unlock_date)}
            </div>
            <div className="row gap-6" style={{ marginTop: 2 }}>
                {c.has_letter && <span className="chip" style={{ fontSize: 9.5, padding: '2px 7px' }}>✉ list</span>}
                {c.photos_count > 0 && <span className="chip" style={{ fontSize: 9.5, padding: '2px 7px' }}>📷 {c.photos_count}</span>}
                {c.audio_duration && <span className="chip" style={{ fontSize: 9.5, padding: '2px 7px' }}>🎙 {c.audio_duration}</span>}
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
            <Photo seed={c.seed} url={c.photos?.[0]?.thumb_url || c.photos?.[0]?.url} style={{ height: 110, borderRadius: 0 }} />
            <div style={{
                position: 'absolute', top: 10, left: 10,
                background: 'rgba(45, 90, 61, 0.92)', color: 'var(--paper)',
                padding: '3px 9px', borderRadius: 999, fontSize: 10,
                fontWeight: 500, letterSpacing: 0.3,
            }}>
                ✓ otvorené {formatDateGenSk(c.unlock_date)}
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
                    {c.has_letter && <span style={{ fontSize: 10, color: 'var(--muted)' }}>✉ list</span>}
                    {c.photos_count > 0 && <span style={{ fontSize: 10, color: 'var(--muted)' }}>· 📷 {c.photos_count}</span>}
                    {c.audio_duration && <span style={{ fontSize: 10, color: 'var(--muted)' }}>· 🎙 {c.audio_duration}</span>}
                </div>
                <span className="eyebrow" style={{ fontSize: 9, color: 'var(--green)' }}>otvoriť →</span>
            </div>
        </div>
    </button>
);

/* ---------- Detail kapsuly ---------- */
function CapsuleDetail({ capsule: c, onClose }) {
    const { refresh } = useStore();
    const locked = !c.is_unlocked;
    const [busy, setBusy] = useState(false);
    const [lightbox, setLightbox] = useState(null);

    const lightboxItems = (c.photos || []).map(p => ({ id: p.id, url: p.url, real: true }));

    const deleteCapsule = async () => {
        if (busy || !confirm(`Vymazať kapsulu „${c.title}"?`)) return;
        setBusy(true);
        try {
            await api.delete(`/capsules/${c.slug}`);
            await refresh('capsules', 'events');
            onClose();
        } catch {
            setBusy(false);
            alert('Vymazanie zlyhalo.');
        }
    };

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
                padding: '16px 16px 12px', flexShrink: 0,
            }}>
                <button className="icon-btn" onClick={onClose} style={{
                    flexShrink: 0,
                    background: locked ? 'rgba(255,255,255,0.15)' : 'var(--surface)',
                    border: locked ? 'none' : '0.5px solid var(--line)',
                    color: locked ? 'var(--paper)' : 'var(--ink)',
                }}>{Icons.back}</button>
                <div className="col grow" style={{ minWidth: 0 }}>
                    <div className="eyebrow" style={{ color: locked ? 'rgba(255,255,255,0.7)' : 'var(--muted)' }}>
                        {locked ? 'zapečatené' : '✓ otvorené ' + formatDateGenSk(c.unlock_date)}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 600 }}>{c.title}</div>
                </div>
                <button className="icon-btn" onClick={deleteCapsule} style={{
                    flexShrink: 0,
                    background: locked ? 'rgba(255,255,255,0.15)' : 'var(--surface)',
                    border: locked ? 'none' : '0.5px solid var(--line)',
                    color: locked ? 'rgba(255,255,255,0.85)' : 'var(--accent)',
                }}>{Icons.trash}</button>
            </div>

            {locked ? (
                /* ---- Zapečatená ---- */
                <div className="col" style={{ flex: 1, padding: '0 24px', justifyContent: 'center', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
                    <div style={{ marginBottom: 20 }}>
                        <LockIcon size={44} fill="rgba(255,255,255,0.9)" />
                    </div>
                    <div className="num" style={{ fontSize: 88, lineHeight: 0.9, color: 'var(--paper)' }}>{c.daysLeft}</div>
                    <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>dní do odomknutia</div>
                    <div style={{ fontSize: 12.5, opacity: 0.7, marginTop: 16, lineHeight: 1.5, maxWidth: 260 }}>
                        Otvorí sa {formatDateGenSk(c.unlock_date)}. Vložila {c.by}.
                    </div>
                    {c.note && (
                        <div style={{
                            marginTop: 24, padding: '14px 16px', maxWidth: 300,
                            background: 'rgba(255,255,255,0.1)', borderRadius: 14,
                            fontSize: 13, fontStyle: 'italic', lineHeight: 1.5, opacity: 0.92,
                        }}>„{c.note}"</div>
                    )}
                    <div className="row gap-6" style={{ marginTop: 24 }}>
                        {c.has_letter && <span className="chip" style={{ background: 'rgba(255,255,255,0.15)', color: 'var(--paper)', border: 'none' }}>✉ list</span>}
                        {c.photos_count > 0 && <span className="chip" style={{ background: 'rgba(255,255,255,0.15)', color: 'var(--paper)', border: 'none' }}>📷 {c.photos_count} fotiek</span>}
                        {c.audio_duration && <span className="chip" style={{ background: 'rgba(255,255,255,0.15)', color: 'var(--paper)', border: 'none' }}>🎙 {c.audio_duration}</span>}
                    </div>
                    <div className="handwritten" style={{ marginTop: 28, fontSize: 17, opacity: 0.8 }}>
                        ešte chvíľu počkáme ♡
                    </div>
                </div>
            ) : (
                /* ---- Otvorená ---- */
                <div className="scroll" style={{ flex: 1, paddingTop: 6 }}>
                    <div style={{ position: 'relative', margin: '0 -20px 20px' }}>
                        <Photo seed={c.seed} url={c.photos?.[0]?.thumb_url || c.photos?.[0]?.url} style={{ height: 180, borderRadius: 0 }} />
                    </div>

                    {c.has_letter && (c.letter || c.preview || c.note) && (
                        <div className="card" style={{ padding: 18, marginBottom: 16 }}>
                            <div className="eyebrow" style={{ color: 'var(--green)', marginBottom: 10 }}>✉ list od {c.by}</div>
                            <div className="serif" style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink)', whiteSpace: 'pre-line' }}>
                                {c.letter || c.preview || c.note}
                            </div>
                            <div className="handwritten" style={{ marginTop: 14, fontSize: 20, color: 'var(--green-deep)', textAlign: 'right' }}>
                                — {c.by}
                            </div>
                        </div>
                    )}

                    {c.audio_url && (
                        <div className="card tint" style={{ padding: 14, marginBottom: 16 }}>
                            <div className="row gap-12" style={{ alignItems: 'center' }}>
                                <div className="col grow">
                                    <div style={{ fontSize: 13, fontWeight: 500 }}>Hlasovka</div>
                                    <div className="row" style={{ gap: 2, alignItems: 'center', marginTop: 6, height: 20 }}>
                                        {Array.from({ length: 30 }).map((_, i) => (
                                            <div key={i} style={{
                                                flex: 1, borderRadius: 2,
                                                height: `${20 + Math.abs(Math.sin(i * 1.7)) * 70}%`,
                                                background: i < 8 ? 'var(--green)' : 'var(--green-line)',
                                            }} />
                                        ))}
                                    </div>
                                </div>
                                {c.audio_duration && (
                                    <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>{c.audio_duration}</span>
                                )}
                            </div>
                            <audio controls src={c.audio_url} preload="metadata"
                                style={{ width: '100%', height: 36, marginTop: 10 }} />
                        </div>
                    )}

                    {c.photos_count > 0 && (
                        <>
                            <div className="eyebrow" style={{ marginBottom: 10 }}>📷 {c.photos_count} fotiek z tej doby</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, marginBottom: 20 }}>
                                {c.photos?.length
                                    ? c.photos.map((p, i) => (
                                        <Photo key={p.id} url={p.thumb_url || p.url} seed={c.seed}
                                            onClick={() => setLightbox(i)}
                                            style={{ aspectRatio: '1', borderRadius: 6, cursor: 'pointer' }} />
                                    ))
                                    : Array.from({ length: c.photos_count }).map((_, i) => (
                                        <Photo key={i} seed={`${c.seed}-cap`} index={i} style={{ aspectRatio: '1', borderRadius: 6 }} />
                                    ))}
                            </div>
                        </>
                    )}

                    <div className="handwritten" style={{ textAlign: 'center', margin: '8px 0 20px', fontSize: 18, color: 'var(--muted)' }}>
                        otvorené spolu · {formatDateGenSk(c.unlock_date)} ♡
                    </div>
                </div>
            )}

            {lightbox !== null && lightboxItems.length > 0 && (
                <Lightbox items={lightboxItems} index={lightbox} onClose={() => setLightbox(null)} />
            )}
        </div>
    );
}

/* ---------- Nová kapsula ---------- */
const audioDurationOf = (file) => new Promise(resolve => {
    try {
        const url = URL.createObjectURL(file);
        const a = new Audio();
        a.preload = 'metadata';
        a.onloadedmetadata = () => {
            URL.revokeObjectURL(url);
            if (!Number.isFinite(a.duration)) return resolve(null);
            const s = Math.round(a.duration);
            resolve(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`);
        };
        a.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
        a.src = url;
    } catch {
        resolve(null);
    }
});

function CapsuleAdd({ onClose }) {
    const { user, settings, refresh } = useStore();
    const [title, setTitle] = useState('');
    const [letter, setLetter] = useState('');
    const [by, setBy] = useState(user?.name === 'S' || user?.name === 'M' ? user.name : 'spolu');
    const [when, setWhen] = useState('anniv');
    const [customDate, setCustomDate] = useState('');
    const [photoFiles, setPhotoFiles] = useState([]);
    const [audioFile, setAudioFile] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    // najbližšie výročie z together_since
    const t = today();
    const since = parseDate(settings.together_since || '2024-01-21');
    let anniv = new Date(t.getFullYear(), since.getMonth(), since.getDate());
    if (anniv <= t) anniv = new Date(t.getFullYear() + 1, since.getMonth(), since.getDate());
    const plusYears = (n) => new Date(t.getFullYear() + n, t.getMonth(), t.getDate());

    const whenOptions = [
        { id: 'anniv', label: 'na výročie', date: anniv, sub: formatDateGenSk(anniv) },
        { id: 'year', label: 'o rok', date: plusYears(1), sub: formatDateGenSk(plusYears(1)) },
        { id: 'five', label: 'o 5 rokov', date: plusYears(5), sub: formatDateGenSk(plusYears(5)) },
        { id: 'custom', label: 'vlastný dátum', sub: 'vyber v kalendári' },
    ];

    const unlockDate = when === 'custom'
        ? customDate
        : toInputDate(whenOptions.find(o => o.id === when).date);

    const canSave = title.trim().length > 0 && !!unlockDate && !busy;

    const save = async () => {
        if (!canSave) return;
        setBusy(true);
        setError(null);
        try {
            const fd = new FormData();
            fd.append('title', title.trim());
            fd.append('by', by);
            fd.append('unlock_date', unlockDate);
            if (letter.trim()) fd.append('letter', letter.trim());
            if (audioFile) {
                fd.append('audio', audioFile);
                const dur = await audioDurationOf(audioFile);
                if (dur) fd.append('audio_duration', dur);
            }
            const created = await api.post('/capsules', fd);
            if (photoFiles.length && created?.id) {
                const pfd = new FormData();
                pfd.append('type', 'capsule');
                pfd.append('id', created.id);
                photoFiles.forEach(f => pfd.append('files[]', f));
                await api.post('/photos', pfd);
            }
            await refresh('capsules', 'events');
            onClose();
        } catch (e) {
            setError(e.message || 'Uloženie zlyhalo.');
            setBusy(false);
        }
    };

    const fileRow = (icon, label, sub, active, inputProps, onClear) => (
        <label className="row gap-12" style={{
            width: '100%', padding: '12px 14px', alignItems: 'center', textAlign: 'left',
            background: active ? 'var(--green-soft)' : 'var(--surface)',
            border: '0.5px solid ' + (active ? 'var(--green-line)' : 'var(--line)'),
            borderRadius: 12, cursor: 'pointer', font: 'inherit',
            color: active ? 'var(--green-deep)' : 'var(--ink)',
        }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <div className="col grow" style={{ gap: 1, minWidth: 0 }}>
                <span style={{ fontSize: 13.5, fontWeight: 500 }}>{label}</span>
                <span style={{
                    fontSize: 11, color: active ? 'var(--green)' : 'var(--muted)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{sub}</span>
            </div>
            {active && onClear ? (
                <span role="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClear(); }}
                    style={{ color: 'var(--muted-2)', display: 'grid', placeItems: 'center', padding: 4 }}>
                    {cloneElement(Icons.close, { style: { width: 15, height: 15 } })}
                </span>
            ) : (
                <span style={{
                    width: 20, height: 20, borderRadius: '50%',
                    display: 'grid', placeItems: 'center', flexShrink: 0,
                    background: active ? 'var(--green)' : 'transparent',
                    border: '1.5px solid ' + (active ? 'var(--green)' : 'var(--line)'),
                    color: 'var(--paper)',
                }}>{active && cloneElement(Icons.check, { style: { width: 13, height: 13 } })}</span>
            )}
            <input type="file" style={{ display: 'none' }} {...inputProps} />
        </label>
    );

    return (
        <div className="col" style={{
            position: 'absolute', inset: 0, zIndex: 30, background: 'var(--paper)',
            animation: 'slideUp 320ms ease both',
        }}>
            <div style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                gap: 12, padding: '16px 20px 12px', flexShrink: 0,
            }}>
                <div className="col" style={{ minWidth: 0 }}>
                    <div className="eyebrow">sľub do budúcna</div>
                    <h1 className="serif" style={{ margin: 0, fontSize: 38, fontWeight: 600, lineHeight: 1, letterSpacing: 0.5 }}>nová kapsula</h1>
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
                    {fileRow('📷', 'Fotky',
                        photoFiles.length
                            ? `${photoFiles.length} ${photoFiles.length === 1 ? 'vybraná' : photoFiles.length < 5 ? 'vybrané' : 'vybraných'}`
                            : 'voliteľné · vyber z galérie',
                        photoFiles.length > 0,
                        {
                            accept: 'image/*', multiple: true,
                            onChange: (e) => setPhotoFiles(Array.from(e.target.files || [])),
                        },
                        () => setPhotoFiles([]))}
                    {fileRow('🎙', 'Hlasová správa',
                        audioFile ? audioFile.name : 'voliteľné · nahraj súbor',
                        !!audioFile,
                        {
                            accept: 'audio/*',
                            onChange: (e) => setAudioFile(e.target.files?.[0] || null),
                        },
                        () => setAudioFile(null))}
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
                                {cloneElement(Icons.cal, { style: { width: 18, height: 18 } })}
                            </span>
                            <div className="col grow" style={{ gap: 1 }}>
                                <span style={{ fontSize: 13.5, fontWeight: 500 }}>{o.label}</span>
                                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{o.sub}</span>
                            </div>
                            {when === o.id && <span style={{ color: 'var(--green)' }}>
                                {cloneElement(Icons.check, { style: { width: 17, height: 17 } })}
                            </span>}
                        </button>
                    ))}
                    {when === 'custom' && (
                        <input type="date" value={customDate} min={toInputDate(t)}
                            onChange={e => setCustomDate(e.target.value)}
                            style={capInput} />
                    )}
                </div>

                {error && (
                    <div style={{ marginTop: 14, fontSize: 12.5, color: 'var(--accent)', textAlign: 'center' }}>{error}</div>
                )}

                <div className="handwritten" style={{ textAlign: 'center', marginTop: 22, fontSize: 17, color: 'var(--muted)' }}>
                    zapečatíme a otvoríme neskôr ♡
                </div>
            </div>

            <div style={{
                padding: '14px 20px calc(14px + env(safe-area-inset-bottom))',
                borderTop: '0.5px solid var(--line)', background: 'var(--paper)', flexShrink: 0,
            }}>
                <button className="btn primary" disabled={!canSave} onClick={save}
                    style={{
                        width: '100%', padding: '15px', fontSize: 15,
                        opacity: canSave ? 1 : 0.45, cursor: canSave ? 'pointer' : 'default',
                    }}>
                    {busy ? 'pečatím…' : 'zapečatiť kapsulu'}
                </button>
            </div>
        </div>
    );
}
