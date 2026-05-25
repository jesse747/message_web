import { writable } from 'svelte/store';

const THEME_KEY = 'theme';
let initialized = false;

export const darkMode = writable(false);

export function initTheme() {
	if (initialized) return;
	initialized = true;

	const stored = localStorage.getItem(THEME_KEY);
	const isDark = stored !== null ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;

	darkMode.set(isDark);
	applyTheme(isDark);
}

export function toggleTheme() {
	darkMode.update((v) => {
		const next = !v;
		localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
		applyTheme(next);
		return next;
	});
}

function applyTheme(isDark: boolean) {
	if (isDark) {
		document.documentElement.classList.add('dark');
	} else {
		document.documentElement.classList.remove('dark');
	}
}
