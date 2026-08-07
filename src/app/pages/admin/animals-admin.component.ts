import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Animal } from '../../core/models';
import { ImageService } from '../../core/image.service';
import { StatusPipe } from '../../shared/status.pipe';

@Component({
  selector: 'app-animals-admin',
  standalone: true,
  imports: [ReactiveFormsModule, StatusPipe],
  template: `
    <div class="page-title">
      <div>
        <span class="eyebrow">Catalogo</span>
        <h1>Animales</h1>
      </div>
      <button class="btn btn-primary" (click)="openNew()">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
        <span>Nuevo animal</span>
      </button>
    </div>

    <div class="card table-card animals-table">
      <table>
        <thead>
          <tr>
            <th>Animal</th>
            <th>Datos</th>
            <th>Estado</th>
            <th>Visibilidad</th>
            <th class="actions-col"></th>
          </tr>
        </thead>
        <tbody>
          @for(a of animals(); track a.id) {
            <tr>
              <td>
                <div class="table-person">
                  <img [src]="images.url(a.photoPaths[0])" [alt]="a.name">
                  <strong>{{a.name}}</strong>
                </div>
              </td>
              <td>
                <span class="animal-data">{{a.species}} · {{a.sex}} · {{a.size}}</span>
                <small>{{a.approximateAge}}</small>
              </td>
              <td><span class="status" [attr.data-status]="a.status">{{a.status|statusLabel}}</span></td>
              <td>{{a.isPubliclyVisible ? 'Publico' : 'Oculto'}}</td>
              <td>
                <div class="row-actions">
                  <button class="icon-btn" (click)="edit(a)" aria-label="Editar animal">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
                    <span>Editar</span>
                  </button>
                  <button class="icon-btn danger" (click)="remove(a)" aria-label="Eliminar animal">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/></svg>
                    <span>Eliminar</span>
                  </button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    @if(totalPages() > 1) {
      <div class="pager">
        <button class="icon-btn" [disabled]="page() === 1" (click)="goTo(page() - 1)">Anterior</button>
        <span class="pager-info">Pagina {{page()}} de {{totalPages()}} · {{total()}} animales</span>
        <button class="icon-btn" [disabled]="page() === totalPages()" (click)="goTo(page() + 1)">Siguiente</button>
      </div>
    }

    @if(show()) {
      <div class="modal-backdrop">
        <div class="modal wide">
          <button class="modal-close" (click)="show.set(false)">×</button>
          <h2>{{editing() ? 'Editar' : 'Registrar'}} animal</h2>
          <form [formGroup]="form" (ngSubmit)="save()">
            <div class="form-grid">
              <label>Nombre<input class="form-control" formControlName="name"></label>
              <label>Especie<select class="form-control" formControlName="species"><option value="perro">Perro</option><option value="gato">Gato</option><option value="otro">Otro</option></select></label>
              <label>Sexo<select class="form-control" formControlName="sex"><option value="macho">Macho</option><option value="hembra">Hembra</option></select></label>
              <label>Tamano<select class="form-control" formControlName="size"><option value="pequeño">Pequeno</option><option value="mediano">Mediano</option><option value="grande">Grande</option><option value="no_especificado">No especificado</option></select></label>
              <label>Edad aproximada<select class="form-control" formControlName="approximateAge"><option value="0 a 6 meses">0 a 6 meses</option><option value="7 a 12 meses">7 a 12 meses</option><option value="1 a 3 años">1 a 3 años</option><option value="4 a 7 años">4 a 7 años</option><option value="8 años o más">8 años o más</option></select></label>
              <label>Estado<select class="form-control" formControlName="status"><option value="disponible">Disponible</option><option value="en_proceso">En proceso</option><option value="adoptado">Adoptado</option><option value="no_disponible">No disponible</option><option value="archivado">Archivado</option></select></label>
            </div>
            <label>Descripcion<textarea class="form-control" formControlName="description"></textarea></label>
            <label>Condicion general<textarea class="form-control" formControlName="generalCondition"></textarea></label>
            <label>Imagen<input type="file" accept="image/*" (change)="upload($event)"></label>
            @if(uploading()) { <p>Subiendo imagen...</p> }
            <div class="check-grid">
              <label class="check"><input type="checkbox" formControlName="isActive"> Activo</label>
              <label class="check"><input type="checkbox" formControlName="isPubliclyVisible"> Visible publicamente</label>
            </div>
            <button class="btn btn-primary btn-block" [disabled]="form.invalid||saving()||uploading()">Guardar</button>
          </form>
        </div>
      </div>
    }
  `
})
export class AnimalsAdminComponent implements OnInit {
  animals = signal<Animal[]>([]);
  page = signal(1);
  totalPages = signal(1);
  total = signal(0);
  readonly pageSize = 10;
  show = signal(false);
  editing = signal<Animal|null>(null);
  saving = signal(false);
  uploading = signal(false);
  photoPaths = signal<string[]>([]);
  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    species: ['perro', Validators.required],
    sex: ['macho', Validators.required],
    size: ['mediano', Validators.required],
    approximateAge: ['1 a 3 años', Validators.required],
    status: ['disponible' as Animal['status'], Validators.required],
    description: ['', Validators.required],
    generalCondition: ['', Validators.required],
    isActive: [true],
    isPubliclyVisible: [true]
  });

  constructor(private fb: FormBuilder, private api: ApiService, public images: ImageService) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.adminAnimalsPage(this.page(), this.pageSize).subscribe(r => {
      const items = r.items ?? [];
      this.total.set(r.total ?? items.length);
      this.totalPages.set(r.totalPages ?? 1);
      if (!items.length && this.page() > 1) { this.page.set(this.page() - 1); this.load(); return; }
      this.animals.set(items);
    });
  }

  goTo(p: number) {
    if (p < 1 || p > this.totalPages() || p === this.page()) return;
    this.page.set(p);
    this.load();
  }

  openNew() { this.editing.set(null); this.photoPaths.set([]); this.form.reset({species:'perro', sex:'macho', size:'mediano', approximateAge:'1 a 3 años', status:'disponible', isActive:true, isPubliclyVisible:true} as never); this.show.set(true); }
  edit(a: Animal) { this.editing.set(a); this.photoPaths.set(a.photoPaths || []); this.form.patchValue(a); this.show.set(true); }
  async upload(ev: Event) { const file = (ev.target as HTMLInputElement).files?.[0]; if (!file) return; this.uploading.set(true); try { const p = await this.images.upload(file); this.photoPaths.update(v => [p, ...v]); } catch(e) { alert(e instanceof Error ? e.message : 'No se pudo subir la imagen'); } finally { this.uploading.set(false); } }
  save() { if (this.form.invalid) return; if (!this.photoPaths().length) { alert('Debes seleccionar al menos una imagen.'); return; } this.saving.set(true); const body = {...this.form.getRawValue(), photoPaths:this.photoPaths()}; const req = this.editing() ? this.api.updateAnimal(this.editing()!.id, body) : this.api.createAnimal(body); req.subscribe({next: () => { this.saving.set(false); this.show.set(false); this.load(); }, error: e => { this.saving.set(false); alert(e?.error?.message ?? 'No se pudo guardar'); }}); }
  remove(a: Animal) { if (confirm(`Eliminar a ${a.name}?`)) this.api.deleteAnimal(a.id).subscribe(() => this.load()); }
}