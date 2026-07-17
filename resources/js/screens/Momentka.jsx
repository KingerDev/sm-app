// Momentka („chvíľka") — pridanie / úprava mikro-poznámky (podľa design/hifi-momentka.jsx)
import { cloneElement, useRef, useState } from 'react';
import { api, ApiError } from '../api';
import { useStore } from '../store';
import { Icons, Photo } from '../components/shell';
import CoverPicker from '../components/CoverPicker';
import { PlacePicker } from './MomentForm';
import { formatDateShortSk, toInputDate } from '../lib/dates';

// "Viedeň · Rakúsko" → mesto + krajina (pre prepojenie s mapou)
export const parsePlace = (label) => {
    const parts = (label || '').split(' · ').map(s => s.trim());
    return parts.length === 2 ? { city: parts[0], country: parts[1] } : { city: '', country: '' };
};

const mkInput = {
    width: '100%', font: 'inherit', fontSize: 15, color: 'var(--ink)',
    background: 'var(--surface)', border: '0.5px solid var(--line)',
    borderRadius: 12, padding: '13px 14px', outline: 'none',
};

const mkPhotoBtn = {
    justifyContent: 'flex-start', padding: '9px 12px', gap: 8, fontSize: 12.5,
    background: 'var(--surface)', border: '0.5px solid var(--line)', color: 'var(--ink)',
};

