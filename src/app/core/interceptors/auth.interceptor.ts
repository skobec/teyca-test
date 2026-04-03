import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token();

  if (req.url.includes('test-auth-only')) {
    return next(req);
  }

  if (token) {
    const cloned = req.clone({
      headers: req.headers
        .set('Authorization', token)
        .set('X-Auth-Token', token)
    });
    return next(cloned);
  }

  return next(req);
};
