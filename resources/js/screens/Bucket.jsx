// Bucket list — hero progress + grid kategórií + rozklikací zoznam (podľa design/hifi-bucket.jsx)
import { cloneElement, useState } from 'react';
import { api } from '../api';
import { useStore } from '../store';
import { AppHeader, Icons, ProgressBar } from '../components/shell';

const heroNote = (ratio) => {
    if (ratio >= 0.99) return 'všetko splnené — ideme snívať ďalej ♡';
    if (ratio >= 0.66) return 'už len kúsok — sme skoro tam 🤍';
    if (ratio >= 0.33) return 'tretina za nami — ďakujem 🤍';
    if (ratio > 0) return 'pekne to začína ♡';
    return 'poďme začať snívať ♡';
};

export default function Bucket({ navigate }) {
    const { bucket, refresh } = useStore();
    const [activeCat, setActiveCat] = useState(null);
    const [newItem, setNewItem] = useState(null); // text rozpísanej položky
    const [busy, setBusy] = useState(false);

    const done = bucket.reduce((s, c) => s + c.done, 0);
    const total = bucket.reduce((s, c) => s + c.total, 0);
    const ratio = total ? done / total : 0;

    const cat = activeCat ? bucket.find(c => c.id === activeCat) : null;

    const toggleItem = async (item) => {
        await api.patch(`/bucket/items/${item.id}/toggle`);
        await refresh('bucket', 'stats');
    };

    const deleteItem = async (item) => {
        if (!confirm(`Vymazať „${item.txt}"?`)) return;
        await api.delete(`/bucket/items/${item.id}`);
        await refresh('bucket', 'stats');
    };

    const deleteCategory = async (c) => {
        if (!confirm(`Vymazať zoznam „${c.name}" aj so všetkými položkami?`)) return;
        setActiveCat(null);
        await api.delete(`/bucket/categories/${c.id}`);
        await refresh('bucket', 'stats');
    };

    const addItem = async (e) => {
        e.preventDefault();
        const text = newItem?.trim();
        if (!text || busy) return;
        setBusy(true);
        try {
            await api.post(`/bucket/${cat.id}/items`, { text });
            setNewItem(null);
            await refresh('bucket', 'stats');
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <AppHeader
                eyebrow="náš zoznam snov"
                title="bucket list"
                right={<button className="icon-btn green" onClick={() => navigate('bucket-add')}>{Icons.plus}</button>}
            />
            <div className="scroll">
                {/* Hero progress */}
                <div className="card hero" style={{ padding: 18 }}>
                    <div className="row between">
                        <div className="col gap-4">
                            <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.75)' }}>splnené spolu</span>
                            <div className="row gap-8" style={{ alignItems: 'baseline' }}>
                                <span className="num" style={{ fontSize: 56, color: 'var(--paper)' }}>{done}</span>
                                <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)' }}>/ {total}</span>
                            </div>
                        </div>
                        <div style={{
                            width: 64, height: 64,
                            borderRadius: '50%',
                            background: 'conic-gradient(var(--paper) 0 ' + (ratio * 360) + 'deg, rgba(255,255,255,0.18) 0)',
                            display: 'grid', placeItems: 'center',
                        }}>
                            <div style={{
                                width: 50, height: 50, borderRadius: '50%',
                                background: 'var(--green)', display: 'grid', placeItems: 'center',
                                color: 'var(--paper)', fontSize: 13, fontWeight: 500,
                            }}>{Math.round(ratio * 100)}%</div>
                        </div>
                    </div>
                    <div className="handwritten" style={{ color: 'var(--paper)', fontSize: 18, marginTop: 10, opacity: 0.9 }}>
                        {heroNote(ratio)}
                    </div>
                </div>

                {/* Grid kategórií */}
                <div className="eyebrow" style={{ margin: '24px 0 10px' }}>kategórie</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {bucket.map(c => (
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
                            onClick={() => { setActiveCat(activeCat === c.id ? null : c.id); setNewItem(null); }}>
                            <div className="row between">
                                <div style={{
                                    fontSize: 24, width: 38, height: 38, borderRadius: 12,
                                    background: 'var(--green-soft)', color: 'var(--green)',
                                    display: 'grid', placeItems: 'center',
                                }}>{c.icon}</div>
                                <span className="num" style={{ fontSize: 24, color: 'var(--green)' }}>
                                    {c.total ? Math.round(c.done / c.total * 100) : 0}%
                                </span>
                            </div>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 500 }}>{c.name}</div>
                                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
                                    {c.done} z {c.total} splnené
                                </div>
                                <ProgressBar value={c.total ? c.done / c.total : 0} />
                            </div>
                        </button>
                    ))}
                </div>

                {/* Detail vybranej kategórie */}
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
                            <div className="row gap-4">
                                <button className="btn ghost" style={{ padding: 6, color: 'var(--muted-2)' }}
                                    onClick={() => deleteCategory(cat)}>{Icons.trash}</button>
                                <button className="btn ghost" style={{ padding: 6, color: 'var(--muted)' }}
                                    onClick={() => setActiveCat(null)}>{Icons.close}</button>
                            </div>
                        </div>
                        <div className="col" style={{ gap: 0 }}>
                            {cat.items.map((it, i) => (
                                <div key={it.id} className="row gap-12" style={{
                                    padding: '12px 0',
                                    borderTop: i === 0 ? 'none' : '0.5px solid var(--line)',
                                }}>
                                    <button
                                        onClick={() => toggleItem(it)}
                                        style={{
                                            width: 22, height: 22, borderRadius: 7,
                                            border: '1.5px solid ' + (it.done ? 'var(--green)' : 'var(--line)'),
                                            background: it.done ? 'var(--green)' : 'transparent',
                                            display: 'grid', placeItems: 'center',
                                            color: 'var(--paper)', fontSize: 12, flexShrink: 0,
                                            cursor: 'pointer', padding: 0,
                                        }}>{it.done && '✓'}</button>
                                    <button className="col grow" style={{
                                        background: 'none', border: 0, textAlign: 'left', padding: 0, cursor: 'pointer',
                                    }} onClick={() => toggleItem(it)}>
                                        <span style={{
                                            fontSize: 13.5,
                                            textDecoration: it.done ? 'line-through' : 'none',
                                            color: it.done ? 'var(--muted)' : 'var(--ink)',
                                        }}>{it.txt}</span>
                                        {it.sub && <span style={{ fontSize: 10.5, color: 'var(--muted-2)', marginTop: 2, display: 'block' }}>{it.sub}</span>}
                                    </button>
                                    <button className="btn ghost" style={{ padding: 4, color: 'var(--muted-2)' }}
                                        onClick={() => deleteItem(it)}>
                                        {cloneElement(Icons.close, { style: { width: 14, height: 14 } })}
                                    </button>
                                </div>
                            ))}

                            {newItem === null ? (
                                <button className="btn ghost" style={{
                                    marginTop: 8, padding: '10px', justifyContent: 'flex-start',
                                    fontSize: 12.5, color: 'var(--green)', gap: 8,
                                }} onClick={() => setNewItem('')}>
                                    {cloneElement(Icons.plus, { style: { width: 16, height: 16 } })} pridať položku
                                </button>
                            ) : (
                                <form onSubmit={addItem} className="row gap-8" style={{ marginTop: 10 }}>
                                    <input className="field" autoFocus placeholder="nový sen…"
                                        value={newItem} onChange={(e) => setNewItem(e.target.value)} />
                                    <button type="submit" className="btn primary" disabled={busy || !newItem.trim()}
                                        style={{ padding: '10px 14px' }}>
                                        {Icons.check}
                                    </button>
                                </form>
                            )}
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
}
