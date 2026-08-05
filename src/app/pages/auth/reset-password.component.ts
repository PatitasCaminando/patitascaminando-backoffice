import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Component({selector:'app-reset-password',standalone:true,imports:[ReactiveFormsModule,RouterLink],template:`<div class="auth-page"><div class="auth-card"><img src="assets/branding/logo-color.jpeg" alt="Patitas Caminando"><h1>Nueva contraseña</h1><p>Ingresa y confirma tu nueva contraseña.</p><form [formGroup]="form" (ngSubmit)="submit()"><label>Nueva contraseña<input class="form-control" type="password" formControlName="password"></label><label>Confirmar contraseña<input class="form-control" type="password" formControlName="confirm"></label>@if(message()){<div class="alert success">{{message()}}</div>}@if(error()){<div class="alert error">{{error()}}</div>}<button class="btn btn-primary btn-block" [disabled]="form.invalid||loading()">Actualizar contraseña</button></form><a routerLink="/login" class="back">Ir al inicio de sesión</a></div></div>`})
export class ResetPasswordComponent{
 loading=signal(false);message=signal('');error=signal('');
 form=this.fb.nonNullable.group({password:['',[Validators.required,Validators.minLength(6)]],confirm:['',[Validators.required,Validators.minLength(6)]]});
 constructor(private fb:FormBuilder){}
 async submit(){if(this.form.invalid)return;const v=this.form.getRawValue();if(v.password!==v.confirm){this.error.set('Las contraseñas no coinciden.');return}if(!environment.supabaseUrl||!environment.supabaseAnonKey){this.error.set('Configura Supabase en environment.ts.');return}this.loading.set(true);this.error.set('');const client=createClient(environment.supabaseUrl,environment.supabaseAnonKey);const {error}=await client.auth.updateUser({password:v.password});this.loading.set(false);if(error){this.error.set(error.message);return}this.message.set('Contraseña actualizada correctamente. Ya puedes iniciar sesión.');}
}
