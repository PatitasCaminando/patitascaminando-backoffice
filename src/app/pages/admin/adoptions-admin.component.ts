import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { ImageService } from '../../core/image.service';
import { AdoptionApplication, AdoptionStatus, Animal } from '../../core/models';
import { StatusPipe } from '../../shared/status.pipe';

type TabKey = 'todas' | AdoptionStatus;

@Component({
  selector: 'app-adoptions-admin',
  standalone: true,
  imports: [FormsModule, StatusPipe, DatePipe],
  template: `
    <div class="page-title">
      <div>
        <span class="eyebrow">Seguimiento</span>
        <h1>Solicitudes de adopci&oacute;n</h1>
      </div>
    </div>

    <div class="status-tabs">
      @for(t of tabs; track t.key) {
        <button class="status-tab" [class.active]="tab() === t.key" (click)="selectTab(t.key)">
          {{t.label}} <span class="status-tab-count">{{countFor(t.key)}}</span>
        </button>
      }
    </div>

    <div class="card table-card adoptions-table">
      <table>
        <thead>
          <tr>
            <th>Solicitante</th>
            <th>Animal / motivo</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for(a of pageRows(); track a.id) {
            <tr>
              <td>
                <strong>{{a.firstNames}} {{a.lastNames}}</strong><br>
                <small>{{a.email}} &middot; {{a.phone}}</small>
              </td>
              <td>
                <div class="adoption-animal-cell">
                  <img [src]="adoptionImage(a)" [alt]="adoptionAnimalName(a)">
                  <div>
                    <strong>{{adoptionAnimalName(a)}}</strong>
                    <small>{{a.adoptionReason}}</small>
                  </div>
                </div>
              </td>
              <td>{{a.submittedAt | date:'dd/MM/yyyy'}}</td>
              <td><span class="status" [attr.data-status]="a.status">{{a.status | statusLabel}}</span></td>
              <td>
                <button class="icon-btn" (click)="selected.set(a); status = a.status; observations = a.internalObservations || ''">Gestionar</button>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="5" class="empty-table">No hay solicitudes en este estado.</td></tr>
          }
        </tbody>
      </table>
    </div>

    @if(totalPages() > 1) {
      <div class="pager">
        <button class="icon-btn" [disabled]="page() === 1" (click)="goTo(page() - 1)">Anterior</button>
        <span class="pager-info">Pagina {{page()}} de {{totalPages()}} &middot; {{filtered().length}} solicitudes</span>
        <button class="icon-btn" [disabled]="page() === totalPages()" (click)="goTo(page() + 1)">Siguiente</button>
      </div>
    }

    @if(selected()) {
      <div class="modal-backdrop">
        <div class="modal">
          <button class="modal-close" (click)="selected.set(null)">&times;</button>
          <h2>Gestionar solicitud</h2>
          <p><strong>{{selected()!.firstNames}} {{selected()!.lastNames}}</strong></p>
          <label>
            Estado
            <select class="form-control" [(ngModel)]="status">
              <option value="recibida">Recibida</option>
              <option value="contactada">Contactada</option>
              <option value="cita_programada">Cita programada</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </label>
          <label>
            Observaciones internas
            <textarea class="form-control" [(ngModel)]="observations"></textarea>
          </label>
          <button class="btn btn-primary btn-block" (click)="save()">Guardar cambio</button>
        </div>
      </div>
    }
  `
})
export class AdoptionsAdminComponent implements OnInit {
  rows = signal<AdoptionApplication[]>([]);
  animals = signal<Animal[]>([]);
  selected = signal<AdoptionApplication | null>(null);
  tab = signal<TabKey>('todas');
  page = signal(1);
  readonly pageSize = 10;
  status: AdoptionStatus = 'recibida';
  observations = '';

  readonly tabs: {key: TabKey; label: string}[] = [
    {key: 'todas', label: 'Todas'},
    {key: 'recibida', label: 'Recibidas'},
    {key: 'contactada', label: 'Contactadas'},
    {key: 'cita_programada', label: 'Cita programada'},
    {key: 'aprobada', label: 'Aprobadas'},
    {key: 'rechazada', label: 'Rechazadas'},
    {key: 'cancelada', label: 'Canceladas'}
  ];

  constructor(private api: ApiService, public images: ImageService) {}

  ngOnInit() {
    this.load();
    this.api.adminAnimals().subscribe(v => this.animals.set(v));
  }

  load() {
    // Se traen todas porque la API no filtra por estado; el filtro y la
    // paginacion se resuelven aqui para poder mostrar las pestanas.
    this.api.adoptionsPage(1, 100).subscribe(r => {
      this.rows.set(r.items ?? []);
      if (this.page() > this.totalPages()) this.page.set(this.totalPages());
    });
  }

  countFor(key: TabKey) {
    return key === 'todas' ? this.rows().length : this.rows().filter(r => r.status === key).length;
  }

  filtered() {
    const t = this.tab();
    return t === 'todas' ? this.rows() : this.rows().filter(r => r.status === t);
  }

  totalPages() {
    return Math.max(1, Math.ceil(this.filtered().length / this.pageSize));
  }

  pageRows() {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  }

  selectTab(key: TabKey) {
    if (this.tab() === key) return;
    this.tab.set(key);
    this.page.set(1);
  }

  goTo(p: number) {
    if (p < 1 || p > this.totalPages() || p === this.page()) return;
    this.page.set(p);
  }

  adoptionAnimal(a: AdoptionApplication) {
    return this.animals().find(item => item.id === a.specificAnimalId) || null;
  }

  adoptionAnimalName(a: AdoptionApplication) {
    return this.adoptionAnimal(a)?.name || a.desiredAnimalDescription || 'Mascota';
  }

  adoptionImage(a: AdoptionApplication) {
    return this.images.url(this.adoptionAnimal(a)?.photoPaths?.[0]);
  }

  save() {
    if (!this.selected()) return;
    this.api.updateAdoptionStatus(this.selected()!.id, this.status, this.observations).subscribe(() => {
      this.selected.set(null);
      this.load();
    });
  }
}