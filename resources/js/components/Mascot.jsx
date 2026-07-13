// Maskot páru S+M — varianty 'pebbles' / 'sprouts' / 'orbits' (podľa design/hifi-mascot.jsx)

export default function Mascot({ variant = 'pebbles', size = 60, animated = true, mood = 'idle' }) {
    if (variant === 'sprouts') return <MascotSprouts size={size} animated={animated} />;
    if (variant === 'orbits') return <MascotOrbits size={size} animated={animated} />;
    return <MascotPebbles size={size} animated={animated} mood={mood} />;
}

const MascotPebbles = ({ size = 60, animated = true, mood = 'idle' }) => {
    const sleeping = mood === 'sleep';
    return (
        <svg viewBox="0 0 80 70" style={{ width: size, height: size * (70 / 80), overflow: 'visible' }}>
            <defs>
                <radialGradient id="mascot-shade-l" cx="35%" cy="30%" r="80%">
                    <stop offset="0%" stopColor="#4a8060" />
                    <stop offset="100%" stopColor="#2d5a3d" />
                </radialGradient>
                <radialGradient id="mascot-shade-r" cx="35%" cy="30%" r="80%">
                    <stop offset="0%" stopColor="#3a6f4d" />
                    <stop offset="100%" stopColor="#1f3f2b" />
                </radialGradient>
            </defs>

            <ellipse cx="40" cy="62" rx="28" ry="3" fill="rgba(20, 30, 22, 0.12)" />

            <g style={animated ? { transformOrigin: '52px 40px', animation: 'mascotBobR 4.4s ease-in-out infinite' } : {}}>
                <path d="M30 32 Q30 12 50 12 Q70 12 70 32 Q70 58 50 58 Q30 58 30 32 Z" fill="url(#mascot-shade-r)" />
                {sleeping ? (
                    <>
                        <path d="M44 30 q3 -3 6 0" stroke="#fafaf7" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                        <path d="M54 30 q3 -3 6 0" stroke="#fafaf7" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                    </>
                ) : (
                    <>
                        <circle cx="46" cy="30" r="2" fill="#fafaf7" />
                        <circle cx="57" cy="30" r="2" fill="#fafaf7" />
                        <circle cx="46.6" cy="30.6" r="0.7" fill="#1a1a18" />
                        <circle cx="57.6" cy="30.6" r="0.7" fill="#1a1a18" />
                    </>
                )}
                <ellipse cx="62" cy="38" rx="2.5" ry="1.4" fill="rgba(255, 180, 140, 0.45)" />
            </g>

            <g style={animated ? { transformOrigin: '24px 42px', animation: 'mascotBobL 4.4s ease-in-out infinite' } : {}}>
                <path d="M5 38 Q5 18 24 18 Q44 18 44 38 Q44 60 24 60 Q5 60 5 38 Z" fill="url(#mascot-shade-l)" />
                {sleeping ? (
                    <>
                        <path d="M16 36 q3 -3 6 0" stroke="#fafaf7" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                        <path d="M26 36 q3 -3 6 0" stroke="#fafaf7" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                    </>
                ) : (
                    <>
                        <circle cx="19" cy="36" r="2.2" fill="#fafaf7" />
                        <circle cx="30" cy="36" r="2.2" fill="#fafaf7" />
                        <circle cx="19.6" cy="36.6" r="0.8" fill="#1a1a18" />
                        <circle cx="30.6" cy="36.6" r="0.8" fill="#1a1a18" />
                    </>
                )}
                <ellipse cx="12" cy="44" rx="2.5" ry="1.4" fill="rgba(255, 180, 140, 0.45)" />
            </g>

            {mood !== 'sleep' && (
                <g style={animated ? { transformOrigin: '40px 14px', animation: 'mascotHeart 3.2s ease-in-out infinite' } : {}}>
                    <path d="M40 12 c-1 -2 -4 -2 -4 1 c0 2 4 4 4 4 c0 0 4 -2 4 -4 c0 -3 -3 -3 -4 -1 z"
                        fill="#b85a1b" opacity="0.85" />
                </g>
            )}
        </svg>
    );
};

