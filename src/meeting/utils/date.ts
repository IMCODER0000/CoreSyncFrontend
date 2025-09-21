export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
export const endOfMonth   = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

export const startOfWeek  = (d: Date) => {
		const nd = new Date(d);
		const day = nd.getDay();
		nd.setDate(nd.getDate() - day);
		nd.setHours(0, 0, 0, 0);
		return nd;
};

export const addDays = (d: Date, n: number) =>
		new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export const isSameDate = (a: Date, b: Date) =>
		a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const isBetweenDay = (d: Date, s: Date, e: Date) => {
		const x = d.getTime();
		const ss = new Date(s.getFullYear(), s.getMonth(), s.getDate()).getTime();
		const ee = new Date(e.getFullYear(), e.getMonth(), e.getDate()).getTime();
		return x >= ss && x <= ee;
};

export const yyyyMm = (d: Date) => `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
export const ymd    = (d: Date) =>
		`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;