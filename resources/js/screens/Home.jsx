// Domov — „spolu už" + veľký počet dní + skratky + najnovší moment (podľa design/hifi-home.jsx)
import { useStore } from '../store';
import { Icons, Photo, ProgressBar, iconBg } from '../components/shell';
import Mascot from '../components/Mascot';
import { daysUntil, durationSk, formatDateSk, formatDateShortSk, parseDate, today } from '../lib/dates';

export default function Home({ navigate }) {
    const { stats, settings, moments, capsules, events } = useStore();

    const m = moments[0]; // najnovší
    const nextCapsule = capsules
        .filter(c => !c.is_unlocked)
        .map(c => ({ ...c, daysLeft: daysUntil(c.unlock_date) }))
        .sort((a, b) => a.daysLeft - b.daysLeft)[0];

    const nextEvent = events
        .filter(e => parseDate(e.date) >= today())
        .sort((a, b) => parseDate(a.date) - parseDate(b.date))[0];
    const eventDaysLeft = nextEvent ? daysUntil(nextEvent.date) : 0;

    const eventIcon = { anniv: '♥', milestone: '✦', capsule: '🔒', plan: '📌', date: '♡' };

    return (
        <>
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 20px 8px',
                gap: 10,
            }}>
                <div className="row gap-10" style={{ alignItems: 'center', minWidth: 0 }}>
                    <Mascot variant={settings.mascot_variant || 'pebbles'} size={44} />
                    <div className="col" style={{ gap: 1, minWidth: 0 }}>
                        <div className="eyebrow" style={{ whiteSpace: 'nowrap' }}>náš priestor</div>
                        <div className="serif" style={{ fontSize: 30, color: 'var(--green)', fontWeight: 600, lineHeight: 1 }}>
                            S+M
                        </div>
                    </div>
                </div>
                <div className="row gap-8" style={{ flexShrink: 0 }}>
                    <button className="icon-btn" onClick={() => navigate('moment-add')}>{Icons.plus}</button>
                    <button className="icon-btn" onClick={() => navigate('calendar')}>{Icons.cal}</button>
                </div>
            </div>
            <div className="scroll">
                {/* Hero — veľké počítadlo dní */}
                <div className="col gap-4" style={{ alignItems: 'center', padding: '8px 0 16px' }}>
                    <div className="eyebrow">spolu už</div>
                    <div className="num" style={{ fontSize: 132, color: 'var(--green)', lineHeight: 0.9 }}>
                        {(stats?.days_together ?? 0).toLocaleString('sk-SK')}
                    </div>
                    <div className="row gap-6" style={{ marginTop: 2 }}>
                        <span style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 500 }}>
                            dní · {settings.together_since ? durationSk(settings.together_since) : ''}
                        </span>
                    </div>
                    {settings.together_since && (
                        <div className="handwritten" style={{ fontSize: 18, marginTop: 8 }}>
                            ♡ od {formatDateShortSk(settings.together_since)}
                        </div>
                    )}
                </div>

                <div className="divider" style={{ margin: '4px 0 20px' }} />

                {/* Na dnes — najbližšia udalosť */}
                {nextEvent && (
                    <button className="card tint" style={{
                        width: '100%', marginBottom: 18, padding: 14, textAlign: 'left',
                        display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                        border: 'none', font: 'inherit', color: 'inherit',
                    }} onClick={() => navigate('calendar')}>
                        <div style={{
                            width: 54, height: 54, borderRadius: 14, flexShrink: 0,
                            background: 'var(--green)', color: 'var(--paper)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
                        }}>
                            <span className="num" style={{ fontSize: 22, color: 'var(--paper)' }}>{eventDaysLeft}</span>
                            <span style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.6, opacity: 0.85 }}>dní</span>
                        </div>
                        <div className="col grow" style={{ gap: 2, minWidth: 0 }}>
                            <div className="eyebrow" style={{ color: 'var(--green)' }}>na dnes · {formatDateSk(today())}</div>
                            <div style={{ fontSize: 15, fontWeight: 500 }}>
                                {nextEvent.icon || eventIcon[nextEvent.kind] || '✦'} {nextEvent.title}
                            </div>
                            <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>
                                {eventDaysLeft === 0 ? 'dnes je ten deň!' : eventDaysLeft === 1 ? 'už zajtra' : `o ${eventDaysLeft} dní`} · {formatDateSk(nextEvent.date)}
                            </div>
                        </div>
                        <span style={{ color: 'var(--green)', flexShrink: 0 }}>{Icons.arrow}</span>
                    </button>
                )}

                {/* Skratky (2x2) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button className="card" style={shortcutCard} onClick={() => navigate('bucket')}>
                        <div className="row between">
                            <div style={iconBg}>{Icons.bucket}</div>
                            <span className="eyebrow" style={{ fontSize: 9.5 }}>{stats?.bucket_done}/{stats?.bucket_total}</span>
                        </div>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 500 }}>Bucket list</div>
                            <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{stats?.bucket_done} splnených</div>
                        </div>
                        <ProgressBar value={stats?.bucket_total ? stats.bucket_done / stats.bucket_total : 0} />
                    </button>

                    <button className="card" style={shortcutCard} onClick={() => navigate('map')}>
                        <div className="row between">
                            <div style={iconBg}>{Icons.pin}</div>
                            <span className="eyebrow" style={{ fontSize: 9.5 }}>{stats?.countries} krajín</span>
                        </div>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 500 }}>Mapa sveta</div>
                            <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{stats?.cities} miest navštívených</div>
                        </div>
                        <MiniMapStrip />
                    </button>

                    <button className="card" style={shortcutCard} onClick={() => navigate('gallery')}>
                        <div className="row between">
                            <div style={iconBg}>{Icons.img}</div>
                            <span className="eyebrow" style={{ fontSize: 9.5 }}>{(stats?.photos ?? 0).toLocaleString('sk-SK')}</span>
                        </div>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 500 }}>Galéria</div>
                            <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{moments.length} momentov</div>
                        </div>
                        <div className="row gap-4">
                            {moments.slice(0, 4).map(mm => (
                                <Photo key={mm.id} seed={mm.seed} url={mm.photos?.[0]?.thumb_url || mm.photos?.[0]?.url}
                                    style={{ width: 30, height: 30, borderRadius: 6 }} />
                            ))}
                        </div>
                    </button>

                    <button className="card hero" style={{ ...shortcutCard, padding: 14 }}
                        onClick={() => navigate('wrapped')}>
                        <div className="row between">
                            <div style={{ ...iconBg, background: 'rgba(255,255,255,0.15)', color: 'var(--paper)' }}>
                                {Icons.sparkle}
                            </div>
                            <span style={{ fontSize: 9.5, opacity: 0.85, letterSpacing: 1.4, textTransform: 'uppercase' }}>
                                {new Date().getFullYear()}
                            </span>
                        </div>
                        <div>
                            <div className="serif" style={{ fontSize: 26, fontWeight: 600, lineHeight: 1 }}>Wrapped</div>
                            <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 2 }}>náš rok v 6 slidoch</div>
                        </div>
                        <div className="row gap-6" style={{ marginTop: 2 }}>
                            <span style={{ fontSize: 11, opacity: 0.85 }}>spustiť →</span>
                        </div>
                    </button>
                </div>

                {/* Najnovší moment */}
                {m && (
                    <>
                        <div className="row between" style={{ margin: '24px 0 10px' }}>
                            <div className="handwritten" style={{ fontSize: 22 }}>Najnovší moment</div>
                            <button className="btn ghost" style={{ padding: '4px 8px', fontSize: 12, color: 'var(--muted)' }}
                                onClick={() => navigate('gallery')}>
                                všetky →
                            </button>
                        </div>

                        <button className="card flush" style={{ width: '100%', padding: 0, border: '0.5px solid var(--line)', cursor: 'pointer', background: 'var(--surface)' }}
                            onClick={() => navigate('moment:' + m.slug)}>
                            <Photo seed={m.seed} url={m.photos?.[0]?.thumb_url || m.photos?.[0]?.url} style={{ height: 200, borderRadius: 0 }} />
                            <div className="col gap-6" style={{ padding: 14, textAlign: 'left' }}>
                                <div className="row between">
                                    <div className="eyebrow">{m.date_short} · {m.place_short}</div>
                                </div>
                                <div style={{ fontSize: 17, fontWeight: 500 }}>{m.title}</div>
                                <div className="row gap-6 wrap">
                                    {(m.tags || []).map(t => <span key={t} className="chip soft">{t}</span>)}
                                </div>
                            </div>
                        </button>
                    </>
                )}

                {/* Časová kapsula */}
                {nextCapsule && (
                    <button className="card flush" style={{
                        width: '100%', marginTop: 16, padding: 0, textAlign: 'left',
                        cursor: 'pointer', border: '0.5px solid var(--line)',
                        background: 'var(--surface)', font: 'inherit', color: 'inherit',
                        overflow: 'hidden', position: 'relative',
                    }}
                        onClick={() => navigate('capsule')}>
                        <div style={{
                            padding: 16, display: 'flex', gap: 14, alignItems: 'center',
                            background: 'linear-gradient(115deg, #1f3f2b 0%, #2d5a3d 70%, #3a6a4a 100%)',
                            color: 'var(--paper)',
                        }}>
                            <div style={{
                                width: 60, height: 60, borderRadius: '50%',
                                background: 'radial-gradient(circle at 35% 35%, #d97240 0%, #b85a1b 60%, #8a3f0e 100%)',
                                display: 'grid', placeItems: 'center',
                                color: 'var(--paper)',
                                fontFamily: 'Caveat', fontSize: 24, fontWeight: 700,
                                boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.2)',
                                position: 'relative',
                                flexShrink: 0,
                            }}>
                                <span style={{ filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.3))' }}>S+M</span>
                            </div>
                            <div className="col grow" style={{ gap: 4, minWidth: 0 }}>
                                <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.75)' }}>časová kapsula</div>
                                <div style={{ fontSize: 15, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {nextCapsule.title}
                                </div>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
                                    odomkne sa za <span className="serif" style={{ fontSize: 18, color: 'var(--paper)', fontWeight: 600 }}>
                                        {nextCapsule.daysLeft}
                                    </span> dní
                                </div>
                            </div>
                        </div>
                    </button>
                )}
            </div>
        </>
    );
}

const shortcutCard = {
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    textAlign: 'left',
    cursor: 'pointer',
    border: '0.5px solid var(--line)',
    background: 'var(--surface)',
    borderRadius: 'var(--r-md)',
    minHeight: 130,
    justifyContent: 'space-between',
    font: 'inherit',
    color: 'inherit',
};

const MiniMapStrip = () => (
    <svg viewBox="0 0 100 14" style={{ width: '100%', height: 14 }}>
        <g fill="var(--green)">
            <circle cx="15" cy="7" r="2" />
            <circle cx="30" cy="5" r="2" />
            <circle cx="42" cy="8" r="2" />
            <circle cx="55" cy="6" r="2" />
            <circle cx="70" cy="9" r="2" />
            <circle cx="85" cy="7" r="2" />
            <circle cx="92" cy="5" r="2" />
        </g>
        <line x1="6" y1="7" x2="96" y2="7" stroke="var(--green-line)" strokeWidth="0.6" strokeDasharray="1.5 2" />
    </svg>
);
