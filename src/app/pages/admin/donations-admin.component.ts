import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { DonationOffer, DonationStatus } from '../../core/models';
import { StatusPipe } from '../../shared/status.pipe';

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
          @for(d of rows(); track d.id) {
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
          }
        </tbody>
      </table>
    </div>

    @if(totalPages() > 1) {
      <div class="pager">
        <button class="icon-btn" [disabled]="page() === 1" (click)="goTo(page() - 1)">Anterior</button>
        <span class="pager-info">Pagina {{page()}} de {{totalPages()}} &middot; {{total()}} ofrecimientos</span>
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
  page = signal(1);
  totalPages = signal(1);
  total = signal(0);
  readonly pageSize =10;
  status: DonationStatus = 'ofrecida';
  observations = '';

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.donationsPage(this.page(), this.pageSize).subscribe(r => {
      const items = r.items ?? [];
      this.total.set(r.total ?? items.length);
      this.totalPages.set(r.totalPages ?? 1);
      if (!items.length && this.page() > 1) { this.page.set(this.page() - 1); this.load(); return; }
      this.rows.set(items);
    });
  }

  goTo(p: number) {
    if (p < 1 || p > this.totalPages() || p === this.page()) return;
    this.page.set(p);
    this.load();
  }

  save() {
    if (!this.selected()) return;
    this.api.updateDonationStatus(this.selected()!.id, this.status, this.observations).subscribe(() => {
      this.selected.set(null);
      this.load();
    });
  }
}