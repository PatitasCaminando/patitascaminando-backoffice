import { Injectable, signal } from '@angular/core';
import { of, tap } from 'rxjs';
import { ApiService } from './api.service';
import { CurrentUser } from './models';
@Injectable({providedIn:'root'})
export class AuthService {
  readonly user = signal<CurrentUser|null>(null);
  private readonly demoEmail = 'geovanna.velascop@hotmail.com';
  private readonly demoOperatorEmail = 'bdaza@gmail.com';
  private readonly demoPassword = 'Pisco1996@';
  private readonly demoToken = 'local-demo-token';
  private readonly demoOperatorToken = 'local-demo-operator-token';
  private readonly createdOperatorsKey = 'pc_created_operators';
  private readonly demoOperatorProfileKey = 'pc_demo_operator_profile';
  private readonly demoUser: CurrentUser = {
    id: 'local-demo-admin',
    email: this.demoEmail,
    profile: {firstNames: 'Geovanna', lastNames: 'Velasco', phone: null},
    roles: [{key: 'admin', name: 'Administrador', description: 'Acceso temporal local', isInternal: true}],
    permissions: []
  };
  private readonly demoOperatorUser: CurrentUser = {
    id: 'local-demo-operator',
    email: this.demoOperatorEmail,
    profile: {firstNames: 'Operador', lastNames: 'Temporal', phone: null},
    roles: [{key: 'operator', name: 'Operador', description: 'Acceso temporal local', isInternal: true}],
    permissions: []
  };
  constructor(private api:ApiService){}
  get token(){ return localStorage.getItem('pc_access_token'); }
  private get demoOperatorPassword(){ return localStorage.getItem('pc_operator_password') || this.demoPassword; }
  private get demoOperatorProfile(){
    const raw = localStorage.getItem(this.demoOperatorProfileKey);
    if(!raw) return this.demoOperatorUser.profile!;
    try{
      return {...this.demoOperatorUser.profile!,...JSON.parse(raw)};
    }catch{
      return this.demoOperatorUser.profile!;
    }
  }
  private get currentDemoOperatorUser(){
    return {...this.demoOperatorUser,profile:this.demoOperatorProfile};
  }
  login(email:string,password:string){
    const normalizedEmail = email.trim().toLowerCase();
    if(normalizedEmail===this.demoEmail&&password===this.demoPassword){
      const session={accessToken:this.demoToken,refreshToken:'local-demo-refresh-token',tokenType:'Bearer',expiresIn:86400,expiresAt:null,user:{id:this.demoUser.id,email:this.demoEmail}};
      localStorage.setItem('pc_access_token',session.accessToken);
      localStorage.setItem('pc_refresh_token',session.refreshToken);
      localStorage.setItem('pc_session',JSON.stringify(session));
      this.user.set(this.demoUser);
      return of(session);
    }
    if(normalizedEmail===this.demoOperatorEmail&&password===this.demoOperatorPassword){
      const session={accessToken:this.demoOperatorToken,refreshToken:'local-demo-operator-refresh-token',tokenType:'Bearer',expiresIn:86400,expiresAt:null,user:{id:this.demoOperatorUser.id,email:this.demoOperatorEmail}};
      localStorage.setItem('pc_access_token',session.accessToken);
      localStorage.setItem('pc_refresh_token',session.refreshToken);
      localStorage.setItem('pc_session',JSON.stringify(session));
      this.user.set(this.currentDemoOperatorUser);
      return of(session);
    }
    return this.api.login({email,password}).pipe(tap(s=>{localStorage.setItem('pc_access_token',s.accessToken);localStorage.setItem('pc_refresh_token',s.refreshToken);localStorage.setItem('pc_session',JSON.stringify(s));}));
  }
  loadMe(){
    if(this.token===this.demoToken){
      this.user.set(this.demoUser);
      return of(this.demoUser);
    }
    if(this.token===this.demoOperatorToken){
      this.user.set(this.currentDemoOperatorUser);
      return of(this.currentDemoOperatorUser);
    }
    return this.api.me().pipe(tap(u=>this.user.set(u)));
  }
  hasRole(role:string){ return this.user()?.roles.some(r=>r.key===role)??false; }
  updateLocalProfile(profile:{firstNames:string;lastNames:string;phone:string}){
    const current = this.user();
    if(!current) return;
    this.user.set({...current,profile});
    if(current.email===this.demoOperatorEmail){
      localStorage.setItem(this.demoOperatorProfileKey,JSON.stringify(profile));
      this.syncOperatorTable(profile,current.email);
    }
  }
  changeLocalOperatorPassword(currentPassword:string,newPassword:string){
    if(!this.hasRole('operator') || currentPassword!==this.demoOperatorPassword) return false;
    localStorage.setItem('pc_operator_password',newPassword);
    return true;
  }
  private syncOperatorTable(profile:{firstNames:string;lastNames:string;phone:string},email:string){
    const raw = localStorage.getItem(this.createdOperatorsKey);
    let operators:Array<{id:string;firstNames:string;lastNames:string;phone:string;email:string}> = [];
    try{
      operators = raw ? JSON.parse(raw) : [];
    }catch{
      operators = [];
    }
    const updated = {
      id: this.demoOperatorUser.id,
      firstNames: profile.firstNames,
      lastNames: profile.lastNames,
      phone: profile.phone,
      email
    };
    localStorage.setItem(
      this.createdOperatorsKey,
      JSON.stringify([updated,...operators.filter(operator=>operator.email!==email)])
    );
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
