import { Component, inject, effect } from '@angular/core';
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
    public settingsService = inject(UserSettings);

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