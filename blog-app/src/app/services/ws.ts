import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Subject, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class WsService {
    private socket$!: WebSocketSubject<any>;
    public messages$ = new Subject<any>();

    public connect() {
        if (environment.production) return;

        if (!this.socket$ || this.socket$.closed) {
            // для подключения через локальную сеть с других компьютеров
            const host = window.location.hostname;
            this.socket$ = webSocket(`ws://${host}:3000`);

            this.socket$.pipe(
                catchError(error => {
                    console.error('Ошибка WebSocket:', error);
                    return EMPTY;
                })
            ).subscribe(msg => {
                this.messages$.next(msg);
            });
        }
    }

    public subscribeToArticle(id: string) {
        if (environment.production || !this.socket$) return;
        this.socket$.next({ event: 'subscribe-article', data: id });
    }

    public unsubscribeFromArticle(id: string) {
        if (environment.production || !this.socket$) return;
        this.socket$.next({ event: 'unsubscribe-article', data: id });
    }
}