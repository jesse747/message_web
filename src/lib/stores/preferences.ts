import { writable } from 'svelte/store';

export type HighlightColor = 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'teal';

const PREF_KEY = 'highlight_color';
const DEFAULT: HighlightColor = 'blue';

const PALETTES: Record<HighlightColor, Record<string, string>> = {
	blue: {
		'50': '#eff6ff', '100': '#dbeafe', '200': '#bfdbfe', '300': '#93c5fd',
		'400': '#60a5fa', '500': '#3b82f6', '600': '#2563eb', '700': '#1d4ed8',
		'800': '#1e40af', '900': '#1e3a8a'
	},
	green: {
		'50': '#f0fdf4', '100': '#dcfce7', '200': '#bbf7d0', '300': '#86efac',
		'400': '#4ade80', '500': '#22c55e', '600': '#16a34a', '700': '#15803d',
		'800': '#166534', '900': '#14532d'
	},
	purple: {
		'50': '#faf5ff', '100': '#f3e8ff', '200': '#e9d5ff', '300': '#d8b4fe',
		'400': '#c084fc', '500': '#a855f7', '600': '#9333ea', '700': '#7e22ce',
		'800': '#6b21a8', '900': '#581c87'
	},
	red: {
		'50': '#fef2f2', '100': '#fee2e2', '200': '#fecaca', '300': '#fca5a5',
		'400': '#f87171', '500': '#ef4444', '600': '#dc2626', '700': '#b91c1c',
		'800': '#991b1b', '900': '#7f1d1d'
	},
	orange: {
		'50': '#fff7ed', '100': '#ffedd5', '200': '#fed7aa', '300': '#fdba74',
		'400': '#fb923c', '500': '#f97316', '600': '#ea580c', '700': '#c2410c',
		'800': '#9a3412', '900': '#7c2d12'
	},
	teal: {
		'50': '#f0fdfa', '100': '#ccfbf1', '200': '#99f6e4', '300': '#5eead4',
		'400': '#2dd4bf', '500': '#14b8a6', '600': '#0d9488', '700': '#0f766e',
		'800': '#115e59', '900': '#134e4a'
	}
};

export const COLOR_OPTIONS: { name: string; value: HighlightColor; hex: string }[] = [
	{ name: 'Blue', value: 'blue', hex: '#3b82f6' },
	{ name: 'Green', value: 'green', hex: '#22c55e' },
	{ name: 'Purple', value: 'purple', hex: '#a855f7' },
	{ name: 'Red', value: 'red', hex: '#ef4444' },
	{ name: 'Orange', value: 'orange', hex: '#f97316' },
	{ name: 'Teal', value: 'teal', hex: '#14b8a6' }
];

export const highlightColor = writable<HighlightColor>(DEFAULT);

let initialized = false;

export function initHighlightColor() {
	if (initialized) return;
	initialized = true;
	const stored = localStorage.getItem(PREF_KEY) as HighlightColor | null;
	const color = stored && stored in PALETTES ? stored : DEFAULT;
	highlightColor.set(color);
	applyPalette(color);
}

export function setHighlightColor(color: HighlightColor) {
	localStorage.setItem(PREF_KEY, color);
	highlightColor.set(color);
	applyPalette(color);
}

function applyPalette(color: HighlightColor) {
	const palette = PALETTES[color];
	for (const [shade, hex] of Object.entries(palette)) {
		document.documentElement.style.setProperty(`--color-primary-${shade}`, hex);
	}
}
