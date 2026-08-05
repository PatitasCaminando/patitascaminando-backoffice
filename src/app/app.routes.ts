import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout.component';
import { LoginComponent } from './pages/auth/login.component';
import { ForgotComponent } from './pages/auth/forgot.component';
import { ResetPasswordComponent } from './pages/auth/reset-password.component';
import { DashboardComponent } from './pages/admin/dashboard.component';
import { AnimalsAdminComponent } from './pages/admin/animals-admin.component';
import { AdoptionsAdminComponent } from './pages/admin/adoptions-admin.component';
import { DonationsAdminComponent } from './pages/admin/donations-admin.component';
import { NotificationsAdminComponent } from './pages/admin/notifications-admin.component';
import { OperatorsAdminComponent } from './pages/admin/operators-admin.component';
import { adminGuard, authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'recuperar-clave', component: ForgotComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'animales', component: AnimalsAdminComponent },
      { path: 'adopciones', component: AdoptionsAdminComponent },
      { path: 'donaciones', component: DonationsAdminComponent },
      { path: 'notificaciones', component: NotificationsAdminComponent },
      { path: 'secciones', redirectTo: 'dashboard' },
      { path: 'operadores', component: OperatorsAdminComponent, canActivate: [adminGuard] }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
