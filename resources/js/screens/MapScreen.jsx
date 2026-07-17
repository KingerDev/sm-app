// Mapa sveta — reálna mapa (Leaflet) + stats trio + krajiny + wishlist (podľa design/hifi-map.jsx)
import { cloneElement, useState } from 'react';
import { api } from '../api';
import { useStore } from '../store';
import { AppHeader, Icons, Photo, Sheet, coverSrc } from '../components/shell';
import RealMap from '../components/RealMap';

const cityWord = (n) => n === 1 ? 'mesto' : n < 5 ? 'mestá' : 'miest';
const destWord = (n) => n === 1 ? 'destinácia' : n < 5 ? 'destinácie' : 'destinácií';

const wlInput = {
    font: 'inherit',
    fontSize: 13.5,
    color: 'var(--ink)',
    background: 'var(--surface)',
    border: '0.5px solid var(--line)',
    borderRadius: 10,
    padding: '9px 11px',
    outline: 'none',
};

export default function MapScreen({ navigate }) {
    const { stats, countries, wishlist, refresh } = useStore();
    const [query, setQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [sort, setSort] = useState('az'); // 'az' | 'photos'
    const [openCountry, setOpenCountry] = useState(null); // id krajiny
    const [addSheet, setAddSheet] = useState(false);

    // detail berieme živý zo store (po zmazaní mesta sa hneď prekreslí)
    const openedCountry = openCountry != null ? countries.find(c => c.id === openCountry) : null;

    // wishlist
    const [wlOpen, setWlOpen] = useState(false);
    const [wlName, setWlName] = useState('');
    const [wlFlag, setWlFlag] = useState('');
    const [wlBusy, setWlBusy] = useState(false);

    const pins = countries
        .filter(c => c.lat != null && c.lng != null)
        .map(c => ({ lat: c.lat, lng: c.lng, label: c.name, onClick: () => setOpenCountry(c.id) }));

    const q = query.trim().toLowerCase();
    const filtered = countries
        .filter(c => !q ||
            c.name.toLowerCase().includes(q) ||
            (c.cities || []).some(ci => ci.name.toLowerCase().includes(q)))
        .sort((a, b) => sort === 'az'
            ? a.name.localeCompare(b.name, 'sk')
            : b.photos_count - a.photos_count);

    const addWish = async (e) => {
        e.preventDefault();
        const name = wlName.trim();
        if (!name || wlBusy) return;
        setWlBusy(true);
        try {
            await api.post('/wishlist', { name, ...(wlFlag.trim() ? { flag: wlFlag.trim() } : {}) });
            setWlName('');
            setWlFlag('');
            await refresh('wishlist');
        } finally {
            setWlBusy(false);
        }
    };

    const removeWish = async (w) => {
        if (!confirm(`Vymazať „${w.name}" z wishlistu?`)) return;
        await api.delete(`/wishlist/${w.id}`);
        await refresh('wishlist');
    };

    return (
        <>
            <AppHeader
                eyebrow="kam sme boli"
                title="mapa sveta"
                right={
                    <>
                        <button className={'icon-btn' + (searching ? ' green' : '')}
                            onClick={() => { setSearching(!searching); if (searching) setQuery(''); }}>
                            {Icons.search}
                        </button>
                        <button className={'icon-btn' + (sort === 'photos' ? ' green' : '')}
                            onClick={() => setSort(sort === 'az' ? 'photos' : 'az')}>
                            {Icons.filter}
                        </button>
                        <button className="icon-btn green" onClick={() => setAddSheet(true)}>
                            {Icons.plus}
                        </button>
                    </>
                }
            >
                {searching && (
                    <div style={{ position: 'relative', marginTop: 10 }}>
                        <span style={{
                            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                            color: 'var(--muted-2)', display: 'grid', placeItems: 'center',
                        }}>{cloneElement(Icons.search, { style: { width: 16, height: 16 } })}</span>
                        <input value={query} onChange={e => setQuery(e.target.value)} autoFocus
                            placeholder="hľadaj krajinu alebo mesto…"
                            style={{
                                width: '100%', font: 'inherit', fontSize: 14, color: 'var(--ink)',
                                background: 'var(--surface)', border: '0.5px solid var(--line)',
                                borderRadius: 999, padding: '10px 14px 10px 36px', outline: 'none',
                            }} />
                    </div>
                )}
            </AppHeader>
            <div className="scroll">
                {/* Mapa */}
                <div className="card flush" style={{ borderRadius: 'var(--r-lg)' }}>
                    <RealMap markers={pins} height={220} />
                </div>

                {/* Stats duo */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 14 }}>
                    <div className="card" style={{ padding: 14, alignItems: 'center', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                        <div className="num" style={{ fontSize: 32, color: 'var(--green)' }}>{stats?.countries ?? 0}</div>
                        <div className="eyebrow" style={{ fontSize: 9.5 }}>krajín</div>
                    </div>
                    <div className="card" style={{ padding: 14, alignItems: 'center', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                        <div className="num" style={{ fontSize: 32, color: 'var(--green)' }}>{stats?.cities ?? 0}</div>
                        <div className="eyebrow" style={{ fontSize: 9.5 }}>miest</div>
                    </div>
                </div>

                {/* Zoznam krajín */}
                <div className="row between" style={{ margin: '24px 0 8px' }}>
                    <div className="handwritten" style={{ fontSize: 22 }}>Krajiny</div>
                    <span className="eyebrow">{sort === 'az' ? 'A → Z' : 'najviac fotiek'}</span>
                </div>
                {filtered.length === 0 ? (
                    <div className="card" style={{ padding: 24, textAlign: 'center' }}>
                        <div className="handwritten" style={{ fontSize: 20, color: 'var(--muted)' }}>nič sme nenašli</div>
                        <div style={{ fontSize: 12, color: 'var(--muted-2)', marginTop: 4 }}>skús iné slovo</div>
                    </div>
                ) : (
                    <div className="card" style={{ padding: '4px 14px' }}>
                        {filtered.map((c, i) => (
                            <button key={c.id} className="row gap-12" onClick={() => setOpenCountry(c.id)}
                                style={{
                                    padding: '12px 0', width: '100%', alignItems: 'center',
                                    background: 'none', border: 'none', font: 'inherit', color: 'inherit',
                                    cursor: 'pointer', textAlign: 'left',
                                    borderTopWidth: i === 0 ? 0 : 0.5, borderTopStyle: 'solid',
                                    borderTopColor: i === 0 ? 'transparent' : 'var(--line)',
                                }}>
                                <span style={{ fontSize: 22 }}>{c.flag}</span>
                                <div className="col grow" style={{ gap: 2 }}>
                                    <span style={{ fontSize: 13.5, fontWeight: 500 }}>{c.name}</span>
                                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                                        {c.cities.length} {cityWord(c.cities.length)} · {c.photos_count} fotiek
                                    </span>
                                </div>
                                <span style={{ color: 'var(--muted-2)' }}>{Icons.arrow}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Wishlist */}
                <div className="card tint" style={{ marginTop: 16, padding: 14 }}>
                    <div className="row gap-10">
                        <div style={{ fontSize: 22 }}>🗺️</div>
                        <div className="col gap-2 grow" style={{ minWidth: 0 }}>
                            <div className="eyebrow" style={{ color: 'var(--green)' }}>wishlist</div>
                            <div style={{ fontSize: 13.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {wishlist.length ? wishlist.map(w => w.name).join(', ') : 'zatiaľ prázdny — kam pôjdeme?'}
                            </div>
                            <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>
                                {wishlist.length} {destWord(wishlist.length)} na rad
                            </div>
                        </div>
                        <button className="btn ghost" style={{
                            padding: 6, color: 'var(--green)',
                            transform: wlOpen ? 'rotate(90deg)' : 'none', transition: 'transform 200ms ease',
                        }} onClick={() => setWlOpen(!wlOpen)}>{Icons.arrow}</button>
                    </div>

                    {wlOpen && (
                        <div className="col" style={{ marginTop: 10 }}>
                            {wishlist.map((w, i) => (
                                <div key={w.id} className="row gap-10" style={{
                                    padding: '10px 0', alignItems: 'center',
                                    borderTop: i === 0 ? 'none' : '0.5px solid var(--green-line)',
                                }}>
                                    <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{w.flag || '📍'}</span>
                                    <div className="col grow" style={{ gap: 1, minWidth: 0 }}>
                                        <span style={{ fontSize: 13.5, fontWeight: 500 }}>{w.name}</span>
                                        {w.note && <span style={{ fontSize: 11, color: 'var(--muted)' }}>{w.note}</span>}
                                    </div>
                                    <button className="btn ghost" style={{ padding: 4, color: 'var(--muted-2)' }}
                                        onClick={() => removeWish(w)}>
                                        {cloneElement(Icons.close, { style: { width: 14, height: 14 } })}
                                    </button>
                                </div>
                            ))}
                            <form onSubmit={addWish} className="row gap-8" style={{ marginTop: 8 }}>
                                <input value={wlFlag} onChange={e => setWlFlag(e.target.value)}
                                    placeholder="🏳" maxLength={4}
                                    style={{ ...wlInput, width: 44, textAlign: 'center', flexShrink: 0 }} />
                                <input value={wlName} onChange={e => setWlName(e.target.value)}
                                    placeholder="nová destinácia…"
                                    style={{ ...wlInput, flex: 1, minWidth: 0 }} />
                                <button type="submit" className="btn primary" disabled={wlBusy || !wlName.trim()}
                                    style={{ padding: '8px 12px', flexShrink: 0 }}>
                                    {cloneElement(Icons.plus, { style: { width: 15, height: 15 } })}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {openedCountry && (
                <CountryDetail country={openedCountry} onClose={() => setOpenCountry(null)} navigate={navigate} />
            )}

            {addSheet && (
                <AddPlaceSheet countries={countries} onClose={() => setAddSheet(false)} />
            )}
        </>
    );
}

/* ---- Pridanie krajiny / mesta ---- */
function AddPlaceSheet({ countries, onClose }) {
    const { refresh } = useStore();
    const [mode, setMode] = useState('country'); // 'country' | 'city'
    const [name, setName] = useState('');
    const [firstCity, setFirstCity] = useState('');
    const [countryId, setCountryId] = useState(countries[0]?.id ?? null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    const canSave = name.trim().length > 0 && !busy && (mode === 'country' || countryId != null);

    const save = async () => {
        if (!canSave) return;
        setBusy(true);
        setError(null);
        try {
            if (mode === 'country') {
                await api.post('/countries', {
                    name: name.trim(),
                    ...(firstCity.trim() ? { city: firstCity.trim() } : {}),
                });
            } else {
                await api.post(`/countries/${countryId}/cities`, { name: name.trim() });
            }
            await refresh('countries', 'stats');
            onClose();
        } catch (e) {
            setError(e.message || 'Uloženie zlyhalo.');
            setBusy(false);
        }
    };

    return (
        <Sheet onClose={onClose}>
            <div className="row between" style={{ alignItems: 'baseline', marginBottom: 14 }}>
                <div className="col">
                    <div className="eyebrow" style={{ color: 'var(--green)' }}>nové miesto na mape</div>
                    <div style={{ fontSize: 17, fontWeight: 500 }}>Kam pribudlo?</div>
                </div>
                <button className="icon-btn" onClick={onClose}>
                    {cloneElement(Icons.close, { style: { width: 18, height: 18 } })}
                </button>
            </div>

            <div className="row gap-6" style={{ marginBottom: 16 }}>
                <button onClick={() => setMode('country')}
                    className={'chip' + (mode === 'country' ? ' green' : '')}
                    style={{ cursor: 'pointer', border: 'none', font: 'inherit' }}>🌍 Krajina</button>
                <button onClick={() => setMode('city')}
                    className={'chip' + (mode === 'city' ? ' green' : '')}
                    style={{ cursor: 'pointer', border: 'none', font: 'inherit' }}>📍 Mesto</button>
            </div>

            {mode === 'city' && (
                <>
                    <div className="eyebrow" style={{ marginBottom: 8 }}>v ktorej krajine</div>
                    <div className="row gap-6 wrap" style={{ marginBottom: 14 }}>
                        {countries.map(c => (
                            <button key={c.id} onClick={() => setCountryId(c.id)}
                                className={'chip' + (countryId === c.id ? ' green' : '')}
                                style={{ cursor: 'pointer', border: 'none', font: 'inherit' }}>
                                {c.flag} {c.name}
                            </button>
                        ))}
                    </div>
                </>
            )}

            <div className="eyebrow" style={{ marginBottom: 8 }}>
                {mode === 'country' ? 'názov krajiny' : 'názov mesta'}
            </div>
            <input value={name} onChange={e => setName(e.target.value)} autoFocus
                onKeyDown={e => { if (e.key === 'Enter') save(); }}
                placeholder={mode === 'country' ? 'napr. Španielsko' : 'napr. Barcelona'}
                style={{ ...wlInput, width: '100%', fontSize: 15, padding: '13px 14px', marginBottom: 14 }} />

            {mode === 'country' && (
                <>
                    <div className="row between" style={{ marginBottom: 8, alignItems: 'baseline' }}>
                        <div className="eyebrow">prvé mesto</div>
                        <span style={{ fontSize: 11, color: 'var(--muted-2)' }}>voliteľné</span>
                    </div>
                    <input value={firstCity} onChange={e => setFirstCity(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') save(); }}
                        placeholder="napr. Madrid"
                        style={{ ...wlInput, width: '100%', fontSize: 15, padding: '13px 14px', marginBottom: 14 }} />
                    <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 14 }}>
                        Vlajku a polohu na mape doplníme automaticky 🌍
                    </div>
                </>
            )}

            {error && (
                <div style={{ fontSize: 12.5, color: 'var(--accent)', marginBottom: 12, textAlign: 'center' }}>{error}</div>
            )}

            <button className="btn primary" disabled={!canSave} onClick={save}
                style={{ width: '100%', padding: 14, fontSize: 15, opacity: canSave ? 1 : 0.45 }}>
                {busy ? 'ukladám…' : 'pridať na mapu'}
            </button>
        </Sheet>
    );
}

/* ---- Detail krajiny (drill-in overlay) ---- */
function CountryDetail({ country, onClose, navigate }) {
    const { moments, notes, refresh } = useStore();
    const pin = country.lat != null
        ? [{ lat: country.lat, lng: country.lng, label: country.name, active: true }]
        : [];
    const withMoments = country.cities.filter(c => c.momentIds && c.momentIds.length);

    // Chvíľky z tejto krajiny — párujú sa cez label miesta "Mesto · Krajina"
    const notesOfCity = (cityName) => (notes || []).filter(n =>
        (n.place || '').toLowerCase() === `${cityName} · ${country.name}`.toLowerCase());
    const countryNotes = (notes || []).filter(n => {
        const parts = (n.place || '').split(' · ').map(s => s.trim());
        return parts.length === 2 && parts[1].toLowerCase() === country.name.toLowerCase();
    });
    const noteWord = (n) => n === 1 ? 'chvíľka' : n < 5 ? 'chvíľky' : 'chvíľok';

    const deleteCountry = async () => {
        if (!confirm(`Vymazať „${country.name}" z mapy aj so všetkými mestami?`)) return;
        await api.delete(`/countries/${country.id}`);
        await refresh('countries', 'stats');
        onClose();
    };

    const deleteCity = async (city) => {
        if (!confirm(`Vymazať „${city.name}"?`)) return;
        await api.delete(`/countries/${country.id}/cities?name=${encodeURIComponent(city.name)}`);
        await refresh('countries', 'stats');
    };

    return (
        <div style={{
            position: 'absolute', inset: 0, zIndex: 30, background: 'var(--paper)',
            display: 'flex', flexDirection: 'column', animation: 'slideUp 300ms ease both',
        }}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '16px 16px 12px',
            }}>
                <button className="icon-btn" onClick={onClose} style={{ flexShrink: 0 }}>{Icons.back}</button>
                <div className="row gap-8 grow" style={{ alignItems: 'center', minWidth: 0 }}>
                    <span style={{ fontSize: 26 }}>{country.flag}</span>
                    <div className="col" style={{ minWidth: 0 }}>
                        <div className="eyebrow">{country.cities.length} {cityWord(country.cities.length)} · {country.photos_count} fotiek</div>
                        <div style={{ fontSize: 20, fontWeight: 600 }}>{country.name}</div>
                    </div>
                </div>
                <button className="icon-btn" onClick={deleteCountry}
                    style={{ flexShrink: 0, color: 'var(--muted-2)' }}>
                    {Icons.trash}
                </button>
            </div>

            <div className="scroll" style={{ flex: 1 }}>
                {/* Mapa krajiny */}
                <div className="card flush" style={{ borderRadius: 'var(--r-lg)', marginBottom: 18 }}>
                    <RealMap markers={pin} height={150} zoom={6} />
                </div>

                {/* Mestá */}
                <div className="eyebrow" style={{ marginBottom: 10 }}>mestá a miesta</div>
                <div className="card" style={{ padding: '4px 14px', marginBottom: 20 }}>
                    {country.cities.map((ci, i) => {
                        const cityNotes = notesOfCity(ci.name);
                        const linked = ci.momentIds && ci.momentIds.length;
                        return (
                            <button key={ci.name}
                                onClick={linked ? () => navigate('moment:' + ci.momentIds[0])
                                    : cityNotes.length ? () => navigate('momentka:' + cityNotes[0].id) : undefined}
                                className="row gap-12"
                                style={{
                                    padding: '12px 0', width: '100%', alignItems: 'center',
                                    borderTop: i === 0 ? 'none' : '0.5px solid var(--line)',
                                    background: 'none', border: 'none', font: 'inherit', color: 'inherit',
                                    cursor: linked || cityNotes.length ? 'pointer' : 'default', textAlign: 'left',
                                }}>
                                <span style={{ color: 'var(--green)', flexShrink: 0 }}>
                                    {cloneElement(Icons.pin, { style: { width: 17, height: 17 } })}
                                </span>
                                <div className="col grow" style={{ gap: 2 }}>
                                    <span style={{ fontSize: 13.5, fontWeight: 500 }}>{ci.name}</span>
                                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                                        {ci.photos} fotiek
                                        {linked ? ` · ${ci.momentIds.length} ${ci.momentIds.length === 1 ? 'moment' : 'momenty'}` : ''}
                                        {cityNotes.length ? ` · ${cityNotes.length} ${noteWord(cityNotes.length)}` : ''}
                                    </span>
                                </div>
                                <span onClick={(e) => { e.stopPropagation(); deleteCity(ci); }}
                                    role="button"
                                    style={{ color: 'var(--muted-2)', padding: 4, cursor: 'pointer' }}>
                                    {cloneElement(Icons.close, { style: { width: 14, height: 14 } })}
                                </span>
                                {linked ? <span style={{ color: 'var(--muted-2)' }}>{Icons.arrow}</span> : null}
                            </button>
                        );
                    })}
                </div>

                {/* Momenty odtiaľto */}
                {withMoments.length > 0 && (
                    <>
                        <div className="eyebrow" style={{ marginBottom: 10 }}>momenty odtiaľto</div>
                        <div className="col gap-10">
                            {withMoments.flatMap(ci => ci.momentIds).map(slug => {
                                const m = moments.find(mm => mm.slug === slug);
                                if (!m) return null;
                                return (
                                    <button key={slug} className="card flush" onClick={() => navigate('moment:' + slug)}
                                        style={{
                                            display: 'flex', gap: 12, padding: 10, textAlign: 'left', width: '100%',
                                            border: '0.5px solid var(--line)', cursor: 'pointer', alignItems: 'center',
                                            background: 'var(--surface)', font: 'inherit', color: 'inherit',
                                        }}>
                                        <Photo seed={m.seed} url={coverSrc(m)}
                                            style={{ width: 60, height: 60, borderRadius: 12, flexShrink: 0 }} />
                                        <div className="col grow" style={{ minWidth: 0, gap: 3 }}>
                                            <div style={{ fontSize: 14, fontWeight: 500 }}>{m.title}</div>
                                            <div className="eyebrow" style={{ textTransform: 'none', letterSpacing: 0 }}>
                                                {m.date_short} · {m.photos_count} fotiek
                                            </div>
                                        </div>
                                        <span style={{ color: 'var(--muted-2)', flexShrink: 0 }}>{Icons.arrow}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Chvíľky odtiaľto */}
                {countryNotes.length > 0 && (
                    <>
                        <div className="eyebrow" style={{ margin: '20px 0 10px' }}>chvíľky odtiaľto</div>
                        <div className="col gap-8">
                            {countryNotes.map(n => (
                                <button key={n.id} onClick={() => navigate('momentka:' + n.id)} className="row gap-10" style={{
                                    alignItems: 'flex-start', padding: '10px 13px', textAlign: 'left', width: '100%',
                                    background: 'var(--green-soft)', borderRadius: 12, border: 'none',
                                    font: 'inherit', color: 'inherit', cursor: 'pointer',
                                }}>
                                    {n.photo_thumb_url
                                        ? <Photo url={n.photo_thumb_url} style={{ width: 40, height: 40, borderRadius: 9, flexShrink: 0 }} />
                                        : <span style={{ color: 'var(--green)', fontSize: 14, lineHeight: '19px', flexShrink: 0 }}>✎</span>}
                                    <div className="col" style={{ gap: 3, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, lineHeight: 1.45 }}>{n.text}</div>
                                        <div className="eyebrow" style={{ color: 'var(--green)' }}>
                                            {n.date_short} · {n.who}{n.place_short ? ` · 📍 ${n.place_short}` : ''}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
