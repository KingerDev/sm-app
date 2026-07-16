// Momentka („chvíľka") — pridanie / úprava mikro-poznámky (podľa design/hifi-momentka.jsx)
import { cloneElement, useRef, useState } from 'react';
import { api, ApiError } from '../api';
import { useStore } from '../store';
import { Icons, Photo } from '../components/shell';
import { toInputDate } from '../lib/dates';

const mkInput = {
    width: '100%', font: 'inherit', fontSize: 15, color: 'var(--ink)',
    background: 'var(--surface)', border: '0.5px solid var(--line)',
    borderRadius: 12, padding: '13px 14px', outline: 'none',
};

export default function Momentka({ id, onBack }) {
    const { user, notes, refresh } = useStore();
    const note = id ? notes.find(n => String(n.id) === String(id)) : null;
    const edit = !!note;

    const defaultWho = user?.name === 'S' || user?.name === 'M' ? user.name : 'spolu';

    const [text, setText] = useState(edit ? note.text : '');
    const [who, setWho] = useState(edit ? note.who : defaultWho);
    const [date, setDate] = useState(edit ? toInputDate(note.date) : toInputDate(new Date()));
    const [file, setFile] = useState(null); // { file, url } — nová fotka
    const [removePhoto, setRemovePhoto] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const fileRef = useRef(null);

    if (id && !note) return null;

    // Aktuálny náhľad fotky: nová vybraná > existujúca (ak nie je odstránená)
    const preview = file ? file.url : (!removePhoto && note?.photo_url) || null;

    const pickFile = (f) => {
        if (!f) return;
        if (file) URL.revokeObjectURL(file.url);
        setFile({ file: f, url: URL.createObjectURL(f) });
        setRemovePhoto(false);
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
            if (date) fd.append('date', date);
            if (file) fd.append('file', file.file);
            if (!file && removePhoto) fd.append('remove_photo', '1');

            // update cez POST — multipart (PHP nespracuje súbory v PATCH)
            await api.post(edit ? `/notes/${note.id}` : '/notes', fd);
            await refresh('notes');
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
                {/* Fotka (nepovinná) */}
                {preview ? (
                    <div style={{ position: 'relative', marginBottom: 18 }}>
                        <Photo url={preview} style={{ height: 150, borderRadius: 16 }} />
                        <div style={{
                            position: 'absolute', inset: 0, borderRadius: 16,
                            background: 'linear-gradient(transparent 45%, rgba(0,0,0,0.4))',
                        }} />
                        <div className="row gap-8" style={{ position: 'absolute', bottom: 12, right: 12 }}>
                            <button className="btn" onClick={() => fileRef.current?.click()} style={{
                                padding: '8px 12px', gap: 6, fontSize: 12.5, background: 'rgba(250,250,247,0.94)',
                                backdropFilter: 'blur(8px)', border: 'none', color: 'var(--ink)',
                            }}>{cloneElement(Icons.img, { style: { width: 15, height: 15 } })} zmeniť</button>
                            <button className="btn" onClick={clearPhoto} style={{
                                padding: '8px 12px', gap: 6, fontSize: 12.5, background: 'rgba(250,250,247,0.94)',
                                backdropFilter: 'blur(8px)', border: 'none', color: 'var(--ink)',
                            }}>{cloneElement(Icons.trash, { style: { width: 15, height: 15 } })} odstrániť</button>
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
        </div>
    );
}
