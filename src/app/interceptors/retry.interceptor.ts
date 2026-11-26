import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { retry, throwError, timer } from 'rxjs';

export const RETRY_COUNT = 2;
export const RETRY_DELAY_MS = 1000;

export const retryInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.method !== 'GET') {
    return next(request);
  }

  return next(request).pipe(
    retry({
      count: RETRY_COUNT,
      delay: (error, attempt) => {
        if (isTemporaryProblem(error)) {
          return timer(RETRY_DELAY_MS * attempt);
        }

        return throwError(() => error);
      },
    }),
  );
};

function isTemporaryProblem(error: unknown) {
  return error instanceof HttpErrorResponse && (error.status === 0 || error.status >= 500);
}