export default function Momentka({ id, onBack }) {
    const { user, notes, moments, countries, refresh } = useStore();
    const note = id ? notes.find(n => String(n.id) === String(id)) : null;
    const edit = !!note;

    const defaultWho = user?.name === 'S' || user?.name === 'M' ? user.name : 'spolu';

    const [text, setText] = useState(edit ? note.text : '');
    const [who, setWho] = useState(edit ? note.who : defaultWho);
    const [place, setPlace] = useState(edit ? (note.place || '') : '');
    const [placeShort, setPlaceShort] = useState(edit ? (note.place_short || '') : '');
    const [placeCity, setPlaceCity] = useState(edit ? parsePlace(note.place).city : '');
    const [placeCountry, setPlaceCountry] = useState(edit ? parsePlace(note.place).country : '');
    const [placeSheet, setPlaceSheet] = useState(false);
    const [date, setDate] = useState(edit ? toInputDate(note.date) : toInputDate(new Date()));
    const [file, setFile] = useState(null); // { file, url } — nová fotka (už orezaná)
    const [crop, setCrop] = useState(null); // File — fotka čakajúca na výber výrezu
    const [removePhoto, setRemovePhoto] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const fileRef = useRef(null);

    if (id && !note) return null;

    // Aktuálny náhľad fotky: nová vybraná > existujúca (ak nie je odstránená)
    const preview = file ? file.url : (!removePhoto && note?.photo_url) || null;

    // Vybraná fotka ide najskôr do výberu výrezu (chvíľky sa zobrazujú vo štvorci)
    const pickFile = (f) => {
        if (f) setCrop(f);
    };
    const applyCrop = (cropped) => {
        if (file) URL.revokeObjectURL(file.url);
        setFile({ file: cropped, url: URL.createObjectURL(cropped) });
        setRemovePhoto(false);
        setCrop(null);
    };
    // Úprava výrezu aktuálnej fotky (ťuknutím na náhľad)
    const recrop = async () => {
        if (!preview) return;
        try {
            const blob = await (await fetch(preview)).blob();
            setCrop(new File([blob], 'chvilka.jpg', { type: blob.type || 'image/jpeg' }));
        } catch {
            setError('Fotku sa nepodarilo načítať.');
        }
    };
    const clearPhoto = () => {
        if (file) URL.revokeObjectURL(file.url);
        setFile(null);
        setRemovePhoto(true);
    };

    const canSave = text.trim().length > 0 && !busy;

    const save = async () => {
        if (!canSave) return;
        setBusy(true);
        setError(null);
        try {
            const fd = new FormData();
            fd.append('text', text.trim());
            fd.append('who', who);
            fd.append('place', place.trim());
            if (placeShort.trim()) fd.append('place_short', placeShort.trim());
            // Prepojenie na mapu — založí krajinu/mesto ak treba
            if (placeCity.trim() && placeCountry.trim()) {
                fd.append('city', placeCity.trim());
                fd.append('country', placeCountry.trim());
            }
            if (date) fd.append('date', date);
            if (file) fd.append('file', file.file);
            if (!file && removePhoto) fd.append('remove_photo', '1');

            // update cez POST — multipart (PHP nespracuje súbory v PATCH)
            await api.post(edit ? `/notes/${note.id}` : '/notes', fd);
            await refresh('notes', 'countries', 'stats');
            if (file) URL.revokeObjectURL(file.url);
            onBack();
        } catch (e) {
            const first = e instanceof ApiError && Object.values(e.errors)[0]?.[0];
            setError(first || e.message || 'Uloženie zlyhalo.');
            setBusy(false);
        }
    };

    const destroy = async () => {
        if (!confirm('Naozaj zmazať túto chvíľku?')) return;
        setBusy(true);
        setError(null);
        try {
            await api.delete(`/notes/${note.id}`);
            await refresh('notes');
            onBack();
        } catch (e) {
            setError(e.message || 'Zmazanie zlyhalo.');
            setBusy(false);
        }
    };

    return (
        <div className="col" style={{ height: '100%', background: 'var(--paper)' }}>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={(e) => { pickFile(e.target.files?.[0]); e.target.value = ''; }} />

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
                {/* Fotka (nepovinná) — štvorec, tak ako sa chvíľka zobrazuje v appke */}
                {preview ? (
                    <div className="row gap-12" style={{ marginBottom: 18, alignItems: 'flex-start' }}>
                        <Photo url={preview} onClick={recrop}
                            style={{ width: 160, height: 160, borderRadius: 16, flexShrink: 0, cursor: 'pointer' }} />
                        <div className="col gap-8" style={{ flex: 1 }}>
                            <button className="btn" onClick={recrop} style={mkPhotoBtn}>
                                {cloneElement(Icons.edit, { style: { width: 15, height: 15 } })} upraviť výrez
                            </button>
                            <button className="btn" onClick={() => fileRef.current?.click()} style={mkPhotoBtn}>
                                {cloneElement(Icons.img, { style: { width: 15, height: 15 } })} zmeniť fotku
                            </button>
                            <button className="btn" onClick={clearPhoto} style={{ ...mkPhotoBtn, color: '#a4443a' }}>
                                {cloneElement(Icons.trash, { style: { width: 15, height: 15 } })} odstrániť
                            </button>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => fileRef.current?.click()} style={{
                        width: '100%', border: '1.5px dashed var(--green-line)', borderRadius: 16,
                        background: 'var(--green-soft)', padding: '16px', marginBottom: 18,
                        display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                        font: 'inherit', textAlign: 'left',
                    }}>
                        <span style={{
                            width: 38, height: 38, borderRadius: '50%', background: 'var(--green)',
                            display: 'grid', placeItems: 'center', color: 'var(--paper)', flexShrink: 0,
                        }}>{cloneElement(Icons.img, { style: { width: 19, height: 19 } })}</span>
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

                {/* Miesto (nepovinné) — výber ako pri momentoch, prepája sa s mapou */}
                <div className="eyebrow" style={{ marginBottom: 10 }}>kde</div>
                <div className="row gap-8" style={{ marginBottom: 18 }}>
                    <button onClick={() => setPlaceSheet(true)} style={{
                        ...mkInput, paddingLeft: 42, position: 'relative', flex: 1,
                        display: 'flex', alignItems: 'center', textAlign: 'left', cursor: 'pointer',
                        color: place ? 'var(--ink)' : 'var(--muted-2)',
                    }}>
                        <span style={{
                            position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                            color: 'var(--muted-2)', display: 'grid', placeItems: 'center', pointerEvents: 'none',
                        }}>{cloneElement(Icons.pin, { style: { width: 18, height: 18 } })}</span>
                        <span className="grow">{place || 'vyber miesto (nepovinné)'}</span>
                        <span style={{ color: 'var(--muted-2)' }}>
                            {cloneElement(Icons.arrow, { style: { width: 16, height: 16 } })}
                        </span>
                    </button>
                    {place && (
                        <button className="icon-btn" title="zrušiť miesto" onClick={() => {
                            setPlace(''); setPlaceShort(''); setPlaceCity(''); setPlaceCountry('');
                        }} style={{ flexShrink: 0, alignSelf: 'center', color: 'var(--muted-2)' }}>
                            {cloneElement(Icons.close, { style: { width: 16, height: 16 } })}
                        </button>
                    )}
                </div>

                {/* Dátum */}
                <div className="eyebrow" style={{ marginBottom: 10 }}>kedy</div>
                <div style={{ position: 'relative', marginBottom: 18 }}>
                    <span style={{
                        position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                        color: 'var(--muted-2)', display: 'grid', placeItems: 'center', pointerEvents: 'none',
                    }}>{cloneElement(Icons.cal, { style: { width: 18, height: 18 } })}</span>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                        style={{ ...mkInput, paddingLeft: 42, WebkitAppearance: 'none', appearance: 'none' }} />
                </div>

                {/* Kto pridal */}
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
                    <button className="btn" onClick={destroy} disabled={busy} style={{
                        width: '100%', padding: '12px', gap: 8, color: '#a4443a',
                        borderColor: 'rgba(164,68,58,0.25)', background: 'rgba(164,68,58,0.06)',
                    }}>{cloneElement(Icons.trash, { style: { width: 16, height: 16 } })} zmazať chvíľku</button>
                )}

                {error && (
                    <div style={{ marginTop: 14, fontSize: 12.5, color: 'var(--accent)', textAlign: 'center' }}>{error}</div>
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
                    style={{
                        width: '100%', padding: '15px', fontSize: 15,
                        opacity: canSave ? 1 : 0.45, cursor: canSave ? 'pointer' : 'default',
                    }}>
                    {busy ? 'ukladám…' : (edit ? 'uložiť zmeny' : 'uložiť chvíľku')}
                </button>
            </div>

            {/* Výber výrezu fotky — živý štvorcový náhľad ako v galérii */}
            {crop && (
                <CoverPicker
                    file={crop}
                    aspect="1 / 1"
                    maxWidth={300}
                    eyebrow={`${date ? formatDateShortSk(date) : ''} · ${who}${placeShort.trim() ? ` · 📍 ${placeShort.trim()}` : ''} · chvíľka`}
                    title={text.trim() || (edit ? 'chvíľka' : 'nová chvíľka')}
                    saveLabel="použiť fotku"
                    onCancel={() => setCrop(null)}
                    onSave={applyCrop}
                />
            )}

            {placeSheet && (
                <PlacePicker
                    current={place}
                    countries={countries}
                    moments={moments}
                    onClose={() => setPlaceSheet(false)}
                    onPick={(p) => {
                        setPlace(p.label);
                        setPlaceShort(p.short);
                        setPlaceCity(p.city || '');
                        setPlaceCountry(p.country || '');
                        setPlaceSheet(false);
                    }}
                />
            )}
        </div>
    );
}
