import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Operator } from '../../core/models';

@Component({
  selector: 'app-operators-admin',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="page-title">
      <div>
        <span class="eyebrow">Usuarios internos</span>
        <h1>Operadores</h1>
      </div>
      <button class="btn btn-primary" (click)="newOperator()">+ Nuevo operador</button>
    </div>

    @if(message()) {
      <div class="alert success">{{message()}}</div>
    }
    @if(listError()) {
      <div class="alert error">{{listError()}}</div>
    }

    <div class="card table-card">
      <div class="table-heading">
        <div>
          <span class="eyebrow">Registros</span>
          <h2>Operadores creados</h2>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Nombres</th>
            <th>Correo</th>
            <th>Numero de celular</th>
            <th>Notificaciones</th>
            <th>Estado</th>
            <th class="actions-col"></th>
          </tr>
        </thead>
        <tbody>
          @for(operator of operators(); track operator.id) {
            <tr>
              <td><strong>{{fullName(operator)}}</strong></td>
              <td>{{operator.email || 'Sin registrar'}}</td>
              <td>{{operator.phone || 'Sin registrar'}}</td>
              <td>{{operator.receiveFormNotifications ? 'Si recibe' : 'No recibe'}}</td>
              <td>
                <span class="status" [attr.data-status]="operator.isActive ? 'disponible' : 'archivado'">
                  {{operator.isActive ? 'Activo' : 'Inactivo'}}
                </span>
              </td>
              <td>
                <div class="row-actions">
                  <button class="icon-btn" [class.danger]="operator.isActive" [disabled]="busyId() === operator.id" (click)="toggleStatus(operator)">
                    {{busyId() === operator.id ? 'Guardando...' : (operator.isActive ? 'Desactivar' : 'Activar')}}
                  </button>
                </div>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="6" class="empty-table">{{loadingList() ? 'Cargando operadores...' : 'Aun no se han creado operadores.'}}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    @if(showForm()) {
      <div class="modal-backdrop">
        <div class="modal wide">
          <button class="modal-close" (click)="showForm.set(false)">&times;</button>
          <h2>Nueva cuenta de operador</h2>
          <p>El operador podra gestionar animales, adopciones, donaciones y notificaciones.</p>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="form-grid">
              <label>
                Nombres
                <input class="form-control" formControlName="firstNames">
              </label>
              <label>
                Apellidos
                <input class="form-control" formControlName="lastNames">
              </label>
              <label>
                Telefono
                <input class="form-control" formControlName="phone">
              </label>
              <label>
                Correo
                <input class="form-control" type="email" formControlName="email">
              </label>
            </div>
            <label>
              Contrasena temporal
              <input class="form-control" type="password" formControlName="password">
            </label>

            <div class="check-grid">
              <label class="check">
                <input type="checkbox" formControlName="receiveFormNotifications">
                Recibir notificaciones de formularios
              </label>
            </div>

            @if(error()) {
              <div class="alert error">{{error()}}</div>
            }

            <button class="btn btn-primary btn-block" [disabled]="form.invalid || loading()">
              {{loading() ? 'Creando...' : 'Crear operador'}}
            </button>
          </form>
        </div>
      </div>
    }
  `
})
export class OperatorsAdminComponent implements OnInit {
  loading = signal(false);
  loadingList = signal(false);
  showForm = signal(false);
  message = signal('');
  error = signal('');
  listError = signal('');
  busyId = signal('');
  operators = signal<Operator[]>([]);

  form = this.fb.nonNullable.group({
    firstNames: ['', Validators.required],
    lastNames: ['', Validators.required],
    phone: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    receiveFormNotifications: [false]
  });

  constructor(private fb: FormBuilder, private api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loadingList.set(true);
    this.listError.set('');
    this.api.operators().subscribe({
      next: v => {
        this.operators.set(v ?? []);
        this.loadingList.set(false);
      },
      error: e => {
        this.loadingList.set(false);
        this.listError.set(e?.error?.message ?? 'No se pudo cargar la lista de operadores.');
      }
    });
  }

  fullName(operator: Operator) {
    return [operator.firstNames, operator.lastNames].filter(Boolean).join(' ') || 'Sin nombre';
  }

  toggleStatus(operator: Operator) {
    const next = !operator.isActive;
    const accion = next ? 'activar' : 'desactivar';
    if (!confirm(`Seguro que deseas ${accion} a ${this.fullName(operator)}?`)) return;

    this.busyId.set(operator.id);
    this.message.set('');
    this.listError.set('');
    this.api.setOperatorStatus(operator.id, next).subscribe({
      next: () => {
        this.busyId.set('');
        this.message.set(`Operador ${next ? 'activado' : 'desactivado'}: ${this.fullName(operator)}`);
        this.load();
      },
      error: e => {
        this.busyId.set('');
        this.listError.set(e?.error?.message ?? 'No se pudo cambiar el estado del operador.');
      }
    });
  }

  newOperator() {
    this.message.set('');
    this.error.set('');
    this.form.reset({firstNames: '', lastNames: '', phone: '', email: '', password: '', receiveFormNotifications: false});
    this.showForm.set(true);
  }

  submit() {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.message.set('');
    this.error.set('');

    const value = this.form.getRawValue();
    this.api.createOperator({
      email: value.email,
      password: value.password,
      firstNames: value.firstNames,
      lastNames: value.lastNames,
      phone: value.phone
    }).subscribe({
      next: response => {
        // El POST de crear no acepta la bandera de notificaciones,
        // asi que se envia despues con el PATCH de actualizar.
        if (value.receiveFormNotifications && response.id) {
          this.api.updateOperator(response.id, {receiveFormNotifications: true}).subscribe({
            next: () => this.finishCreate(value.email),
            error: () => this.finishCreate(value.email)
          });
          return;
        }
        this.finishCreate(value.email);
      },
      error: error => {
        this.loading.set(false);
        this.error.set(error?.error?.message ?? 'No se pudo crear el operador');
      }
    });
  }

  private finishCreate(email: string) {
    this.loading.set(false);
    this.message.set(`Operador creado: ${email}`);
    this.form.reset({firstNames: '', lastNames: '', phone: '', email: '', password: '', receiveFormNotifications: false});
    this.showForm.set(false);
    this.load();
  }
}