// Globálny store — auth + dáta z API
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, ApiError } from './api';

const StoreContext = createContext(null);

const RESOURCES = {
    stats: '/stats',
    settings: '/settings',
    moments: '/moments',
    notes: '/notes',
    bucket: '/bucket',
    countries: '/countries',
    capsules: '/capsules',
    wrapped: '/wrapped',
    events: '/events',
    wishlist: '/wishlist',
};

export function StoreProvider({ children }) {
    const [user, setUser] = useState(null);
    const [booting, setBooting] = useState(true);
    const [data, setData] = useState({});

    const refresh = useCallback(async (...keys) => {
        const wanted = keys.length ? keys : Object.keys(RESOURCES);
        const results = await Promise.all(wanted.map(k => api.get(RESOURCES[k])));
        setData(prev => {
            const next = { ...prev };
            wanted.forEach((k, i) => { next[k] = results[i]; });
            return next;
        });
    }, []);

    // Boot: zistiť session, načítať dáta
    useEffect(() => {
        (async () => {
            try {
                const me = await api.get('/auth/user');
                setUser(me);
                await refresh();
            } catch (e) {
                if (!(e instanceof ApiError && e.status === 401)) console.error(e);
            } finally {
                setBooting(false);
            }
        })();
    }, [refresh]);

    const login = useCallback(async (email, password) => {
        const me = await api.post('/auth/login', { email, password });
        setUser(me);
        await refresh();
    }, [refresh]);

    const logout = useCallback(async () => {
        try { await api.post('/auth/logout'); } catch { /* session už neplatí */ }
        setUser(null);
        setData({});
    }, []);

    const value = useMemo(() => ({
        user, booting, login, logout, refresh,
        stats: data.stats ?? null,
        settings: data.settings ?? {},
        moments: data.moments ?? [],
        notes: data.notes ?? [],
        bucket: data.bucket ?? [],
        countries: data.countries ?? [],
        capsules: data.capsules ?? [],
        wrapped: data.wrapped ?? [],
        events: data.events ?? [],
        wishlist: data.wishlist ?? [],
        ready: !!data.stats,
    }), [user, booting, login, logout, refresh, data]);

    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => {
    const ctx = useContext(StoreContext);
    if (!ctx) throw new Error('useStore must be used within StoreProvider');
    return ctx;
};
