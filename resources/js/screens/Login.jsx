import { useState } from 'react';
import { useStore } from '../store';

export default function Login() {
    const { login } = useStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
            await login(email, password);
        } catch (err) {
            setError(err.errors?.email?.[0] || err.message || 'Prihlásenie zlyhalo.');
            setBusy(false);
        }
    };

    return (
        <div className="login-screen">
            <div className="num" style={{ fontSize: 64, color: 'var(--green)' }}>S+M</div>
            <div className="eyebrow" style={{ marginBottom: 24 }}>náš priestor</div>

            <form onSubmit={submit} className="col gap-12" style={{ width: '100%', maxWidth: 300 }}>
                <div>
                    <label className="field-label" htmlFor="email">e-mail</label>
                    <input id="email" type="email" className="field" value={email}
                        autoComplete="username" required
                        onChange={(e) => setEmail(e.target.value)} placeholder="s@sm.app" />
                </div>
                <div>
                    <label className="field-label" htmlFor="password">heslo</label>
                    <input id="password" type="password" className="field" value={password}
                        autoComplete="current-password" required
                        onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                </div>

                {error && (
                    <div style={{ fontSize: 12.5, color: 'var(--accent)', textAlign: 'center' }}>{error}</div>
                )}

                <button type="submit" className="btn primary" disabled={busy} style={{ marginTop: 4 }}>
                    {busy ? 'Prihlasujem…' : 'Vstúpiť ♡'}
                </button>
            </form>

            <div className="handwritten" style={{ fontSize: 18, marginTop: 28 }}>
                len pre nás dvoch
            </div>
        </div>
    );
}
