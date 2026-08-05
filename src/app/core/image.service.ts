import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
@Injectable({providedIn:'root'})
export class ImageService {
 private client:SupabaseClient|null=environment.supabaseUrl&&environment.supabaseAnonKey?createClient(environment.supabaseUrl,environment.supabaseAnonKey):null;
 url(path?:string|null){if(!path)return 'assets/branding/logo-color.jpeg';if(/^https?:\/\//i.test(path)||path.startsWith('assets/'))return path;const base=environment.storagePublicUrl.replace(/\/$/,'');return base?`${base}/${path.replace(/^\//,'')}`:'assets/branding/logo-color.jpeg';}
 async upload(file:File):Promise<string>{if(!this.client)throw new Error('Configura Supabase en environment.ts');const safe=file.name.toLowerCase().replace(/[^a-z0-9.]+/g,'-');const path=`animals/${crypto.randomUUID()}-${safe}`;const {error}=await this.client.storage.from(environment.storageBucket).upload(path,file,{upsert:false});if(error)throw error;return path;}
}
