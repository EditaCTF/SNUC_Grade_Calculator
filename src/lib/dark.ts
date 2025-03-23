import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const createDarkModeStore = () => {
	const { subscribe, set, update } = writable(false);

	return {
		subscribe,
		toggle: () =>
			update((isDark) => {
				const newValue = !isDark;

				if (browser) {
					document.documentElement.classList.toggle('dark');
					localStorage.setItem('darkMode', String(newValue));
				}

				return newValue;
			}),
		initialize: () => {
			if (browser) {
				const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
				const savedDarkMode = localStorage.getItem('darkMode');
				const isDark = savedDarkMode ? savedDarkMode === 'true' : prefersDark;

				if (isDark) {
					document.documentElement.classList.add('dark');
				}

				set(isDark);
			}
		}
	};
};

export const darkMode = createDarkModeStore();
