import { Component, inject, effect, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserSettings } from '../../../services/user-settings/user-settings';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './header.html',
    styleUrl: './header.scss',
})
export class Header {
    private settingsService = inject(UserSettings);

    protected changeThemeSymbol = computed(() => this.settingsService.settings().theme === 'light' ? '🌙' : '☀️');

    constructor() {
        effect(() => {
            const theme = this.settingsService.settings().theme;
            if (theme === 'dark') {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }
        });
    }

    protected toggleTheme() {
        const currentTheme = this.settingsService.settings().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.settingsService.updateSettings({ theme: newTheme });
    }

    scrollToContacts() {
        document.getElementById('contact-info')?.scrollIntoView({ behavior: 'smooth' });
    }
}