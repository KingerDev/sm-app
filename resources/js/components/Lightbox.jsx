// Lightbox — fullscreen prehliadač fotiek s listovaním (šípky, swipe, klávesnica)
import { cloneElement, useCallback, useEffect, useRef, useState } from 'react';
import { Icons } from './shell';

export default function Lightbox({ items, index, onClose, onTogglePin, onDelete, onSetCover }) {
    const [i, setI] = useState(index ?? 0);
    const touchX = useRef(null);

    const prev = useCallback(() => setI(v => (v - 1 + items.length) % items.length), [items.length]);
    const next = useCallback(() => setI(v => (v + 1) % items.length), [items.length]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose, prev, next]);

    // Keď sa zmaže posledná fotka, zavri; inak drž index v rozsahu
    useEffect(() => {
        if (!items.length) onClose();
        else if (i > items.length - 1) setI(items.length - 1);
    }, [items.length, i, onClose]);

    const photo = items[Math.min(i, items.length - 1)];
    if (!photo) return null;

    const navBtn = (side, onClick, icon) => (
        <button onClick={onClick} style={{
            position: 'absolute', [side]: 8, top: '50%', transform: 'translateY(-50%)',
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(250,250,247,0.12)', border: 'none', cursor: 'pointer',
            display: 'grid', placeItems: 'center', color: 'var(--paper)',
            backdropFilter: 'blur(6px)', zIndex: 2,
        }}>{cloneElement(icon, { style: { width: 20, height: 20 } })}</button>
    );

    return (
        <div
            style={{
                position: 'absolute', inset: 0, zIndex: 60,
                background: 'rgba(12, 16, 13, 0.96)',
                display: 'flex', flexDirection: 'column',
                animation: 'fadeIn 180ms ease both',
            }}
            onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
                if (touchX.current === null) return;
                const dx = e.changedTouches[0].clientX - touchX.current;
                touchX.current = null;
                if (Math.abs(dx) > 40) (dx > 0 ? prev() : next());
            }}
        >
            {/* Horná lišta */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', zIndex: 2,
            }}>
                <span className="mono" style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
                    {i + 1} / {items.length}
                </span>
                <div className="row gap-8">
                    {photo.real && onSetCover && (
                        photo.cover ? (
                            <span style={{
                                alignSelf: 'center', fontSize: 10.5, letterSpacing: 1,
                                textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)',
                                background: 'rgba(250,250,247,0.14)', padding: '6px 10px',
                                borderRadius: 999, backdropFilter: 'blur(6px)',
                            }}>titulná ✓</span>
                        ) : (
                            <button onClick={() => onSetCover(photo)} style={{
                                border: 'none', cursor: 'pointer', font: 'inherit',
                                fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase',
                                color: 'var(--paper)', background: 'rgba(250,250,247,0.14)',
                                padding: '6px 10px', borderRadius: 999, backdropFilter: 'blur(6px)',
                            }}>nastaviť ako titulnú</button>
                        )
                    )}
                    {photo.real && onTogglePin && (
                        <button className="icon-btn" style={lbBtn} onClick={() => onTogglePin(photo)}>
                            {cloneElement(photo.pinned ? Icons.heartFill : Icons.heart, { style: { width: 18, height: 18 } })}
                        </button>
                    )}
                    {photo.real && onDelete && (
                        <button className="icon-btn" style={lbBtn} onClick={() => onDelete(photo)}>
                            {cloneElement(Icons.trash, { style: { width: 18, height: 18 } })}
                        </button>
                    )}
                    <button className="icon-btn" style={lbBtn} onClick={onClose}>{Icons.close}</button>
                </div>
            </div>

            {/* Fotka */}
            <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'grid', placeItems: 'center' }}
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
                <img src={photo.url} alt=""
                    style={{
                        maxWidth: '100%', maxHeight: '100%',
                        objectFit: 'contain', userSelect: 'none',
                        animation: 'fadeIn 160ms ease both',
                    }}
                    key={photo.id}
                    draggable={false} />
                {items.length > 1 && navBtn('left', prev, Icons.back)}
                {items.length > 1 && navBtn('right', next, Icons.arrow)}
            </div>

            {/* Bodky */}
            {items.length > 1 && items.length <= 12 && (
                <div className="row" style={{ justifyContent: 'center', gap: 6, padding: '12px 0 18px' }}>
                    {items.map((p, j) => (
                        <button key={p.id} onClick={() => setI(j)} style={{
                            width: j === i ? 18 : 6, height: 6, borderRadius: 3,
                            background: j === i ? 'var(--paper)' : 'rgba(255,255,255,0.35)',
                            border: 'none', cursor: 'pointer', padding: 0,
                            transition: 'width 200ms ease',
                        }} />
                    ))}
                </div>
            )}
        </div>
    );
}

const lbBtn = {
    background: 'rgba(250,250,247,0.12)',
    border: 'none',
    color: 'var(--paper)',
    backdropFilter: 'blur(6px)',
};
