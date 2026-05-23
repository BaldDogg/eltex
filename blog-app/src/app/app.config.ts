import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

import { ARTICLES_SERVICE_TOKEN } from './services/articles/articles-service.token';
import { ArticlesService } from './services/articles/articles.service';
import { HttpArticlesService } from './services/articles/http-articles.service';
import { provideHttpClient } from '@angular/common/http';

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
        }
    ]
};