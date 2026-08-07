import { NgIf } from '@angular/common';
import { Component, HostListener, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, NgIf, ReactiveFormsModule],
  template: `
    <div class="admin-shell">
      <aside [class.open]="menu()" (click)="closeDrawer()">
        <a routerLink="/admin" class="admin-logo">
          <img src="assets/branding/logo-color-transparent.png" alt="Patitas Caminando">
        </a>

        <nav>
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>
            <span>Resumen</span>
          </a>
          <a routerLink="/admin/animales" routerLinkActive="active">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5.5" cy="10.5" r="2.5"/><circle cx="18.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="6" r="2.2"/><circle cx="15.5" cy="6" r="2.2"/><path d="M7 17.5c0-3 2.2-5 5-5s5 2 5 5c0 1.8-1.2 3-2.8 3H9.8C8.2 20.5 7 19.3 7 17.5z"/></svg>
            <span>Animales</span>
          </a>
          <a routerLink="/admin/adopciones" routerLinkActive="active">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.4-9.2-9A5.2 5.2 0 0 1 12 6a5.2 5.2 0 0 1 9.2 6c-2.2 4.6-9.2 9-9.2 9z"/></svg>
            <span>Adopciones</span>
          </a>
          <a routerLink="/admin/donaciones" routerLinkActive="active">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12v8H4v-8"/><path d="M2 7h20v5H2z"/><path d="M12 7v13"/><path d="M12 7H8.5A2.5 2.5 0 1 1 12 4.5z"/><path d="M12 7h3.5A2.5 2.5 0 1 0 12 4.5z"/></svg>
            <span>Donaciones</span>
          </a>
          <a routerLink="/admin/operadores" routerLinkActive="active" *ngIf="auth.hasRole('admin')">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/></svg>
            <span>Crear operadores</span>
          </a>
        </nav>
      </aside>

      <section class="admin-main">
        <header class="admin-header">
          <button class="menu-btn" (click)="toggleMenu($event)" aria-label="Abrir menu">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></svg>
          </button>
          <a routerLink="/admin/notificaciones" class="notification-trigger" aria-label="Ver notificaciones" (click)="closeMenus()">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>
            <span class="notification-badge" *ngIf="unreadNotifications()">{{unreadNotifications()}}</span>
          </a>
          <div class="user-panel" (click)="$event.stopPropagation()">
            <button type="button" class="profile-trigger" (click)="profileOpen.set(!profileOpen())" [attr.aria-expanded]="profileOpen()">
              <span class="user-avatar">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <span class="user-data">
                <span class="user-name">Mi perfil</span>
                <span class="user-email">{{roleLabel}}</span>
              </span>
            </button>
            <div class="profile-menu" *ngIf="profileOpen()">
              <button type="button" class="profile-menu-button" *ngIf="isOperator" (click)="openUpdateProfile($event)">Actualizar datos</button>
              <button type="button" class="profile-menu-button" *ngIf="isOperator" (click)="openChangePassword($event)">Cambiar clave</button>
              <button type="button" class="logout-button" (pointerdown)="logout($event)" (click)="logout($event)">Cerrar sesi&oacute;n</button>
            </div>
          </div>
        </header>
        <div class="modal-backdrop" *ngIf="updateProfileOpen()">
          <div class="modal">
            <button class="modal-close" (click)="updateProfileOpen.set(false)">x</button>
            <h2>Actualizar datos</h2>
            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
              <div class="form-grid">
                <label>Nombres<input class="form-control" formControlName="firstNames"></label>
                <label>Apellidos<input class="form-control" formControlName="lastNames"></label>
              </div>
              <label>Numero de celular<input class="form-control" formControlName="phone"></label>
              @if(profileMessage()) { <div class="alert success">{{profileMessage()}}</div> }
              <button class="btn btn-primary btn-block" [disabled]="profileForm.invalid">Guardar cambios</button>
            </form>
          </div>
        </div>
        <div class="modal-backdrop" *ngIf="changePasswordOpen()">
          <div class="modal">
            <button class="modal-close" (click)="changePasswordOpen.set(false)">x</button>
            <h2>Cambiar clave</h2>
            <form [formGroup]="passwordForm" (ngSubmit)="savePassword()">
              <label>Clave actual<input class="form-control" type="password" formControlName="currentPassword"></label>
              <label>Nueva clave<input class="form-control" type="password" formControlName="newPassword"></label>
              <label>Confirmar clave<input class="form-control" type="password" formControlName="confirmPassword"></label>
              @if(passwordMessage()) { <div class="alert success">{{passwordMessage()}}</div> }
              @if(passwordError()) { <div class="alert error">{{passwordError()}}</div> }
              <button class="btn btn-primary btn-block" [disabled]="passwordForm.invalid">Actualizar clave</button>
            </form>
          </div>
        </div>
        <div class="admin-content"><router-outlet/></div>
      </section>
    </div>
  `
})
export class AdminLayoutComponent implements OnInit {
  menu = signal(false);
  profileOpen = signal(false);
  updateProfileOpen = signal(false);
  changePasswordOpen = signal(false);
  profileMessage = signal('');
  passwordMessage = signal('');
  passwordError = signal('');
  unreadNotifications = signal(0);

