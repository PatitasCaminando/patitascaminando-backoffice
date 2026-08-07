import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Notification } from '../../core/models';
import { EmptyStateComponent } from '../../shared/empty-state.component';
@Component({
  selector: 'app-notifications-admin',
  standalone: true,
  imports: [DatePipe, EmptyStateComponent],
  template: `
    <div class="page-title">
      <div>
        <span class="eyebrow">Bandeja</span>
        <h1>Notificaciones</h1>
      </div>
    </div>
    <div class="notifications">
      @for(n of rows(); track n.id) {
        <a class="notification" [class.unread]="!n.isRead" href="javascript:void(0)" (click)="open(n)">
          <div class="notification-icon">
            @if(isDonation(n)) {
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12v8H4v-8"/><path d="M2 7h20v5H2z"/><path d="M12 7v13"/><path d="M12 7H8.5A2.5 2.5 0 1 1 12 4.5z"/><path d="M12 7h3.5A2.5 2.5 0 1 0 12 4.5z"/></svg>
            } @else {
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.4-9.2-9A5.2 5.2 0 0 1 12 6a5.2 5.2 0 0 1 9.2 6c-2.2 4.6-9.2 9-9.2 9z"/></svg>
            }
          </div>
          <div>
            <div class="notification-head">
              <strong>{{n.title}}</strong>
              <small>{{n.createdAt | date:'dd/MM/yyyy HH:mm'}}</small>
            </div>
            <p>{{n.message}}</p>
            <span>{{n.personName}}</span>
          </div>
        </a>
      } @empty {
        <app-empty-state title="Sin notificaciones" message="Las nuevas adopciones y donaciones apareceran aqui."/>
      }
    </div>
  `
})
export class NotificationsAdminComponent implements OnInit {
  rows = signal<Notification[]>([]);
  constructor(private api: ApiService, private router: Router) {}
  ngOnInit() {
    this.load();
  }
  load() {
    this.api.notifications().subscribe(v => this.rows.set(v));
  }
  notificationTarget(notification: Notification) {
    return this.isDonation(notification) ? '/admin/donaciones' : '/admin/adopciones';
  }
  isDonation(notification: Notification) {
    const value = `${notification.formType} ${notification.title} ${notification.message}`.toLowerCase();
    return value.includes('donaci') || value.includes('donation');
  }
  open(notification: Notification) {
    const target = this.notificationTarget(notification);
    if (notification.isRead) { this.router.navigateByUrl(target); return; }
    // Primero se marca como leida; solo cuando la API responde se navega,
    // asi la peticion no se cancela al destruirse el componente.
    this.api.markNotificationRead(notification.id).subscribe({
      next: () => this.router.navigateByUrl(target),
      error: () => this.router.navigateByUrl(target)
    });
  }
}