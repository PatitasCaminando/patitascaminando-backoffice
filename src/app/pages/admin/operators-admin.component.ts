import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';

type OperatorRow = {
  id: string;
  firstNames: string;
  lastNames: string;
  phone: string;
  email: string;
};

@Component({
  selector: 'app-operators-admin',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="page-title">
      <div>
        <span class="eyebrow">Usuarios internos</span>
        <h1>Crear operadores</h1>
      </div>
      <button class="btn btn-primary" (click)="newOperator()">+ Nuevo operador</button>
    </div>

    @if(message()) {
      <div class="alert success">{{message()}}</div>
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
          </tr>
        </thead>
        <tbody>
          @for(operator of operators(); track operator.id) {
            <tr>
              <td><strong>{{operator.firstNames}} {{operator.lastNames}}</strong></td>
              <td>{{operator.email}}</td>
              <td>{{operator.phone || 'Sin registrar'}}</td>
            </tr>
          } @empty {
            <tr>
              <td colspan="3" class="empty-table">Aun no se han creado operadores.</td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    @if(showForm()) {
      <div class="modal-backdrop">
        <div class="modal wide">
          <button class="modal-close" (click)="showForm.set(false)">x</button>
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
  private readonly storageKey = 'pc_created_operators';

  loading = signal(false);
  showForm = signal(false);
  message = signal('');
  error = signal('');
  operators = signal<OperatorRow[]>([]);

  form = this.fb.nonNullable.group({
    firstNames: ['', Validators.required],
    lastNames: ['', Validators.required],
    phone: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(private fb: FormBuilder, private api: ApiService) {}

  ngOnInit() {
    this.operators.set(this.loadStoredOperators());
  }

  newOperator() {
    this.message.set('');
    this.error.set('');
    this.form.reset({firstNames: '', lastNames: '', phone: '', email: '', password: ''});
    this.showForm.set(true);
  }

  submit() {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.message.set('');
    this.error.set('');

    const value = this.form.getRawValue();
    this.api.createOperator(value).subscribe({
      next: response => {
        const operator: OperatorRow = {
          id: response.id,
          firstNames: value.firstNames,
          lastNames: value.lastNames,
          phone: value.phone,
          email: response.email || value.email
        };

        const updated = [operator, ...this.operators().filter(item => item.email !== operator.email)];
        this.operators.set(updated);
        this.saveStoredOperators(updated);
        this.loading.set(false);
        this.message.set(`Operador creado: ${operator.email}`);
        this.form.reset({firstNames: '', lastNames: '', phone: '', email: '', password: ''});
        this.showForm.set(false);
      },
      error: error => {
        this.loading.set(false);
        this.error.set(error?.error?.message ?? 'No se pudo crear el operador');
      }
    });
  }

  private loadStoredOperators() {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return [];

    try {
      return JSON.parse(raw) as OperatorRow[];
    } catch {
      return [];
    }
  }

  private saveStoredOperators(operators: OperatorRow[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(operators));
  }

}
