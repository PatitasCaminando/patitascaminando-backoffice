import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { AdoptionApplication, AdoptionStatus, Animal, AuthSession, CurrentUser, DonationOffer, DonationStatus, Notification, Operator, SiteSection } from './models';

@Injectable({providedIn:'root'})
export class ApiService {
  private readonly base = environment.apiUrl.replace(/\/$/, '');
  constructor(private http:HttpClient){}
  private get demoMode(){ return ['local-demo-token','local-demo-operator-token'].includes(localStorage.getItem('pc_access_token') || ''); }
  private readonly now = new Date().toISOString();
  private readonly demoAnimals:Animal[] = [
    {id:'demo-animal-1',name:'Luna',species:'Perro',sex:'Hembra',size:'Mediano',approximateAge:'2 anos',status:'disponible',description:'Amigable y lista para adopcion.',generalCondition:'Saludable, vacunada.',photoPaths:['assets/branding/login-background.png'],isActive:true,isPubliclyVisible:true,createdAt:this.now,updatedAt:this.now},
    {id:'demo-animal-2',name:'Milo',species:'Gato',sex:'Macho',size:'Pequeno',approximateAge:'8 meses',status:'en_proceso',description:'Curioso y tranquilo.',generalCondition:'En seguimiento veterinario.',photoPaths:['assets/branding/login-background.png'],isActive:true,isPubliclyVisible:true,createdAt:this.now,updatedAt:this.now}
  ];
  private readonly demoAdoptions:AdoptionApplication[] = [
    {id:'demo-adoption-1',firstNames:'Ana',lastNames:'Perez',phone:'0999999999',email:'ana@example.com',desiredAnimalDescription:'Luna',adoptionReason:'Quiero darle un hogar estable.',specificAnimalId:'demo-animal-1',additionalMessage:null,dataProcessingAccepted:true,status:'recibida',internalObservations:null,submittedAt:this.now,updatedAt:this.now}
  ];
  private readonly demoDonations:DonationOffer[] = [
    {id:'demo-donation-1',firstNames:'Carlos',lastNames:'Mora',phone:'0988888888',email:'carlos@example.com',selectedItems:['Alimento','Cobijas'],approximateQuantity:'2 sacos',productName:null,itemCondition:'Nuevo',expirationDate:null,deliveryAvailability:'Fin de semana',otherDescription:null,descriptionObservation:'Puede entregar en la fundacion.',status:'ofrecida',internalObservations:null,submittedAt:this.now,updatedAt:this.now}
  ];
  private readonly demoNotifications:Notification[] = [
    {id:'demo-notification-1',formType:'adopcion',personName:'Ana Perez',title:'Nueva solicitud de adopcion',message:'Ana envio una solicitud para Luna.',isRead:false,readAt:null,emailStatus:'pendiente',createdAt:this.now}
  ];
  private readonly demoSections:SiteSection[] = [
    {id:'demo-section-1',sectionKey:'contacto',title:'Contacto',content:{telefono:'0999999999',correo:'info@patitas.local'},isPublished:true,displayOrder:1,createdAt:this.now,updatedAt:this.now}
  ];
  login(body:{email:string;password:string}):Observable<AuthSession>{ return this.http.post<AuthSession>(`${this.base}/auth/login`,body); }
  forgotPassword(email:string){ return this.http.post<{message:string}>(`${this.base}/auth/forgot-password`,{email}); }
  me():Observable<CurrentUser>{ return this.http.get<CurrentUser>(`${this.base}/auth/me`); }
  publicAnimals():Observable<Animal[]>{ return this.http.get<Animal[]>(`${this.base}/public/animals`); }
  publicAnimal(slug:string):Observable<Animal>{ return this.http.get<Animal>(`${this.base}/public/animals/${encodeURIComponent(slug)}`); }
  publicSections():Observable<SiteSection[]>{ return this.http.get<SiteSection[]>(`${this.base}/public/site-sections`); }
  createAdoption(body:Record<string,unknown>){ return this.http.post<AdoptionApplication>(`${this.base}/public/adoptions/applications`,body); }
  createDonation(body:Record<string,unknown>){ return this.http.post<DonationOffer>(`${this.base}/public/donations/offers`,body); }
  adminAnimals():Observable<Animal[]>{ return this.demoMode?of(this.demoAnimals):this.http.get<{items:Animal[]}>(`${this.base}/admin/animals?page=1&limit=100`).pipe(map(r=>r.items??[])); }
  adminAnimalsPage(page:number,limit:number):Observable<{items:Animal[];page:number;limit:number;total:number;totalPages:number}>{ return this.demoMode?of({items:this.demoAnimals,page:1,limit,total:this.demoAnimals.length,totalPages:1}):this.http.get<{items:Animal[];page:number;limit:number;total:number;totalPages:number}>(`${this.base}/admin/animals?page=${page}&limit=${limit}`); }
  createAnimal(body:Partial<Animal>){ return this.demoMode?of({...this.demoAnimals[0],...body,id:`demo-animal-${Date.now()}`,createdAt:this.now,updatedAt:this.now} as Animal):this.http.post<Animal>(`${this.base}/admin/animals`,body); }
  updateAnimal(id:string,body:Partial<Animal>){ return this.demoMode?of({...this.demoAnimals[0],...body,id,updatedAt:this.now} as Animal):this.http.patch<Animal>(`${this.base}/admin/animals/${id}`,body); }
  deleteAnimal(id:string){ return this.demoMode?of(void 0):this.http.delete<void>(`${this.base}/admin/animals/${id}`); }
  adoptions():Observable<AdoptionApplication[]>{ return this.demoMode?of(this.demoAdoptions):this.http.get<{items:AdoptionApplication[]}>(`${this.base}/admin/adoptions/applications`).pipe(map(r=>r.items??[])); }
  adoptionsPage(page:number,limit:number):Observable<{items:AdoptionApplication[];page:number;limit:number;total:number;totalPages:number}>{ return this.demoMode?of({items:this.demoAdoptions,page:1,limit,total:this.demoAdoptions.length,totalPages:1}):this.http.get<{items:AdoptionApplication[];page:number;limit:number;total:number;totalPages:number}>(`${this.base}/admin/adoptions/applications?page=${page}&limit=${limit}`); }
  updateAdoptionStatus(id:string,status:AdoptionStatus,internalObservations?:string){ return this.demoMode?of({...this.demoAdoptions[0],id,status,internalObservations:internalObservations??null,updatedAt:this.now}):this.http.patch<AdoptionApplication>(`${this.base}/admin/adoptions/applications/${id}/status`,{status,internalObservations}); }
  donations():Observable<DonationOffer[]>{ return this.demoMode?of(this.demoDonations):this.http.get<{items:DonationOffer[]}>(`${this.base}/admin/donations/offers`).pipe(map(r=>r.items??[])); }
  donationsPage(page:number,limit:number):Observable<{items:DonationOffer[];page:number;limit:number;total:number;totalPages:number}>{ return this.demoMode?of({items:this.demoDonations,page:1,limit,total:this.demoDonations.length,totalPages:1}):this.http.get<{items:DonationOffer[];page:number;limit:number;total:number;totalPages:number}>(`${this.base}/admin/donations/offers?page=${page}&limit=${limit}`); }
  updateDonationStatus(id:string,status:DonationStatus,internalObservations?:string){ return this.demoMode?of({...this.demoDonations[0],id,status,internalObservations:internalObservations??null,updatedAt:this.now}):this.http.patch<DonationOffer>(`${this.base}/admin/donations/offers/${id}/status`,{status,internalObservations}); }
  notifications():Observable<Notification[]>{ return this.demoMode?of(this.demoNotifications):this.http.get<Notification[]>(`${this.base}/admin/notifications`); }
  markNotificationRead(id:string){ return this.demoMode?of({...this.demoNotifications[0],id,isRead:true,readAt:this.now}):this.http.patch<Notification>(`${this.base}/admin/notifications/${id}/read`,{}); }
  adminSections():Observable<SiteSection[]>{ return this.demoMode?of(this.demoSections):this.http.get<SiteSection[]>(`${this.base}/admin/site-sections`); }
  createSection(body:Partial<SiteSection>){ return this.demoMode?of({...this.demoSections[0],...body,id:`demo-section-${Date.now()}`,createdAt:this.now,updatedAt:this.now} as SiteSection):this.http.post<SiteSection>(`${this.base}/admin/site-sections`,body); }
  updateSection(id:string,body:Partial<SiteSection>){ return this.demoMode?of({...this.demoSections[0],...body,id,updatedAt:this.now} as SiteSection):this.http.patch<SiteSection>(`${this.base}/admin/site-sections/${id}`,body); }
  deleteSection(id:string){ return this.demoMode?of(void 0):this.http.delete<void>(`${this.base}/admin/site-sections/${id}`); }
  operators():Observable<Operator[]>{ return this.demoMode?of([]):this.http.get<{items?:Operator[]}|Operator[]>(`${this.base}/admin/users/operators`).pipe(map(r=>Array.isArray(r)?r:(r.items??[]))); }
  createOperator(body:{email:string;password:string;firstNames?:string;lastNames?:string;phone?:string}){ return this.demoMode?of({id:`demo-operator-${Date.now()}`,email:body.email}):this.http.post<{id:string;email:string|null}>(`${this.base}/admin/users/operators`,body); }
  updateOperator(id:string,body:{firstNames?:string;lastNames?:string;phone?:string;receiveFormNotifications?:boolean}){ return this.demoMode?of(void 0):this.http.patch<void>(`${this.base}/admin/users/operators/${id}`,body); }
  setOperatorStatus(id:string,isActive:boolean){ return this.demoMode?of(void 0):this.http.patch<void>(`${this.base}/admin/users/operators/${id}/status`,{isActive}); }
}