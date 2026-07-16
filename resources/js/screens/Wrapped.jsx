// Wrapped — fullscreen story prehrávač, mesačný aj ročný (podľa design/hifi-stats.jsx)
import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store';
import { Icons } from '../components/shell';
import Mascot from '../components/Mascot';

// Témy pozadí slidov podľa sezóny
export const SEASON_THEMES = {
    winter: 'linear-gradient(165deg, #1a3a2a 0%, #2d5a3d 100%)',
    spring: 'linear-gradient(165deg, #3a6f4d 0%, #6b8e4e 100%)',
    summer: 'linear-gradient(165deg, #2d5a3d 0%, #b85a1b 200%)',
    autumn: 'linear-gradient(165deg, #6f3a14 0%, #2d5a3d 100%)',
};

// Slidy pre mesačný Wrapped — m je objekt z API (snake_case)
export const monthlySlidesFor = (m) => {
    const bg = SEASON_THEMES[m.season] || SEASON_THEMES.winter;
    return [
        {
            bg, eyebrow: 'S+M Wrapped · ' + m.label,
            big: m.month, bigLabel: m.days_range ? m.days_range + '. dni spolu' : m.label,
            body: m.headline ? m.headline.charAt(0).toUpperCase() + m.headline.slice(1) + '.' : '',
            sign: m.is_top ? '★' : '·',
        },
        {
            bg, eyebrow: 'top moment',
            big: m.top_moment_title || m.month,
            bigLabel: m.top_moment_place ? '📍 ' + m.top_moment_place : '',
            body: 'Najdôležitejšia chvíľa mesiaca.',
        },
        {
            bg, eyebrow: 'v číslach',
            big: m.photos_count, bigLabel: m.photos_count === 1 ? 'fotka' : 'fotiek za mesiac',
            body: (m.top_day ? 'Najviac · ' + m.top_day + ' (' + m.top_day_count + ' fotiek).' : '') +
                (m.bucket_count > 0 ? '\nA ' + m.bucket_count + '× bucket: ' + m.bucket_txt + '.' : ''),
        },
        {
            bg, eyebrow: 'a posledná vec',
            big: 'ďakujem', bigLabel: m.month,
            body: m.outro,
            sign: '♡', last: true,
        },
    ];
};

// Ročné slidy zo živých dát (stats + wrapped)
const buildYearlySlides = (stats, wrapped) => {
    const year = new Date().getFullYear();
    const top = wrapped.find(w => w.is_top);
    const tm = stats?.top_month;
    const slides = [];

    slides.push({
        bg: 'linear-gradient(165deg, #2d5a3d 0%, #1a3a2a 100%)',
        eyebrow: `S+M Wrapped ${year}`,
        big: (stats?.days_together ?? 0).toLocaleString('sk-SK'),
        bigLabel: 'dní spolu',
        body: 'A každý jeden bol pre vás malou kapitolou.',
        sign: '♡',
    });

    if (tm) {
        const avg = (tm.photos / 30).toLocaleString('sk-SK', { maximumFractionDigits: 1 });
        slides.push({
            bg: 'linear-gradient(165deg, #b85a1b 0%, #6f3a14 100%)',
            eyebrow: 'najfoto mesiac',
            big: tm.name,
            bigLabel: `${tm.photos} fotiek za mesiac`,
            body: `To je asi ${avg} záberov denne.` +
                (top?.top_day ? ` Najviac · ${top.top_day} (${top.top_day_count} fotiek).` : ''),
            sign: '◉',
        });
    }

    slides.push({
        bg: 'linear-gradient(165deg, #2d5a3d 0%, #5a7a4a 100%)',
        eyebrow: 'krajiny ✦',
        big: stats?.countries ?? 0,
        bigLabel: `krajín · ${stats?.cities ?? 0} miest`,
        body: 'Každé z tých miest stálo za to.',
        sign: '✈',
    });

    slides.push({
        bg: 'linear-gradient(165deg, #1a3a2a 0%, #2d5a3d 100%)',
        eyebrow: 'fotky',
        big: (stats?.photos ?? 0).toLocaleString('sk-SK'),
        bigLabel: 'fotiek spolu',
        body: top?.top_moment_title
            ? `Najkrajšia chvíľa · ${top.top_moment_title}${top.top_moment_place ? ' (' + top.top_moment_place + ')' : ''}.`
            : 'A každá z nich je malý dôkaz.',
        sign: '★',
    });

    slides.push({
        bg: 'linear-gradient(165deg, #2d5a3d 0%, #1a3a2a 100%)',
        eyebrow: 'bucket list',
        big: stats?.bucket_done ?? 0,
        bigLabel: `splnených z ${stats?.bucket_total ?? 0}`,
        body: stats?.bucket_total
            ? `To je ${Math.round(stats.bucket_done / stats.bucket_total * 100)} % vášho zoznamu snov.`
            : 'Zoznam snov ešte len začína.',
        sign: '✓',
    });

    slides.push({
        bg: 'linear-gradient(165deg, #b85a1b 0%, #2d5a3d 100%)',
        eyebrow: 'a posledná vec',
        big: 'spolu',
        bigLabel: 'a o rok zas',
        body: 'Bola to dobrá éra. Ďalší rok ide.',
        sign: '♡',
        last: true,
    });

    return slides;
};

