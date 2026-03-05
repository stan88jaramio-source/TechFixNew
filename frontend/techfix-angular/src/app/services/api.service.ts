import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Client, ClientCreateRequest, ClientUpdateRequest } from '../models/client.model';
import {
  RepairOrder, RepairCreateRequest, RepairUpdateRequest,
  DashboardStats, RepairStatus, TrackingRepair
} from '../models/repair.model';
import { ShopSettings } from '../models/settings.model';
import { TokenResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  // ── Dashboard ──────────────────────────────────────────────
  getDashboardStats() {
    return this.http.get<DashboardStats>(`${this.base}/dashboard/stats`);
  }

  // ── Clients ────────────────────────────────────────────────
  getClients(search?: string) {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<Client[]>(`${this.base}/clients`, { params });
  }

  getClient(id: string) {
    return this.http.get<Client>(`${this.base}/clients/${id}`);
  }

  createClient(data: ClientCreateRequest) {
    return this.http.post<Client>(`${this.base}/clients`, data);
  }

  updateClient(id: string, data: ClientUpdateRequest) {
    return this.http.put<Client>(`${this.base}/clients/${id}`, data);
  }

  deleteClient(id: string) {
    return this.http.delete<{ message: string }>(`${this.base}/clients/${id}`);
  }

  // ── Repairs ────────────────────────────────────────────────
  getRepairs(params: { status?: string; search?: string; clientId?: string } = {}) {
    let httpParams = new HttpParams();
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.clientId) httpParams = httpParams.set('clientId', params.clientId);
    return this.http.get<RepairOrder[]>(`${this.base}/repairs`, { params: httpParams });
  }

  getRepair(id: string) {
    return this.http.get<RepairOrder>(`${this.base}/repairs/${id}`);
  }

  createRepair(data: RepairCreateRequest) {
    return this.http.post<RepairOrder>(`${this.base}/repairs`, data);
  }

  updateRepair(id: string, data: RepairUpdateRequest) {
    return this.http.put<RepairOrder>(`${this.base}/repairs/${id}`, data);
  }

  updateRepairStatus(id: string, status: RepairStatus) {
    return this.http.patch<RepairOrder>(`${this.base}/repairs/${id}/status`, { status });
  }

  deleteRepair(id: string) {
    return this.http.delete<{ message: string }>(`${this.base}/repairs/${id}`);
  }

  /** Público: no requiere token. Usado por la página de seguimiento del cliente. */
  getRepairTracking(orderNumber: string) {
    return this.http.get<TrackingRepair>(`${this.base}/repairs/track/${orderNumber}`);
  }

  // ── Shop Settings ──────────────────────────────────────────
  /** Público: devuelve nombre y logo de la tienda. */
  getSettings() {
    return this.http.get<ShopSettings>(`${this.base}/settings`);
  }

  /** Autenticado: actualiza nombre y/o logo via multipart/form-data. */
  /** Admin only: crea una cuenta de técnico. El interceptor adjunta el token automáticamente. */
  createUser(name: string, email: string, password: string) {
    return this.http.post<TokenResponse>(`${this.base}/auth/register`, { name, email, password });
  }

  updateSettings(shopName: string, logo: File | null, removeLogo: boolean) {
    const fd = new FormData();
    fd.append('shopName', shopName);
    if (removeLogo) fd.append('removeLogo', 'true');
    if (logo) fd.append('logo', logo, logo.name);
    return this.http.put<ShopSettings>(`${this.base}/settings`, fd);
  }
}
