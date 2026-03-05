import { Component, inject, signal, OnInit, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { Client } from '../../models/client.model';
import { RepairOrder } from '../../models/repair.model';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { DatePipe, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent, DatePipe, UpperCasePipe],
  template: `
    <div class="space-y-8 fade-in">

      @if (loading()) {
        <div class="flex items-center justify-center h-64">
          <div class="text-cyan-400 animate-pulse-slow font-heading">Cargando...</div>
        </div>
      } @else if (client()) {

        <!-- Back + Header -->
        <div>
          <a routerLink="/clientes" class="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 text-sm mb-4 transition-colors">
            ‹ Volver a Clientes
          </a>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-2xl font-bold">
                {{ client()!.name[0] | uppercase }}
              </div>
              <div>
                <h1 class="text-2xl font-heading font-bold text-white">{{ client()!.name }}</h1>
                <p class="text-slate-400">{{ client()!.phone }}</p>
              </div>
            </div>
            <a [routerLink]="['/reparaciones/nueva']" [queryParams]="{ clientId: client()!.id }"
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-all">
              + Nueva Reparación
            </a>
          </div>
        </div>

        <!-- Info Card -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <p class="text-xs text-slate-500 uppercase mb-1">Teléfono</p>
            <p class="text-white font-medium">{{ client()!.phone }}</p>
          </div>
          <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <p class="text-xs text-slate-500 uppercase mb-1">Email</p>
            <p class="text-white font-medium">{{ client()!.email || '-' }}</p>
          </div>
          <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <p class="text-xs text-slate-500 uppercase mb-1">Total Reparaciones</p>
            <p class="text-2xl font-heading font-bold text-cyan-400">{{ client()!.totalRepairs }}</p>
          </div>
        </div>

        <!-- Repair History -->
        <div>
          <h2 class="text-xl font-heading font-semibold text-white mb-4">Historial de Reparaciones</h2>
          @if (repairs().length === 0) {
            <div class="text-center py-12 border border-slate-800 rounded-xl bg-slate-900/50">
              <p class="text-slate-500">Este cliente no tiene reparaciones</p>
            </div>
          } @else {
            <div class="space-y-3">
              @for (repair of repairs(); track repair.id) {
                <a [routerLink]="['/reparaciones', repair.id]"
                  class="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-colors">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-3 flex-wrap">
                      <span class="font-mono text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">{{ repair.orderNumber }}</span>
                      <app-status-badge [status]="repair.status" />
                    </div>
                    <p class="text-white font-semibold mt-1.5">{{ repair.deviceBrand }} {{ repair.deviceModel }}</p>
                    <p class="text-slate-500 text-sm line-clamp-1">{{ repair.issueDescription }}</p>
                  </div>
                  <div class="text-right hidden sm:block">
                    @if (repair.finalCost) {
                      <p class="text-xs text-slate-500">Final</p>
                      <p class="font-mono text-white">\${{ repair.finalCost }}</p>
                    } @else if (repair.estimatedCost) {
                      <p class="text-xs text-slate-500">Estimado</p>
                      <p class="font-mono text-slate-300">\${{ repair.estimatedCost }}</p>
                    }
                    <p class="text-xs text-slate-600 mt-1">{{ repair.createdAt | date:'dd/MM/yy' }}</p>
                  </div>
                  <svg class="w-5 h-5 text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </a>
              }
            </div>
          }
        </div>

      }
    </div>
  `
})
export class ClientDetailComponent implements OnInit {
  id = input.required<string>();

  private api = inject(ApiService);
  private toast = inject(ToastService);

  client = signal<Client | null>(null);
  repairs = signal<RepairOrder[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.api.getClient(this.id()).subscribe({
      next: c => { this.client.set(c); },
      error: () => this.toast.error('Cliente no encontrado')
    });

    this.api.getRepairs({ clientId: this.id() }).subscribe({
      next: r => { this.repairs.set(r); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
