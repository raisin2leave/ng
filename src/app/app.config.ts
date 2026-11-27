import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { cacheInterceptor } from './interceptors/cache.interceptor';
import { retryInterceptor } from './interceptors/retry.interceptor';
import { provideAppLocale } from './locale';
import { provideImageLoader } from './image-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([cacheInterceptor, retryInterceptor])),
    provideRouter(routes, withComponentInputBinding()),
    provideAppLocale(),
    provideImageLoader(),
  ]
};
