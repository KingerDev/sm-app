// Výber výrezu fotky — živý náhľad karty (moment / chvíľka).
// Fotkou sa dá hýbať (drag), približovať (pinch / koliesko / slider); čo vidíš, to sa uloží.
import { cloneElement, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from './shell';

const MAX_ZOOM = 5;
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export default function CoverPicker({
    file, eyebrow, title, onCancel, onSave,
    aspect = '7 / 4', maxWidth = 380, saveLabel = 'použiť ako titulnú',
}) {
    const [url] = useState(() => URL.createObjectURL(file));
    const [img, setImg] = useState(null); // { w, h } — prirodzené rozmery fotky
    const [frame, setFrame] = useState(null); // { w, h } — rozmery výrezu na obrazovke
    const [view, setView] = useState(null); // { s, ox, oy } — mierka + posun fotky v ráme
    const [busy, setBusy] = useState(false);
    const frameRef = useRef(null);
    const imgElRef = useRef(null);
    const pointers = useRef(new Map()); // aktívne prsty/kurzor
    const gesture = useRef(null); // { type: 'pan'|'pinch', ... }

    useEffect(() => () => URL.revokeObjectURL(url), [url]);

    // Načítaj fotku (kvôli rozmerom a kresleniu do canvasu)
    useEffect(() => {
        const el = new Image();
        el.onload = () => {
            imgElRef.current = el;
            setImg({ w: el.naturalWidth, h: el.naturalHeight });
        };
        el.src = url;
    }, [url]);

    // Zmeraj rám náhľadu
    useLayoutEffect(() => {
        const measure = () => {
            const r = frameRef.current?.getBoundingClientRect();
            if (r?.width) setFrame({ w: r.width, h: r.height });
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    // Minimálna mierka = fotka presne vyplní rám (žiadne prázdne okraje)
    const minScale = img && frame ? Math.max(frame.w / img.w, frame.h / img.h) : 1;

    // Štart: vycentrovaná fotka na minimálnej mierke
    useEffect(() => {
        if (img && frame && !view) {
            setView({
                s: minScale,
                ox: (frame.w - img.w * minScale) / 2,
                oy: (frame.h - img.h * minScale) / 2,
            });
        }
    }, [img, frame, view, minScale]);

    // Posun drž v medziach — fotka musí vždy pokrývať celý rám
    const clamp = (v) => ({
        s: v.s,
        ox: Math.min(0, Math.max(frame.w - img.w * v.s, v.ox)),
        oy: Math.min(0, Math.max(frame.h - img.h * v.s, v.oy)),
    });

    // Zoom okolo bodu (fx, fy) v súradniciach rámu
    const zoomAround = (nextScale, fx, fy) => setView(v => {
        if (!v) return v;
        const s = Math.min(Math.max(nextScale(v.s), minScale), minScale * MAX_ZOOM);
        return clamp({
            s,
            ox: fx - (fx - v.ox) * (s / v.s),
            oy: fy - (fy - v.oy) * (s / v.s),
        });
    });

    /* ---- Gestá: drag jedným prstom, pinch dvomi ---- */
    const onPointerDown = (e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const pts = [...pointers.current.values()];
        gesture.current = pts.length >= 2
            ? { type: 'pinch', d: dist(pts[0], pts[1]) }
            : { type: 'pan', x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e) => {
        if (!pointers.current.has(e.pointerId) || !view) return;
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const pts = [...pointers.current.values()];
        const g = gesture.current;

        if (g?.type === 'pan' && pts.length === 1) {
            const dx = e.clientX - g.x;
            const dy = e.clientY - g.y;
            gesture.current = { type: 'pan', x: e.clientX, y: e.clientY };
            setView(v => clamp({ ...v, ox: v.ox + dx, oy: v.oy + dy }));
        } else if (g?.type === 'pinch' && pts.length >= 2) {
            const d = dist(pts[0], pts[1]);
            if (!d || !g.d) return;
            const rect = frameRef.current.getBoundingClientRect();
            const fx = (pts[0].x + pts[1].x) / 2 - rect.left;
            const fy = (pts[0].y + pts[1].y) / 2 - rect.top;
            const factor = d / g.d;
            gesture.current = { type: 'pinch', d };
            zoomAround(s => s * factor, fx, fy);
        }
    };

    const onPointerUp = (e) => {
        pointers.current.delete(e.pointerId);
        const pts = [...pointers.current.values()];
        gesture.current = pts.length === 1
            ? { type: 'pan', x: pts[0].x, y: pts[0].y }
            : null;
    };

    // Koliesko myši — natívny listener (React wheel je pasívny, preventDefault by nefungoval)
    useEffect(() => {
        const el = frameRef.current;
        if (!el || !frame || !img) return;
        const onWheel = (e) => {
            e.preventDefault();
            const rect = el.getBoundingClientRect();
            zoomAround(s => s * Math.exp(-e.deltaY * 0.002), e.clientX - rect.left, e.clientY - rect.top);
        };
        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [frame, img, minScale]);

    /* ---- Uloženie: vykresli viditeľný výrez do canvasu ---- */
    const save = () => {
        if (busy || !view || !imgElRef.current) return;
        setBusy(true);
        const { s, ox, oy } = view;
        const sx = -ox / s;
        const sy = -oy / s;
        const sw = frame.w / s;
        const sh = frame.h / s;
        const outW = Math.min(Math.round(sw), 2560);
        const outH = Math.round(outW * sh / sw);

        const canvas = document.createElement('canvas');
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(imgElRef.current, sx, sy, sw, sh, 0, 0, outW, outH);

        canvas.toBlob((blob) => {
            if (!blob) { setBusy(false); return; }
            onSave(new File([blob], 'vyrez.jpg', { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.92);
    };

    const reset = () => {
        if (!img || !frame) return;
        setView({
            s: minScale,
            ox: (frame.w - img.w * minScale) / 2,
            oy: (frame.h - img.h * minScale) / 2,
        });
    };

    const zoomValue = view ? view.s / minScale : 1;

    // Portál na .app-frame — nech prekryje aj tab bar, nech je jedno, odkiaľ sa otvára
    return createPortal(
        <div style={{
            position: 'absolute', inset: 0, zIndex: 70,
            background: 'rgba(12, 16, 13, 0.97)',
            display: 'flex', flexDirection: 'column',
            animation: 'fadeIn 180ms ease both',
        }}>
            {/* Horná lišta */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
                <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.75)' }}>výrez fotky</span>
                <button className="icon-btn" style={{
                    background: 'rgba(250,250,247,0.12)', border: 'none', color: 'var(--paper)',
                    backdropFilter: 'blur(6px)',
                }} onClick={onCancel}>{Icons.close}</button>
            </div>

            {/* Náhľad karty — presne takto bude vyzerať */}
            <div style={{ flex: 1, minHeight: 0, display: 'grid', placeItems: 'center', padding: '0 20px' }}>
                <div style={{ width: '100%', maxWidth }}>
                    <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 8, textAlign: 'center' }}>
                        náhľad · takto bude vyzerať
                    </div>
                    <div style={{
                        background: 'var(--surface)', borderRadius: 16, overflow: 'hidden',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
                    }}>
                        <div ref={frameRef}
                            onPointerDown={onPointerDown}
                            onPointerMove={onPointerMove}
                            onPointerUp={onPointerUp}
                            onPointerCancel={onPointerUp}
                            style={{
                                aspectRatio: aspect, position: 'relative', overflow: 'hidden',
                                touchAction: 'none', cursor: 'grab', background: 'var(--line-soft)',
                            }}>
                            {view && (
                                <img src={url} alt="" draggable={false} style={{
                                    position: 'absolute', left: view.ox, top: view.oy,
                                    width: img.w * view.s, height: img.h * view.s,
                                    maxWidth: 'none', userSelect: 'none', pointerEvents: 'none',
                                }} />
                            )}
                        </div>
                        {(eyebrow || title) && (
                            <div style={{ padding: '12px 14px 14px' }}>
                                {eyebrow && <div className="eyebrow">{eyebrow}</div>}
                                {title && (
                                    <div style={{
                                        fontSize: 17, fontWeight: 500, color: 'var(--ink)', marginTop: 2,
                                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                    }}>{title}</div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="handwritten" style={{ textAlign: 'center', marginTop: 12, fontSize: 16, color: 'rgba(255,255,255,0.6)' }}>
                        potiahni fotku · priblíž prstami ✎
                    </div>
                </div>
            </div>

            {/* Zoom + uložiť */}
            <div style={{ padding: '12px 20px calc(18px + var(--safe-bottom))' }}>
                <div className="row gap-10" style={{ alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1, flexShrink: 0 }}>−</span>
                    <input type="range" min={1} max={MAX_ZOOM} step={0.01} value={zoomValue}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            zoomAround(() => minScale * val, frame.w / 2, frame.h / 2);
                        }}
                        style={{ flex: 1, accentColor: 'var(--paper)' }} />
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 17, lineHeight: 1, flexShrink: 0 }}>+</span>
                </div>
                <div className="row gap-8">
                    <button className="btn ghost" onClick={reset}
                        style={{ padding: '12px 16px', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                        reset
                    </button>
                    <button className="btn invert" onClick={save} disabled={busy || !view}
                        style={{ flex: 1, padding: '13px', fontSize: 14.5, justifyContent: 'center' }}>
                        {busy ? 'ukladám…' : <>{cloneElement(Icons.check, { style: { width: 16, height: 16 } })} {saveLabel}</>}
                    </button>
                </div>
            </div>
        </div>,
        document.querySelector('.app-frame') || document.body
    );
}
