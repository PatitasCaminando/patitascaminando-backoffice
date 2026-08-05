import { Component, Input } from '@angular/core';
@Component({selector:'app-empty-state',standalone:true,template:`<div class="empty"><div>🐾</div><h3>{{title}}</h3><p>{{message}}</p></div>`})
export class EmptyStateComponent{@Input()title='Sin registros';@Input()message='Todavía no hay información para mostrar.';}
