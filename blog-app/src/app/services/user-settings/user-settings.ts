import { Injectable, signal } from '@angular/core';

export interface UserSettingsData {
    theme: 'light' | 'dark';
}

@Injectable({
    providedIn: 'root'
})
export class UserSettings {
    private readonly SETTINGS_KEY = 'userSettings';

    public settings = signal<UserSettingsData>(this.loadSettings());

    private loadSettings(): UserSettingsData {
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem(this.SETTINGS_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        }
        return { theme: 'light' };
    }

    public updateSettings(newSettings: Partial<UserSettingsData>) {
        const updated = { ...this.settings(), ...newSettings };
        this.settings.set(updated);

        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(updated));
        }
    }
}