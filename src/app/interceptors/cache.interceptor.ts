import { inject, Injectable } from '@angular/core';
import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, tap } from 'rxjs';
import { API_URL } from '../api';

export const CACHE_MAX_AGE_MS = 60_000;

const CACHED_ADDRESSES = ['/restaurants', '/menus', '/categories', '/products'];

type CacheEntry = {
  response: HttpResponse<unknown>;
  savedAt: number;
};

@Injectable({ providedIn: 'root' })
export class ApiCache {
  private entries = new Map<string, CacheEntry>();

  get(address: string) {
    const entry = this.entries.get(address);

    if (!entry) {
      return undefined;
    }

    if (Date.now() - entry.savedAt > CACHE_MAX_AGE_MS) {
      this.entries.delete(address);
      return undefined;
    }

    return entry.response;
  }

  save(address: string, response: HttpResponse<unknown>) {
    this.entries.set(address, { response: response, savedAt: Date.now() });
  }

  clear() {
    this.entries.clear();
  }
}

export const cacheInterceptor: HttpInterceptorFn = (request, next) => {
  const cache = inject(ApiCache);

  if (!request.url.startsWith(API_URL)) {
    return next(request);
  }

  if (request.method !== 'GET') {
    cache.clear();
    return next(request);
  }

  if (!isCatalogAddress(request.url)) {
    return next(request);
  }

  const address = request.urlWithParams;
  const saved = cache.get(address);

  if (saved) {
    return of(saved.clone());
  }

  return next(request).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        cache.save(address, event);
      }
    }),
  );
};

function isCatalogAddress(url: string) {
  const path = url.substring(API_URL.length);

  for (const start of CACHED_ADDRESSES) {
    if (path.startsWith(start)) {
      return true;
    }
  }

  return false;
}
