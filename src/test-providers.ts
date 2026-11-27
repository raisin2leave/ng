import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAppLocale } from './app/locale';
import { provideImageLoader } from './app/image-loader';

export default [provideHttpClient(), provideHttpClientTesting(), provideAppLocale(), provideImageLoader()];
