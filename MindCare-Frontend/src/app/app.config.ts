import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpRequest, HttpHandlerFn, provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';

export const tokenInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const token = localStorage.getItem('token');

  // Clean URL to path (remove query parameters)
  let path = req.url;
  const queryIndex = path.indexOf('?');
  if (queryIndex !== -1) {
    path = path.substring(0, queryIndex);
  }

  // Determine if it is a public request based on exact paths and HTTP methods
  const isPublicRequest =
    path.endsWith('/authenticate') ||
    (path.endsWith('/usuarios/pacientes') && req.method === 'POST') ||
    (path.endsWith('/usuarios/profesionales') && req.method === 'POST') ||
    path.includes('/usuarios/recuperar-password') ||
    path.includes('/usuarios/restablecer-password') ||
    (path.endsWith('/catalogos/especialidades') && req.method === 'GET');

  if (token && !isPublicRequest) {
    req = req.clone({
      withCredentials: true,
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([tokenInterceptor])),
  ]
};