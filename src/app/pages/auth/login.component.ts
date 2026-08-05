import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div>
          <img src="assets/branding/logo-color.jpeg" alt="Patitas Caminando">
        </div>
        <h1>Panel administrativo</h1>
        <p>Ingresa con tu cuenta de administrador u operador.</p>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <label>
            Correo electronico
            <input class="form-control" type="email" formControlName="email">
          </label>
          <label>
            Contrasena
            <input class="form-control" type="password" formControlName="password">
          </label>
          @if(error()) {
            <div class="alert error">{{error()}}</div>
          }
          <button class="btn btn-primary btn-block" [disabled]="form.invalid || loading()">
            {{loading() ? 'Ingresando...' : 'Iniciar sesion'}}
          </button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  loading = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  submit() {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set('');

    const {email, password} = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => this.auth.loadMe().subscribe({
        next: () => this.router.navigateByUrl('/admin/dashboard'),
        error: () => {
          this.loading.set(false);
          this.error.set('No fue posible cargar el perfil.');
        }
      }),
      error: error => {
        this.loading.set(false);
        this.error.set(error?.error?.message ?? 'Credenciales incorrectas.');
      }
    });
  }
}
