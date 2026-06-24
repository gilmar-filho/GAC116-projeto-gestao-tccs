import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      notify.error(extractMessage(error));
      return throwError(() => error);
    }),
  );
};

function extractMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'Não foi possível conectar ao servidor.';
  }
  const body = error.error;
  if (body && typeof body === 'object') {
    const first = Object.values(body)[0];
    if (Array.isArray(first) && first.length) {
      return String(first[0]);
    }
    if (typeof first === 'string') {
      return first;
    }
  }
  return `Erro ${error.status}: ${error.statusText || 'falha na requisição'}.`;
}
