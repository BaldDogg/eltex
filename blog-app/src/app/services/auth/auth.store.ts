import { Injectable, signal } from '@angular/core';
import { User } from './auth.interfaces';

@Injectable({ providedIn: 'root' })
export class AuthStore {
    public currentUser = signal<User | null>(null);

    public setUser(user: User | null): void {
        this.currentUser.set(user);
    }

    public logout(): void {
        this.currentUser.set(null);
        localStorage.removeItem('access_token');
    }
}