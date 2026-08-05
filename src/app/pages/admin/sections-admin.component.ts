import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { SiteSection } from '../../core/models';

type ContentField = {
  label: string;
  value: string;
};

@Component({
  selector: 'app-sections-admin',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="page-title">
      <div>
        <span class="eyebrow">Sitio publico</span>
        <h1>Contenido web</h1>
      </div>
      <button class="btn btn-primary" (click)="newItem()">+ Nueva seccion</button>
    </div>

    <div class="content-grid">
      @for(s of rows(); track s.id) {
        <article class="card web-content-card">
          <div class="card-head">
            <span class="badge">{{sectionLabel(s.sectionKey)}}</span>
            <span>{{s.isPublished ? 'Publicada' : 'Borrador'}}</span>
          </div>
          <h3>{{s.title || 'Sin titulo'}}</h3>
          <div class="content-preview">
            @for(field of contentFields(s); track field.label) {
              <div>
                <strong>{{field.label}}</strong>
                <span>{{field.value}}</span>
              </div>
            } @empty {
              <p>Sin contenido registrado.</p>
            }
          </div>
          <div class="actions">
            <button class="btn btn-outline" (click)="edit(s)">Editar</button>
            <button class="icon-btn danger" (click)="remove(s)">Eliminar</button>
          </div>
        </article>
      }
    </div>

    @if(show()) {
      <div class="modal-backdrop">
        <div class="modal wide">
          <button class="modal-close" (click)="show.set(false)">x</button>
          <h2>{{editing() ? 'Editar' : 'Crear'}} seccion</h2>
          <form [formGroup]="form" (ngSubmit)="save()">
            <label>
              Tipo
              <select class="form-control" formControlName="sectionKey" (change)="resetContentFields()">
                <option value="rescatistas">Rescatistas</option>
                <option value="bienestar_animal">Bienestar animal</option>
                <option value="contacto">Contacto</option>
                <option value="redes_sociales">Redes sociales</option>
              </select>
            </label>

            <label>
              Titulo
              <input class="form-control" formControlName="title">
            </label>

            <div class="content-fields">
              <h3>Contenido</h3>

              @if(selectedSection === 'contacto') {
                <div class="form-grid">
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
                  WhatsApp
                  <input class="form-control" formControlName="whatsapp">
                </label>
              } @else if(selectedSection === 'redes_sociales') {
                <div class="form-grid">
                  <label>
                    Facebook
                    <input class="form-control" formControlName="facebook">
                  </label>
                  <label>
                    Instagram
                    <input class="form-control" formControlName="instagram">
                  </label>
                </div>
                <label>
                  WhatsApp
                  <input class="form-control" formControlName="whatsapp">
                </label>
              } @else {
                <label>
                  Texto
                  <textarea class="form-control" rows="7" formControlName="mainText"></textarea>
                </label>
              }
            </div>

            <div class="form-grid">
              <label>
                Orden
                <input class="form-control" type="number" formControlName="displayOrder">
              </label>
              <label class="check">
                <input type="checkbox" formControlName="isPublished"> Publicada
              </label>
            </div>

            @if(error()) {
              <div class="alert error">{{error()}}</div>
            }

            <button class="btn btn-primary btn-block">Guardar seccion</button>
          </form>
        </div>
      </div>
    }
  `
})
export class SectionsAdminComponent implements OnInit {
  rows = signal<SiteSection[]>([]);
  show = signal(false);
  editing = signal<SiteSection | null>(null);
  error = signal('');

  form = this.fb.nonNullable.group({
    sectionKey: ['rescatistas' as SiteSection['sectionKey'], Validators.required],
    title: [''],
    mainText: [''],
    phone: [''],
    email: [''],
    facebook: [''],
    instagram: [''],
    whatsapp: [''],
    isPublished: [true],
    displayOrder: [0]
  });

  constructor(private fb: FormBuilder, private api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  get selectedSection() {
    return this.form.controls.sectionKey.value;
  }

  load() {
    this.api.adminSections().subscribe(v => this.rows.set(v));
  }

  newItem() {
    this.editing.set(null);
    this.form.reset({
      sectionKey: 'rescatistas',
      title: '',
      mainText: '',
      phone: '',
      email: '',
      facebook: '',
      instagram: '',
      whatsapp: '',
      isPublished: true,
      displayOrder: 0
    });
    this.show.set(true);
  }

  edit(section: SiteSection) {
    const content = section.content || {};
    this.editing.set(section);
    this.form.setValue({
      sectionKey: section.sectionKey,
      title: section.title || '',
      mainText: this.stringValue(content['texto'] ?? content['descripcion'] ?? content['contenido']),
      phone: this.stringValue(content['telefono'] ?? content['phone']),
      email: this.stringValue(content['correo'] ?? content['email']),
      facebook: this.stringValue(content['facebook']),
      instagram: this.stringValue(content['instagram']),
      whatsapp: this.stringValue(content['whatsapp']),
      isPublished: section.isPublished,
      displayOrder: section.displayOrder
    });
    this.show.set(true);
  }

  resetContentFields() {
    this.form.patchValue({
      mainText: '',
      phone: '',
      email: '',
      facebook: '',
      instagram: '',
      whatsapp: ''
    });
  }

  save() {
    this.error.set('');
    const value = this.form.getRawValue();
    const body = {
      sectionKey: value.sectionKey,
      title: value.title,
      content: this.buildContent(value),
      isPublished: value.isPublished,
      displayOrder: Number(value.displayOrder)
    };
    const request = this.editing()
      ? this.api.updateSection(this.editing()!.id, body)
      : this.api.createSection(body);

    request.subscribe({
      next: () => {
        this.show.set(false);
        this.load();
      },
      error: e => this.error.set(e?.error?.message ?? 'No se pudo guardar')
    });
  }

  remove(section: SiteSection) {
    if (confirm('Eliminar esta seccion?')) {
      this.api.deleteSection(section.id).subscribe(() => this.load());
    }
  }

  sectionLabel(sectionKey: SiteSection['sectionKey']) {
    const labels: Record<SiteSection['sectionKey'], string> = {
      rescatistas: 'Rescatistas',
      bienestar_animal: 'Bienestar animal',
      contacto: 'Contacto',
      redes_sociales: 'Redes sociales'
    };
    return labels[sectionKey];
  }

  contentFields(section: SiteSection): ContentField[] {
    const entries: Record<string, string> = {
      texto: 'Texto',
      descripcion: 'Descripcion',
      contenido: 'Contenido',
      telefono: 'Telefono',
      correo: 'Correo',
      email: 'Correo',
      facebook: 'Facebook',
      instagram: 'Instagram',
      whatsapp: 'WhatsApp'
    };

    return Object.entries(section.content || {})
      .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
      .map(([key, value]) => ({
        label: entries[key] || this.humanizeKey(key),
        value: Array.isArray(value) ? value.join(', ') : String(value)
      }));
  }

  private buildContent(value: ReturnType<typeof this.form.getRawValue>): Record<string, unknown> {
    if (value.sectionKey === 'contacto') {
      return this.cleanContent({
        telefono: value.phone,
        correo: value.email,
        whatsapp: value.whatsapp
      });
    }

    if (value.sectionKey === 'redes_sociales') {
      return this.cleanContent({
        facebook: value.facebook,
        instagram: value.instagram,
        whatsapp: value.whatsapp
      });
    }

    return this.cleanContent({ texto: value.mainText });
  }

  private cleanContent(content: Record<string, string>) {
    return Object.fromEntries(
      Object.entries(content).filter(([, value]) => value.trim() !== '')
    );
  }

  private stringValue(value: unknown) {
    return value === null || value === undefined ? '' : String(value);
  }

  private humanizeKey(key: string) {
    return key.replace(/_/g, ' ').replace(/^\w/, char => char.toUpperCase());
  }
}
