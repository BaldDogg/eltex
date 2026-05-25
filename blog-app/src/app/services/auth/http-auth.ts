import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap, map, catchError, of, throwError, delay } from 'rxjs';
import { IAuthService } from './auth.token';
import { AuthResponse, User } from './auth.interfaces';
import { AuthStore } from './auth.store';

@Injectable()
export class HttpAuthService implements IAuthService {
    private http = inject(HttpClient);
    private authStore = inject(AuthStore);

    private authUrl = '/api/auth';
    private userUrl = '/api/user';

    // восстановление сессии при F5
    initAuth(): void {
        const token = localStorage.getItem('access_token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            // если всё нашли, пускаем пользователя в систему
            this.authStore.setUser(JSON.parse(savedUser));

            // локальный токен
            if (token.startsWith('mock-local-token')) {
                return;
            }

            // если токен серверный - проверяем его валидность
            if (!window.location.hostname.includes('github.io')) {
                this.http.get<User>(`${this.authUrl}/me`).subscribe({
                    next: (freshUser) => {
                        this.authStore.setUser(freshUser);
                        localStorage.setItem('user', JSON.stringify(freshUser));
                    },
                    error: () => {
                        this.logout();
                    }
                });
            }
        }
    }
    login(username: string, password: string): Observable<AuthResponse> {
        return this.http.post<any>(`${this.authUrl}/login`, { login: username, password }).pipe(
            switchMap(res => {
                localStorage.setItem('access_token', res.access_token);

                return this.http.get<User>(`${this.authUrl}/me`).pipe(
                    tap(user => {
                        this.authStore.setUser(user);
                        localStorage.setItem('user', JSON.stringify(user));
                    }),
                    map(() => res)
                );
            }),
            catchError(() => this.localLogin(username, password))
        );
    }

    register(username: string, email: string, password: string, isAdmin = false): Observable<AuthResponse> {
        return this.http.post<any>(`${this.userUrl}/register`, { username, email, password, isAdmin }).pipe(
            switchMap(() => this.login(username, password)),
            catchError(() => this.localRegister(username, email, password, isAdmin))
        );
    }

    logout(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        this.authStore.logout();
    }

    // локальный логин
    private localLogin(username: string, password: string): Observable<AuthResponse> {
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

    private localRegister(username: string, email: string, password: string, isAdmin = false): Observable<AuthResponse> {
        const users: any[] = JSON.parse(localStorage.getItem('mockUsers') || '[]');

        if (users.find(u => u.username === username)) {
            return throwError(() => new Error('Пользователь уже существует')).pipe(delay(500));
        }

        users.push({ username, email, password, isAdmin });
        localStorage.setItem('mockUsers', JSON.stringify(users));

        return this.localLogin(username, password);
    }
}