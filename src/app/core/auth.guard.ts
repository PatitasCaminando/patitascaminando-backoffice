import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';
export const authGuard:CanActivateFn=()=>{const auth=inject(AuthService),router=inject(Router);if(!auth.token)return router.createUrlTree(['/login']);if(auth.user())return true;return auth.loadMe().pipe(map(()=>true),catchError(()=>of(router.createUrlTree(['/login']))));};
export const adminGuard:CanActivateFn=()=>{const auth=inject(AuthService),router=inject(Router);const validate=()=>auth.hasRole('admin')?true:router.createUrlTree(['/admin']);if(!auth.token)return router.createUrlTree(['/login']);if(auth.user())return validate();return auth.loadMe().pipe(map(validate),catchError(()=>of(router.createUrlTree(['/login']))));};
