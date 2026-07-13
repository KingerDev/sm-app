// Slovenské dátumové helpery (zrkadlia app/Support/SkDate.php)

export const MONTHS_SK = [
    'január', 'február', 'marec', 'apríl', 'máj', 'jún',
    'júl', 'august', 'september', 'október', 'november', 'december',
];

export const MONTHS_SHORT_SK = [
    'jan', 'feb', 'mar', 'apr', 'máj', 'jún',
    'júl', 'aug', 'sep', 'okt', 'nov', 'dec',
];

export const parseDate = (value) => {
    if (value instanceof Date) return value;
    // "2026-01-21" alebo ISO timestamp — berieme len dátumovú časť
    const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d);
};

export const today = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

export const daysBetween = (a, b) => Math.floor((parseDate(b) - parseDate(a)) / 86400000);

export const daysUntil = (date) => daysBetween(today(), date);

/** "21. január 2026" */
export const formatDateSk = (value) => {
    const d = parseDate(value);
    return `${d.getDate()}. ${MONTHS_SK[d.getMonth()]} ${d.getFullYear()}`;
};

/** "21. 1. 2026" */
export const formatDateShortSk = (value) => {
    const d = parseDate(value);
    return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;
};

/** "2 roky 3 mes 23 dní" */
export const durationSk = (from, to = today()) => {
    let a = parseDate(from);
    const b = parseDate(to);

    let years = b.getFullYear() - a.getFullYear();
    let months = b.getMonth() - a.getMonth();
    let days = b.getDate() - a.getDate();

    if (days < 0) {
        months -= 1;
        days += new Date(b.getFullYear(), b.getMonth(), 0).getDate();
    }
    if (months < 0) {
        years -= 1;
        months += 12;
    }

    const rok = years === 1 ? 'rok' : years >= 2 && years <= 4 ? 'roky' : 'rokov';
    const parts = [];
    if (years > 0) parts.push(`${years} ${rok}`);
    if (months > 0) parts.push(`${months} mes`);
    parts.push(`${days} dní`);
    return parts.join(' ');
};

/** input[type=date] hodnota */
export const toInputDate = (value) => {
    const d = parseDate(value);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
