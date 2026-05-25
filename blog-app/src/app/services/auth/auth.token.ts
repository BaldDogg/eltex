import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { User, AuthResponse } from './auth.interfaces';

export interface IAuthService {
    login(username: string, password: string): Observable<AuthResponse>;
    register(username: string, email: string, password: string, isAdmin?: boolean): Observable<AuthResponse>;
    logout(): void;
    initAuth(): void;
}

export const AUTH_SERVICE_TOKEN = new InjectionToken<IAuthService>('AUTH_SERVICE_TOKEN');