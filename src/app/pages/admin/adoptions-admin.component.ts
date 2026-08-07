import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { ImageService } from '../../core/image.service';
import { AdoptionApplication, AdoptionStatus, Animal } from '../../core/models';
import { StatusPipe } from '../../shared/status.pipe';

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
          @for(a of rows(); track a.id) {
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
          }
        </tbody>
      </table>
    </div>

    @if(totalPages() > 1) {
      <div class="pager">
        <button class="icon-btn" [disabled]="page() === 1" (click)="goTo(page() - 1)">Anterior</button>
        <span class="pager-info">Pagina {{page()}} de {{totalPages()}} &middot; {{total()}} solicitudes</span>
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
  page = signal(1);
  totalPages = signal(1);
  total = signal(0);
  readonly pageSize = 10;
  status: AdoptionStatus = 'recibida';
  observations = '';

  constructor(private api: ApiService, public images: ImageService) {}

  ngOnInit() {
    this.load();
    this.api.adminAnimals().subscribe(v => this.animals.set(v));
  }

  load() {
    this.api.adoptionsPage(this.page(), this.pageSize).subscribe(r => {
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