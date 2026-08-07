import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({providedIn:'root'})
export class ImageService {
  private readonly base = environment.apiUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  url(path?: string | null): string {
    if (!path) return 'assets/branding/logo-color.jpeg';
    if (/^https?:\/\//i.test(path) || path.startsWith('assets/')) return path;
    const base = environment.storagePublicUrl.replace(/\/$/, '');
    return base ? `${base}/${path.replace(/^\//, '')}` : 'assets/branding/logo-color.jpeg';
  }

  async upload(file: File): Promise<string> {
    const form = new FormData();
    form.append('file', file, file.name);

    // No se define Content-Type a proposito: el navegador agrega el
    // boundary de multipart/form-data automaticamente.
    const res = await firstValueFrom(
      this.http.post<Record<string, unknown>>(`${this.base}/admin/animals/images/upload`, form)
    );

    const path = this.extractPath(res);
    if (!path) throw new Error('La API no devolvio la ruta de la imagen.');
    return path;
  }

  private extractPath(res: unknown): string | null {
    if (typeof res === 'string') return res;
    if (!res || typeof res !== 'object') return null;
    const r = res as Record<string, unknown>;
    const candidate = r['mediaId'] ?? r['path'] ?? r['photoPath'] ?? r['url'] ?? r['key'];
    if (typeof candidate === 'string') return candidate;
    if (r['data'] && typeof r['data'] === 'object') return this.extractPath(r['data']);
    return null;
  }
}