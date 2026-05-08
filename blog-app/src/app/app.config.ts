import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';

import { ARTICLES_SERVICE_TOKEN } from './services/articles/articles-service.token';
import { ArticlesService } from './services/articles/articles.service';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes, withInMemoryScrolling({
            anchorScrolling: 'enabled',
            scrollPositionRestoration: 'top'
        })),
        { provide: ARTICLES_SERVICE_TOKEN, useClass: ArticlesService }
    ]
};