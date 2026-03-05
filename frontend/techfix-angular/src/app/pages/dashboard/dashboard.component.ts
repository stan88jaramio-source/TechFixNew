import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { DashboardStats } from '../../models/repair.model';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent, DatePipe, DecimalPipe],
  template: `
    <div class="space-y-8 fade-in">

      <!-- Header -->
      <div>
        <h1 class="text-3xl font-heading font-bold text-white">Dashboard</h1>
        <p class="text-slate-400 mt-1">Resumen de actividad del taller</p>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center h-64">
          <div class="text-cyan-400 text-xl font-heading animate-pulse-slow">Cargando dashboard...</div>
        </div>
      } @else if (stats()) {
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-slate-900/50 border border-cyan-500/30 rounded-xl p-6 hover:border-cyan-500/60 transition-colors">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm text-slate-400">Reparaciones Activas</p>
                <p class="text-3xl font-heading font-bold text-white mt-2">{{ stats()!.pendingRepairs }}</p>
              </div>
              <div class="p-3 rounded-lg bg-cyan-500/10">
                <svg class="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-slate-900/50 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/60 transition-colors">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm text-slate-400">Clientes Registrados</p>
                <p class="text-3xl font-heading font-bold text-white mt-2">{{ stats()!.totalClients }}</p>
              </div>
              <div class="p-3 rounded-lg bg-purple-500/10">
                <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-slate-900/50 border border-green-500/30 rounded-xl p-6 hover:border-green-500/60 transition-colors">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm text-slate-400">Completados Hoy</p>
                <p class="text-3xl font-heading font-bold text-white mt-2">{{ stats()!.completedToday }}</p>
              </div>
              <div class="p-3 rounded-lg bg-green-500/10">
                <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-slate-900/50 border border-yellow-500/30 rounded-xl p-6 hover:border-yellow-500/60 transition-colors">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm text-slate-400">Ingresos Totales</p>
                <p class="text-3xl font-heading font-bold text-white mt-2">\${{ stats()!.totalRevenue | number:'1.0-0' }}</p>
              </div>
              <div class="p-3 rounded-lg bg-yellow-500/10">
                <svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Status & Recent -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Status Distribution -->
          <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 class="text-lg font-heading text-white mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              Estado de Reparaciones
            </h3>
            <div class="space-y-3">
              @for (entry of statusEntries; track entry[0]) {
                <div class="flex items-center justify-between">
                  <app-status-badge [status]="$any(entry[0])" />
                  <span class="text-xl font-bold text-white">{{ entry[1] }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Recent Repairs -->
          <div class="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-heading text-white flex items-center gap-2">
                <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                  <line x1="12" y1="18" x2="12.01" y2="18"/>
                </svg>
                Reparaciones Recientes
              </h3>
              <a routerLink="/reparaciones" class="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1">
                Ver todas ›
              </a>
            </div>

            @if (stats()!.recentRepairs.length > 0) {
              <div class="space-y-3">
                @for (repair of stats()!.recentRepairs; track repair.id) {
                  <a [routerLink]="['/reparaciones', repair.id]"
                    class="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-colors">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-3 flex-wrap">
                        <span class="font-mono text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">{{ repair.orderNumber }}</span>
                        <app-status-badge [status]="repair.status" />
                      </div>
                      <p class="text-white font-semibold mt-1.5">{{ repair.deviceBrand }} {{ repair.deviceModel }}</p>
                      <p class="text-slate-400 text-sm">{{ repair.clientName }} · {{ repair.createdAt | date:'dd/MM/yy' }}</p>
                    </div>
                    <svg class="w-5 h-5 text-slate-600 ml-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </a>
                }
              </div>
            } @else {
              <p class="text-slate-500 text-center py-8">No hay reparaciones recientes</p>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  stats = signal<DashboardStats | null>(null);
  loading = signal(true);
  private interval?: ReturnType<typeof setInterval>;

  get statusEntries(): [string, number][] {
    return Object.entries(this.stats()?.statusCounts ?? {}) as [string, number][];
  }

  ngOnInit() {
    this.fetchStats();
    this.interval = setInterval(() => this.fetchStats(), 10_000);
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
  }

  fetchStats() {
    this.api.getDashboardStats().subscribe({
      next: s => { this.stats.set(s); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
