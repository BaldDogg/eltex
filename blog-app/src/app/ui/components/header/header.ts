import { Component, inject, effect, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { UserSettings } from '../../../services/user-settings/user-settings';
import { AuthStore } from '../../../services/auth/auth.store';
import { AUTH_SERVICE_TOKEN } from '../../../services/auth/auth.token';
import { AuthDialogComponent } from '../../components/auth-dialog/auth-dialog';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [RouterLink, RouterLinkActive, MatMenuModule, MatIconModule, MatButtonModule],
    templateUrl: './header.html',
    styleUrl: './header.scss',
})
export class Header {
    private settingsService = inject(UserSettings);
    private dialog = inject(MatDialog);
    private authService = inject(AUTH_SERVICE_TOKEN);
    public authStore = inject(AuthStore);

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

    // открытие авторизации
    openAuth() {
        this.dialog.open(AuthDialogComponent, { width: '400px' });
    }

    // выход из аккаунта
    logout() {
        this.authService.logout();
    }
}