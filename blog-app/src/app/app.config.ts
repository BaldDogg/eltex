import { ApplicationConfig, provideBrowserGlobalErrorListeners, inject } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

import { ARTICLES_SERVICE_TOKEN } from './services/articles/articles-service.token';
import { ArticlesService } from './services/articles/articles.service';
import { HttpArticlesService } from './services/articles/http-articles.service';
import { provideHttpClient } from '@angular/common/http';

import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes, withInMemoryScrolling({
            anchorScrolling: 'enabled',
            scrollPositionRestoration: 'top'
        })),
        provideHttpClient(),

        {
            provide: ARTICLES_SERVICE_TOKEN,
            useClass: environment.production ? ArticlesService : HttpArticlesService
        },

        // провайдер для GraphQL
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