import { InjectionToken } from '@angular/core';
import { IPostDetailService } from './post-detail.interface';

export const POST_DETAIL_SERVICE_TOKEN = new InjectionToken<IPostDetailService>('POST_DETAIL_SERVICE_TOKEN');