const bigFontSize = (s) => {
    const len = String(s).length;
    if (len > 9) return 50;
    if (len > 7) return 64;
    if (len > 5) return 80;
    return 110;
};

export default function Wrapped({ slides, kind = 'yearly', onExit }) {
    const { stats, settings, wrapped } = useStore();
    const allSlides = useMemo(
        () => slides || buildYearlySlides(stats, wrapped),
        [slides, stats, wrapped],
    );

    const [idx, setIdx] = useState(0);
    const [paused, setPaused] = useState(false);
    const slide = allSlides[idx];

    // Progress prvého slajdu: transition sa pri prvom vykreslení nespustí (element
    // by naskočil rovno na 100 %) — najskôr vykreslíme 0 % a o frame neskôr pustíme animáciu
    const [armed, setArmed] = useState(false);
    useEffect(() => {
        const id = requestAnimationFrame(() => requestAnimationFrame(() => setArmed(true)));
        return () => cancelAnimationFrame(id);
    }, []);

    useEffect(() => {
        if (paused || !armed) return;
        const t = setTimeout(() => {
            if (idx < allSlides.length - 1) setIdx(idx + 1);
        }, 6000);
        return () => clearTimeout(t);
    }, [idx, paused, armed, allSlides.length]);

    const next = () => idx < allSlides.length - 1 ? setIdx(idx + 1) : onExit();
    const prev = () => idx > 0 && setIdx(idx - 1);

    return (
        <div style={{
            position: 'absolute', inset: 0,
            background: slide.bg,
            color: 'var(--paper)',
            display: 'flex', flexDirection: 'column',
            padding: 'calc(24px + env(safe-area-inset-top)) 24px calc(32px + env(safe-area-inset-bottom))',
            zIndex: 50,
            transition: 'background 800ms ease',
        }}
            onMouseDown={() => setPaused(true)}
            onMouseUp={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
            onTouchCancel={() => setPaused(false)}
        >
            {/* progress */}
            <div className="row gap-6" style={{ marginBottom: 24 }}>
                {allSlides.map((_, i) => (
                    <div key={i} className="grow" style={{
                        height: 2.5, borderRadius: 2,
                        background: 'rgba(255,255,255,0.3)',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            width: i < idx ? '100%' : i === idx ? (paused ? '50%' : armed ? '100%' : '0%') : '0%',
                            height: '100%', background: 'var(--paper)',
                            transition: i === idx ? (paused || !armed ? 'none' : 'width 6000ms linear') : 'width 200ms',
                        }} />
                    </div>
                ))}
            </div>
            <div className="row between" style={{ marginBottom: 'auto', position: 'relative', zIndex: 2 }}>
                <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {slide.eyebrow}
                </div>
                <button className="icon-btn" style={{
                    background: 'rgba(255,255,255,0.15)', border: 'none', color: 'var(--paper)',
                    width: 32, height: 32,
                }} onClick={(e) => { e.stopPropagation(); onExit(); }}>{Icons.close}</button>
            </div>

            {/* Obsah */}
            <div className="col gap-16" style={{ flex: 1, justifyContent: 'center' }}>
                {slide.last && (
                    <div style={{ alignSelf: 'flex-start', marginBottom: 8 }}>
                        <Mascot variant={settings.mascot_variant || 'pebbles'} size={80} animated />
                    </div>
                )}
                <div className="num" style={{
                    fontSize: bigFontSize(slide.big),
                    lineHeight: 0.9,
                    color: 'var(--paper)',
                }}>{slide.big}</div>
                <div style={{ fontSize: 16, opacity: 0.95, marginTop: -4 }}>
                    {slide.bigLabel}
                </div>
                <div style={{
                    fontSize: 14, opacity: 0.85, lineHeight: 1.5,
                    maxWidth: 280,
                    whiteSpace: 'pre-line',
                }}>{slide.body}</div>
            </div>

            {/* Spodok */}
            <div className="row between" style={{ marginTop: 24 }}>
                <div className="handwritten" style={{ color: 'var(--paper)', opacity: 0.85, fontSize: 18 }}>
                    S + M
                </div>
                <div className="row gap-8">
                    {slide.last && (
                        <button className="btn invert" style={{ padding: '8px 14px', fontSize: 12 }}
                            onClick={onExit}>
                            {Icons.heart} hotovo
                        </button>
                    )}
                </div>
            </div>

            {/* Tap zóny (vľavo späť, vpravo ďalej) — začínajú pod hornou lištou s × */}
            <div style={{ position: 'absolute', top: 120, bottom: 80, left: 0, width: '35%', cursor: 'pointer' }}
                onClick={prev} />
            <div style={{ position: 'absolute', top: 120, bottom: 80, right: 0, width: '35%', cursor: 'pointer' }}
                onClick={next} />
        </div>
    );
}
