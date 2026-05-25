import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError, delay } from 'rxjs';
import { IAuthService } from './auth.token';
import { AuthResponse } from './auth.interfaces';
import { AuthStore } from './auth.store';

@Injectable()
export class MockAuthService implements IAuthService {
    private authStore = inject(AuthStore);

    initAuth(): void {
        const token = localStorage.getItem('access_token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            this.authStore.setUser(JSON.parse(savedUser));
        }
    }

    login(username: string, password: string): Observable<AuthResponse> {
        const users: any[] = JSON.parse(localStorage.getItem('mockUsers') || '[]');
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            const res: AuthResponse = {
                access_token: 'mock-local-token-' + Date.now(),
                user: {
                    username: user.username,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    role: user.isAdmin ? 'admin' : 'user'
                }
            };
            localStorage.setItem('access_token', res.access_token);
            localStorage.setItem('user', JSON.stringify(res.user));
            this.authStore.setUser(res.user);
            return of(res).pipe(delay(500));
        }
        return throwError(() => new Error('Неверный логин или пароль')).pipe(delay(500));
    }

    register(username: string, email: string, password: string, isAdmin = false): Observable<AuthResponse> {
        const users: any[] = JSON.parse(localStorage.getItem('mockUsers') || '[]');

        if (users.find(u => u.username === username)) {
            return throwError(() => new Error('Пользователь уже существует')).pipe(delay(500));
        }

        users.push({ username, email, password, isAdmin });
        localStorage.setItem('mockUsers', JSON.stringify(users));

        return this.login(username, password);
    }

    logout(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        this.authStore.logout();
    }
}