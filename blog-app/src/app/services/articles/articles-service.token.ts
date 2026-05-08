import { InjectionToken } from '@angular/core';
import { IArticlesService } from './articles-service.interface';

// токен сервиса
export const ARTICLES_SERVICE_TOKEN = new InjectionToken<IArticlesService>('ARTICLES_SERVICE_TOKEN');