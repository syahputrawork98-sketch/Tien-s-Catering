import { browser } from '$app/environment';

class ThemeStore {
    current = $state(browser ? (localStorage.getItem('theme') || 'light') : 'light');

    toggle() {
        this.current = this.current === 'light' ? 'dark' : 'light';
        if (browser) {
            localStorage.setItem('theme', this.current);
            document.documentElement.classList.toggle('dark', this.current === 'dark');
        }
    }

    init() {
        if (browser) {
            const saved = localStorage.getItem('theme') || 'light';
            this.current = saved;
            document.documentElement.classList.toggle('dark', saved === 'dark');
        }
    }
}

export const theme = new ThemeStore();
