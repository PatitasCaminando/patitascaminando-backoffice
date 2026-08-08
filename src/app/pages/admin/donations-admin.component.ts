import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { DonationOffer, DonationStatus } from '../../core/models';
import { StatusPipe } from '../../shared/status.pipe';

type TabKey = 'todas' | DonationStatus;

@Component({
  selector: 'app-donations-admin',
  standalone: true,
  imports: [FormsModule, StatusPipe, DatePipe],
  template: `
    <div class="page-title">
      <div>
        <span class="eyebrow">Aportes</span>
        <h1>Ofrecimientos de donaci&oacute;n</h1>
      </div>
    </div>

    <div class="status-tabs">
      @for(t of tabs; track t.key) {
        <button class="status-tab" [class.active]="tab() === t.key" (click)="selectTab(t.key)">
          {{t.label}} <span class="status-tab-count">{{countFor(t.key)}}</span>
        </button>
      }
    </div>

    <div class="card table-card">
      <table>
        <thead>
          <tr>
            <th>Donante</th>
            <th>Art&iacute;culos</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for(d of pageRows(); track d.id) {
            <tr>
              <td>
                <strong>{{d.firstNames}} {{d.lastNames}}</strong><br>
                <small>{{d.email}} &middot; {{d.phone}}</small>
              </td>
              <td>
                {{d.selectedItems.join(', ')}}<br>
                <small>{{d.descriptionObservation}}</small>
              </td>
              <td>{{d.submittedAt | date:'dd/MM/yyyy'}}</td>
              <td><span class="status" [attr.data-status]="d.status">{{d.status | statusLabel}}</span></td>
              <td>
                <button class="icon-btn" (click)="selected.set(d); status = d.status; observations = d.internalObservations || ''">Gestionar</button>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="5" class="empty-table">No hay ofrecimientos en este estado.</td></tr>
          }
        </tbody>
      </table>
    </div>

    @if(totalPages() > 1) {
      <div class="pager">
        <button class="icon-btn" [disabled]="page() === 1" (click)="goTo(page() - 1)">Anterior</button>
        <span class="pager-info">Pagina {{page()}} de {{totalPages()}} &middot; {{filtered().length}} ofrecimientos</span>
        <button class="icon-btn" [disabled]="page() === totalPages()" (click)="goTo(page() + 1)">Siguiente</button>
      </div>
    }

    @if(selected()) {
      <div class="modal-backdrop">
        <div class="modal">
          <button class="modal-close" (click)="selected.set(null)">&times;</button>
          <h2>Gestionar donaci&oacute;n</h2>
          <label>
            Estado
            <select class="form-control" [(ngModel)]="status">
              <option value="ofrecida">Ofrecida</option>
              <option value="contactada">Contactada</option>
              <option value="entrega_coordinada">Entrega coordinada</option>
              <option value="recibida">Recibida</option>
              <option value="no_aceptada">No aceptada</option>
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
export class DonationsAdminComponent implements OnInit {
  rows = signal<DonationOffer[]>([]);
  selected = signal<DonationOffer | null>(null);
  tab = signal<TabKey>('todas');
  page = signal(1);
  readonly pageSize = 10;
  status: DonationStatus = 'ofrecida';
  observations = '';

  readonly tabs: {key: TabKey; label: string}[] = [
    {key: 'todas', label: 'Todas'},
    {key: 'ofrecida', label: 'Ofrecidas'},
    {key: 'contactada', label: 'Contactadas'},
    {key: 'entrega_coordinada', label: 'Entrega coordinada'},
    {key: 'recibida', label: 'Recibidas'},
    {key: 'no_aceptada', label: 'No aceptadas'},
    {key: 'cancelada', label: 'Canceladas'}
  ];

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    // Se traen todas porque la API no filtra por estado; el filtro y la
    // paginacion se resuelven aqui para poder mostrar las pestanas.
    this.api.donationsPage(1, 100).subscribe(r => {
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

  save() {
    if (!this.selected()) return;
    this.api.updateDonationStatus(this.selected()!.id, this.status, this.observations).subscribe(() => {
      this.selected.set(null);
      this.load();
    });
  }
}