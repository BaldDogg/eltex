import { ApplicationConfig, provideBrowserGlobalErrorListeners, inject, provideAppInitializer } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

import { ARTICLES_SERVICE_TOKEN } from './services/articles/articles-service.token';
import { ArticlesService } from './services/articles/articles.service';
import { HttpArticlesService } from './services/articles/http-articles.service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';

import { AUTH_SERVICE_TOKEN } from './services/auth/auth.token';
import { HttpAuthService } from './services/auth/http-auth';
import { MockAuthService } from './services/auth/mock-auth';
import { authInterceptor } from './core/auth.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes, withInMemoryScrolling({
            anchorScrolling: 'enabled',
            scrollPositionRestoration: 'top'
        })),

        provideHttpClient(withInterceptors([authInterceptor])),
        provideAppInitializer(() => {
            const authService = inject(AUTH_SERVICE_TOKEN);
            authService.initAuth();
        }),

        {
            provide: ARTICLES_SERVICE_TOKEN,
            useClass: environment.production ? ArticlesService : HttpArticlesService
        },

        {
            provide: AUTH_SERVICE_TOKEN,
            useClass: window.location.hostname.includes('github.io')
                ? MockAuthService
                : HttpAuthService
        },

        provideApollo(() => {
            const httpLink = inject(HttpLink);
            return {
                link: httpLink.create({
                    uri: '/graphql'
                }),
                cache: new InMemoryCache(),
            };
        })
    ]
};