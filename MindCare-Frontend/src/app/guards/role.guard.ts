//Implementar rutas protegidas en frontend
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const expectedRoles = route.data?.['roles'] as string[] | undefined;
  const user = auth.currentUser();

  if (!auth.isAuthenticated() || !user) {
    const adminRoute = expectedRoles?.includes('ADMIN');
    return router.createUrlTree([adminRoute ? '/admin-login' : '/login']);
  }

  if (!auth.hasAnyRole(expectedRoles)) {
    return router.createUrlTree([auth.homeByRole()]);
  }

  return true;
};
