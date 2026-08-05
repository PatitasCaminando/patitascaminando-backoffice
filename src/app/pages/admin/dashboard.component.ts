import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AdoptionApplication, Animal, DonationOffer, Notification } from '../../core/models';

type DashboardActivity = {
  icon: string;
  title: string;
  description: string;
  date: string;
};

type AdoptionState = {
  label: string;
  count: number;
  percent: number;
  className: string;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-title">
      <div>
        <span class="eyebrow">Panel de control</span>
        <h1>Resumen general</h1>
      </div>
    </div>

    <div class="stats">
      <a routerLink="/admin/animales">
        <span class="stat-icon animals-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5.5" cy="10.5" r="2.5"/><circle cx="18.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="6" r="2.2"/><circle cx="15.5" cy="6" r="2.2"/><path d="M7 17.5c0-3 2.2-5 5-5s5 2 5 5c0 1.8-1.2 3-2.8 3H9.8C8.2 20.5 7 19.3 7 17.5z"/></svg>
        </span>
        <div><strong>{{animals()}}</strong><small>Animales registrados</small></div>
      </a>
      <a routerLink="/admin/adopciones">
        <span class="stat-icon adoption-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.4-9.2-9A5.2 5.2 0 0 1 12 6a5.2 5.2 0 0 1 9.2 6c-2.2 4.6-9.2 9-9.2 9z"/></svg>
        </span>
        <div><strong>{{adoptions()}}</strong><small>Solicitudes de adopción</small></div>
      </a>
      <a routerLink="/admin/donaciones">
        <span class="stat-icon donation-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12v8H4v-8"/><path d="M2 7h20v5H2z"/><path d="M12 7v13"/><path d="M12 7H8.5A2.5 2.5 0 1 1 12 4.5z"/><path d="M12 7h3.5A2.5 2.5 0 1 0 12 4.5z"/></svg>
        </span>
        <div><strong>{{donations()}}</strong><small>Ofrecimientos</small></div>
      </a>
      <a routerLink="/admin/notificaciones">
        <span class="stat-icon notification-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>
        </span>
        <div><strong>{{notifications()}}</strong><small>Notificaciones sin leer</small></div>
      </a>
    </div>

    <section class="dashboard-panels" aria-label="Resumen operativo">
      <article class="dashboard-panel quick-panel">
        <div class="panel-heading">
          <span class="panel-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z"/></svg>
          </span>
          <h2>Acciones rápidas</h2>
        </div>
        <div class="panel-actions">
          <a routerLink="/admin/animales" class="btn btn-primary">Gestionar animales</a>
          <a routerLink="/admin/adopciones" class="btn btn-secondary">Revisar adopciones</a>
          <a routerLink="/admin/donaciones" class="btn btn-outline">Revisar donaciones</a>
        </div>
      </article>

      <article class="dashboard-panel activity-panel">
        <div class="panel-heading">
          <span class="panel-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h4l3 8 4-16 3 8h4"/></svg>
          </span>
          <h2>Actividad reciente</h2>
        </div>
        <div class="activity-list">
          @for(activity of recentActivities(); track activity.title + activity.date) {
            <div class="activity-item">
              <span class="activity-icon">{{activity.icon}}</span>
              <div>
                <strong>{{activity.title}}</strong>
                <small>{{activity.description}}</small>
              </div>
              <time>{{formatTime(activity.date)}}</time>
            </div>
          } @empty {
            <p class="panel-empty">Sin movimientos recientes</p>
          }
        </div>
      </article>

      <article class="dashboard-panel adoption-status-panel">
        <div class="panel-heading">
          <span class="panel-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 15v-4"/><path d="M12 15V8"/><path d="M16 15v-6"/></svg>
          </span>
          <h2>Adopciones por estado</h2>
        </div>
        <div class="status-list">
          @for(item of adoptionStates(); track item.label) {
            <div class="status-progress {{item.className}}">
              <div class="status-progress-head">
                <span>{{item.label}}</span>
                <strong>{{item.count}} · {{item.percent}}%</strong>
              </div>
              <div class="progress-track">
                <span class="progress-bar" [style.width.%]="item.percent"></span>
              </div>
            </div>
          }
        </div>
      </article>
    </section>
  `
})
export class DashboardComponent implements OnInit {
  animals = signal(0);
  adoptions = signal(0);
  donations = signal(0);
  notifications = signal(0);

  private animalRows = signal<Animal[]>([]);
  private adoptionRows = signal<AdoptionApplication[]>([]);
  private donationRows = signal<DonationOffer[]>([]);
  private notificationRows = signal<Notification[]>([]);

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.adminAnimals().subscribe(v => {
      this.animals.set(v.length);
      this.animalRows.set(v);
    });
    this.api.adoptions().subscribe(v => {
      this.adoptions.set(v.length);
      this.adoptionRows.set(v);
    });
    this.api.donations().subscribe(v => {
      this.donations.set(v.length);
      this.donationRows.set(v);
    });
    this.api.notifications().subscribe(v => {
      this.notifications.set(v.filter(x => !x.isRead).length);
      this.notificationRows.set(v);
    });
  }

  recentActivities(): DashboardActivity[] {
    const animals = this.animalRows().map(item => ({
      icon: '🐾',
      title: 'Nuevo animal registrado',
      description: item.name,
      date: item.createdAt
    }));
    const adoptions = this.adoptionRows().map(item => ({
      icon: '♡',
      title: 'Solicitud de adopción',
      description: `${item.firstNames} ${item.lastNames}`.trim(),
      date: item.submittedAt
    }));
    const donations = this.donationRows().map(item => ({
      icon: '▣',
      title: 'Nuevo ofrecimiento',
      description: `${item.firstNames} ${item.lastNames}`.trim(),
      date: item.submittedAt
    }));
    const notifications = this.notificationRows().map(item => ({
      icon: '◷',
      title: item.title,
      description: item.personName || item.message,
      date: item.createdAt
    }));

    return [...animals, ...adoptions, ...donations, ...notifications]
      .filter(item => Boolean(item.date))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4);
  }

  adoptionStates(): AdoptionState[] {
    const rows = this.adoptionRows();
    const total = rows.length || 1;
    const count = (...statuses: AdoptionApplication['status'][]) => rows.filter(item => statuses.includes(item.status)).length;
    const make = (label: string, className: string, value: number) => ({
      label,
      className,
      count: value,
      percent: Math.round((value / total) * 100)
    });

    return [
      make('Pendientes', 'pending', count('recibida')),
      make('En proceso', 'process', count('contactada', 'cita_programada')),
      make('Completadas', 'completed', count('aprobada')),
      make('Rechazadas', 'rejected', count('rechazada', 'cancelada'))
    ];
  }

  formatTime(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--:--';
    return new Intl.DateTimeFormat('es-EC', { hour: '2-digit', minute: '2-digit' }).format(date);
  }
}
