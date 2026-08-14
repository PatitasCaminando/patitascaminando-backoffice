import { Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { ApiService } from './api.service';
import { CurrentUser } from './models';

@Injectable({providedIn:'root'})
export class AuthService {
  readonly user = signal<CurrentUser|null>(null);

  constructor(private api:ApiService){}

  get token(){ return localStorage.getItem('pc_access_token'); }

  login(email:string,password:string){
    return this.api.login({email:email.trim().toLowerCase(),password}).pipe(tap(s=>{
      localStorage.setItem('pc_access_token',s.accessToken);
      localStorage.setItem('pc_refresh_token',s.refreshToken);
      localStorage.setItem('pc_session',JSON.stringify(s));
    }));
  }

  loadMe(){
    return this.api.me().pipe(tap(u=>this.user.set(u)));
  }

  hasRole(role:string){ return this.user()?.roles.some(r=>r.key===role)??false; }

  updateLocalProfile(profile:{firstNames:string;lastNames:string;phone:string}){
    const current = this.user();
    if(!current) return;
    this.user.set({...current,profile});
  }

  logout(){
    localStorage.removeItem('pc_access_token');
    localStorage.removeItem('pc_refresh_token');
    localStorage.removeItem('pc_session');
    sessionStorage.removeItem('pc_access_token');
    sessionStorage.removeItem('pc_refresh_token');
    sessionStorage.removeItem('pc_session');
    this.user.set(null);
    window.location.assign(`${window.location.origin}/login`);
  }
}