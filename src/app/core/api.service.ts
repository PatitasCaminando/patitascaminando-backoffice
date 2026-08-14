import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { AdoptionApplication, AdoptionStatus, Animal, AuthSession, CurrentUser, DonationOffer, DonationStatus, Notification, Operator, SiteSection } from './models';

@Injectable({providedIn:'root'})
export class ApiService {
  private readonly base = environment.apiUrl.replace(/\/$/, '');
  constructor(private http:HttpClient){}
  login(body:{email:string;password:string}):Observable<AuthSession>{ return this.http.post<AuthSession>(`${this.base}/auth/login`,body); }
  forgotPassword(email:string){ return this.http.post<{message:string}>(`${this.base}/auth/forgot-password`,{email}); }
  me():Observable<CurrentUser>{ return this.http.get<CurrentUser>(`${this.base}/auth/me`); }
  publicAnimals():Observable<Animal[]>{ return this.http.get<Animal[]>(`${this.base}/public/animals`); }
  publicAnimal(slug:string):Observable<Animal>{ return this.http.get<Animal>(`${this.base}/public/animals/${encodeURIComponent(slug)}`); }
  publicSections():Observable<SiteSection[]>{ return this.http.get<SiteSection[]>(`${this.base}/public/site-sections`); }
  createAdoption(body:Record<string,unknown>){ return this.http.post<AdoptionApplication>(`${this.base}/public/adoptions/applications`,body); }
  createDonation(body:Record<string,unknown>){ return this.http.post<DonationOffer>(`${this.base}/public/donations/offers`,body); }
  adminAnimals():Observable<Animal[]>{ return this.http.get<{items:Animal[]}>(`${this.base}/admin/animals?page=1&limit=100`).pipe(map(r=>r.items??[])); }
  adminAnimalsPage(page:number,limit:number):Observable<{items:Animal[];page:number;limit:number;total:number;totalPages:number}>{ return this.http.get<{items:Animal[];page:number;limit:number;total:number;totalPages:number}>(`${this.base}/admin/animals?page=${page}&limit=${limit}`); }
  createAnimal(body:Partial<Animal>){ return this.http.post<Animal>(`${this.base}/admin/animals`,body); }
  updateAnimal(id:string,body:Partial<Animal>){ return this.http.patch<Animal>(`${this.base}/admin/animals/${id}`,body); }
  deleteAnimal(id:string){ return this.http.delete<void>(`${this.base}/admin/animals/${id}/permanent`); }  adoptions():Observable<AdoptionApplication[]>{ return this.http.get<{items:AdoptionApplication[]}>(`${this.base}/admin/adoptions/applications`).pipe(map(r=>r.items??[])); }
  adoptionsPage(page:number,limit:number):Observable<{items:AdoptionApplication[];page:number;limit:number;total:number;totalPages:number}>{ return this.http.get<{items:AdoptionApplication[];page:number;limit:number;total:number;totalPages:number}>(`${this.base}/admin/adoptions/applications?page=${page}&limit=${limit}`); }
  updateAdoptionStatus(id:string,status:AdoptionStatus,internalObservations?:string){ return this.http.patch<AdoptionApplication>(`${this.base}/admin/adoptions/applications/${id}/status`,{status,internalObservations}); }
  donations():Observable<DonationOffer[]>{ return this.http.get<{items:DonationOffer[]}>(`${this.base}/admin/donations/offers`).pipe(map(r=>r.items??[])); }
  donationsPage(page:number,limit:number):Observable<{items:DonationOffer[];page:number;limit:number;total:number;totalPages:number}>{ return this.http.get<{items:DonationOffer[];page:number;limit:number;total:number;totalPages:number}>(`${this.base}/admin/donations/offers?page=${page}&limit=${limit}`); }
  updateDonationStatus(id:string,status:DonationStatus,internalObservations?:string){ return this.http.patch<DonationOffer>(`${this.base}/admin/donations/offers/${id}/status`,{status,internalObservations}); }
  notifications():Observable<Notification[]>{ return this.http.get<Notification[]>(`${this.base}/admin/notifications`); }
  markNotificationRead(id:string){ return this.http.patch<Notification>(`${this.base}/admin/notifications/${id}/read`,{}); }
  adminSections():Observable<SiteSection[]>{ return this.http.get<SiteSection[]>(`${this.base}/admin/site-sections`); }
  createSection(body:Partial<SiteSection>){ return this.http.post<SiteSection>(`${this.base}/admin/site-sections`,body); }
  updateSection(id:string,body:Partial<SiteSection>){ return this.http.patch<SiteSection>(`${this.base}/admin/site-sections/${id}`,body); }
  deleteSection(id:string){ return this.http.delete<void>(`${this.base}/admin/site-sections/${id}`); }
  operators():Observable<Operator[]>{ return this.http.get<{items?:Operator[]}|Operator[]>(`${this.base}/admin/users/operators`).pipe(map(r=>Array.isArray(r)?r:(r.items??[]))); }
  createOperator(body:{email:string;password:string;firstNames?:string;lastNames?:string;phone?:string}){ return this.http.post<{id:string;email:string|null}>(`${this.base}/admin/users/operators`,body); }
  updateOperator(id:string,body:{firstNames?:string;lastNames?:string;phone?:string;receiveFormNotifications?:boolean}){ return this.http.patch<void>(`${this.base}/admin/users/operators/${id}`,body); }
  setOperatorStatus(id:string,isActive:boolean){ return this.http.patch<void>(`${this.base}/admin/users/operators/${id}/status`,{isActive}); }
}