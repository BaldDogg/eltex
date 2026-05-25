import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './ui/components/header/header';
import { Footer } from './ui/components/footer/footer';
import { AUTH_SERVICE_TOKEN } from './services/auth/auth.token';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, Header, Footer],
    templateUrl: './app.html',
    styleUrl: './app.scss'
})
export class App implements OnInit {
    private authService = inject(AUTH_SERVICE_TOKEN);

    ngOnInit(): void {
        // чтобы после перезагрузки была проверка аккаунта
        this.authService.initAuth();
    }
}