  profileForm = this.fb.nonNullable.group({
    firstNames: ['', Validators.required],
    lastNames: ['', Validators.required],
    phone: ['']
  });

  passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  });

  constructor(public auth: AuthService, private api: ApiService, private fb: FormBuilder) {}

  ngOnInit() {
    if (!this.auth.user()) this.auth.loadMe().subscribe();
    this.loadNotifications();
  }

  @HostListener('document:click')
  closeMenus() {
    this.profileOpen.set(false);
  }
  toggleMenu(event: Event) {
    event.stopPropagation();
    this.menu.set(!this.menu());
  }

  closeDrawer() {
    this.menu.set(false);
  }

  openUpdateProfile(event: Event) {
    event.stopPropagation();
    const profile = this.auth.user()?.profile;
    this.profileMessage.set('');
    this.profileForm.setValue({
      firstNames: profile?.firstNames || '',
      lastNames: profile?.lastNames || '',
      phone: profile?.phone || ''
    });
    this.profileOpen.set(false);
    this.updateProfileOpen.set(true);
  }

  openChangePassword(event: Event) {
    event.stopPropagation();
    this.passwordMessage.set('');
    this.passwordError.set('');
    this.passwordForm.reset({currentPassword: '', newPassword: '', confirmPassword: ''});
    this.profileOpen.set(false);
    this.changePasswordOpen.set(true);
  }

  saveProfile() {
    if (this.profileForm.invalid) return;
    this.auth.updateLocalProfile(this.profileForm.getRawValue());
    this.profileMessage.set('Datos actualizados correctamente.');
  }

  savePassword() {
    if (this.passwordForm.invalid) return;
    const value = this.passwordForm.getRawValue();
    this.passwordMessage.set('');
    this.passwordError.set('');
    if (value.newPassword !== value.confirmPassword) {
      this.passwordError.set('Las claves no coinciden.');
      return;
    }
    if (!this.auth.changeLocalOperatorPassword(value.currentPassword, value.newPassword)) {
      this.passwordError.set('La clave actual no es correcta.');
      return;
    }
    this.passwordMessage.set('Clave actualizada correctamente. Inicia sesion nuevamente.');
    setTimeout(() => this.auth.logout(), 700);
  }

  loadNotifications() {
    this.api.notifications().subscribe(v => {
      this.unreadNotifications.set(v.filter(n => !n.isRead).length);
    });
  }

  logout(event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();
    this.profileOpen.set(false);
    this.auth.logout();
  }

  get displayName() {
    const p = this.auth.user()?.profile;
    return [p?.firstNames, p?.lastNames].filter(Boolean).join(' ') || 'Usuario';
  }

  get initials() {
    return this.displayName.split(' ').filter(Boolean).slice(0, 2).map(v => v[0]).join('').toUpperCase() || 'U';
  }

  get roleLabel() {
    return this.auth.hasRole('admin') ? 'Rol Administrador' : 'Rol Operador';
  }

  get isOperator() {
    return this.auth.hasRole('operator');
  }
}