const MascotSprouts = ({ size = 60, animated = true }) => (
    <svg viewBox="0 0 60 70" style={{ width: size, height: size * (70 / 60), overflow: 'visible' }}>
        <ellipse cx="30" cy="64" rx="14" ry="2" fill="rgba(20, 30, 22, 0.1)" />
        <path d="M16 60 Q30 64 44 60 L42 62 Q30 66 18 62 Z" fill="#8a6843" />
        <path d="M30 60 Q29 40 30 24" stroke="#2d5a3d" strokeWidth="2" fill="none" strokeLinecap="round" />
        <g style={animated ? { transformOrigin: '30px 38px', animation: 'leafSwayL 5s ease-in-out infinite' } : {}}>
            <path d="M30 38 Q12 36 8 22 Q18 18 30 30 Z" fill="#3a6f4d" />
            <path d="M30 36 Q20 32 12 26" stroke="#2d5a3d" strokeWidth="0.6" fill="none" />
            <circle cx="16" cy="26" r="1.8" fill="#fafaf7" />
            <circle cx="16.4" cy="26.4" r="0.7" fill="#1a1a18" />
        </g>
        <g style={animated ? { transformOrigin: '30px 32px', animation: 'leafSwayR 5s ease-in-out infinite' } : {}}>
            <path d="M30 32 Q48 28 54 14 Q42 12 30 24 Z" fill="#2d5a3d" />
            <path d="M30 30 Q40 24 50 18" stroke="#1f3f2b" strokeWidth="0.6" fill="none" />
            <circle cx="46" cy="20" r="1.8" fill="#fafaf7" />
            <circle cx="46.4" cy="20.4" r="0.7" fill="#1a1a18" />
        </g>
        {animated && (
            <g style={{ transformOrigin: '30px 8px', animation: 'mascotHeart 3.2s ease-in-out infinite' }}>
                <path d="M30 6 c-1 -2 -4 -2 -4 1 c0 2 4 4 4 4 c0 0 4 -2 4 -4 c0 -3 -3 -3 -4 -1 z"
                    fill="#b85a1b" opacity="0.85" />
            </g>
        )}
    </svg>
);

const MascotOrbits = ({ size = 60, animated = true }) => (
    <svg viewBox="0 0 90 70" style={{ width: size * (90 / 70), height: size, overflow: 'visible' }}>
        <defs>
            <linearGradient id="orbit-l" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4a8060" />
                <stop offset="100%" stopColor="#2d5a3d" />
            </linearGradient>
            <linearGradient id="orbit-r" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3a6f4d" />
                <stop offset="100%" stopColor="#1f3f2b" />
            </linearGradient>
        </defs>

        <ellipse cx="45" cy="63" rx="26" ry="2.5" fill="rgba(20, 30, 22, 0.1)" />

        <circle cx="45" cy="35" r="13" fill="var(--green)"
            style={animated ? { transformOrigin: '45px 35px', animation: 'orbitGlow 3.2s ease-in-out infinite' } : { opacity: 0.1 }} />

        <g style={animated ? { transformOrigin: '45px 35px', animation: 'orbitSpin 12s linear infinite' } : {}}>
            <circle cx="31" cy="35" r="24" fill="none" stroke="url(#orbit-l)" strokeWidth="3.4" />
            <circle cx="59" cy="35" r="24" fill="none" stroke="url(#orbit-r)" strokeWidth="3.4" />
            <circle cx="31" cy="11" r="2.6" fill="#4a8060" />
            <circle cx="59" cy="59" r="2.2" fill="#b85a1b" opacity="0.85" />
        </g>

        <text x="21" y="43" textAnchor="middle" fontFamily="Caveat, cursive" fontSize="25"
            fontWeight="700" fill="#2d5a3d">S</text>
        <text x="66" y="43" textAnchor="middle" fontFamily="Caveat, cursive" fontSize="25"
            fontWeight="700" fill="#1f3f2b">M</text>

        <g style={animated ? { transformOrigin: '45px 35px', animation: 'mascotHeart 3.2s ease-in-out infinite' } : {}}>
            <path d="M45 30 c-2 -3.4 -6.5 -2.8 -6.5 2 c0 4 6.5 8 6.5 8 c0 0 6.5 -4 6.5 -8 c0 -4.8 -4.5 -5.4 -6.5 -2 z"
                fill="#b85a1b" />
        </g>
    </svg>
);

// Keyframes pre animácie maskota
if (typeof document !== 'undefined' && !document.getElementById('mascot-anim')) {
    const s = document.createElement('style');
    s.id = 'mascot-anim';
    s.textContent = `
    @keyframes mascotBobL {
      0%, 100% { transform: translateY(0) rotate(-1deg); }
      50% { transform: translateY(-1.5px) rotate(0.5deg); }
    }
    @keyframes mascotBobR {
      0%, 100% { transform: translateY(0) rotate(1deg); }
      50% { transform: translateY(-2px) rotate(-0.5deg); }
    }
    @keyframes mascotHeart {
      0%, 70%, 100% { transform: scale(1); opacity: 0.85; }
      80% { transform: scale(1.3); opacity: 1; }
    }
    @keyframes leafSwayL {
      0%, 100% { transform: rotate(-2deg); }
      50% { transform: rotate(2deg); }
    }
    @keyframes leafSwayR {
      0%, 100% { transform: rotate(2deg); }
      50% { transform: rotate(-2deg); }
    }
    @keyframes orbitSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes orbitGlow {
      0%, 100% { opacity: 0.07; transform: scale(1); }
      50% { opacity: 0.16; transform: scale(1.04); }
    }
  `;
    document.head.appendChild(s);
}
