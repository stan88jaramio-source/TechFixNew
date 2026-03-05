import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // If loading has already finished, resolve immediately
  if (!auth.loading()) {
    if (auth.isAuthenticated && auth.currentUser()) return true;
    return router.createUrlTree(['/login']);
  }

  // Wait for fetchMe() to complete before deciding
  return toObservable(auth.loading).pipe(
    filter(loading => !loading),
    take(1),
    map(() => {
      if (auth.isAuthenticated && auth.currentUser()) return true;
      return router.createUrlTree(['/login']);
    })
  );
};
