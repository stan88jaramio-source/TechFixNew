import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { RepairOrder, REPAIR_STATUSES } from '../../models/repair.model';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { DatePipe } from '@angular/common';
import { debounceTime, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-repairs',
  standalone: true,
  imports: [RouterLink, FormsModule, StatusBadgeComponent, DatePipe],
  template: `
    <div class="space-y-6 fade-in">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-heading font-bold text-white">Reparaciones</h1>
          <p class="text-slate-400 mt-1">{{ repairs().length }} órdenes de trabajo</p>
        </div>
        <a routerLink="/reparaciones/nueva"
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-all active:scale-95">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nueva Reparación
        </a>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="relative flex-1">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" [(ngModel)]="search" (ngModelChange)="onSearch($event)"
            placeholder="Buscar por número, cliente o dispositivo..."
            class="w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-white placeholder:text-slate-500 focus:border-cyan-500 transition-colors" />
        </div>
        <select [(ngModel)]="statusFilter" (ngModelChange)="fetchRepairs()"
          class="w-full sm:w-48 px-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-white focus:border-cyan-500 transition-colors">
          <option value="">Todos los estados</option>
          @for (s of statuses; track s.value) {
            <option [value]="s.value">{{ s.label }}</option>
          }
        </select>
      </div>

      <!-- Content -->
      @if (loading()) {
        <div class="flex items-center justify-center h-64">
          <div class="text-cyan-400 animate-pulse-slow">Cargando reparaciones...</div>
        </div>
      } @else if (repairs().length === 0) {
        <div class="flex flex-col items-center justify-center py-16 border border-slate-800 rounded-xl bg-slate-900/50">
          <svg class="w-16 h-16 text-slate-700 mb-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
          <h3 class="text-xl font-heading text-white mb-2">No hay reparaciones</h3>
          <p class="text-slate-400 mb-4">Crea una nueva orden de trabajo</p>
          <a routerLink="/reparaciones/nueva" class="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-all">
            Nueva Reparación
          </a>
        </div>
      } @else {
        <div class="space-y-3">
          @for (repair of repairs(); track repair.id) {
            <a [routerLink]="['/reparaciones', repair.id]"
              class="flex items-center gap-4 p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-colors group">

              <div class="hidden sm:flex w-12 h-12 rounded-lg bg-slate-800 items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                  <line x1="12" y1="18" x2="12.01" y2="18"/>
                </svg>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3 flex-wrap">
                  <span class="font-mono text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">{{ repair.orderNumber }}</span>
                  <app-status-badge [status]="repair.status" />
                </div>
                <h3 class="text-lg font-semibold text-white mt-2 group-hover:text-cyan-400 transition-colors">
                  {{ repair.deviceBrand }} {{ repair.deviceModel }}
                </h3>
                <div class="flex items-center gap-3 mt-1 text-sm text-slate-400 flex-wrap">
                  <span>{{ repair.clientName }}</span>
                  <span>·</span>
                  <span>{{ repair.createdAt | date:'dd/MM/yyyy' }}</span>
                </div>
                <p class="text-slate-500 text-sm mt-1 line-clamp-1">{{ repair.issueDescription }}</p>
              </div>

              <div class="flex items-center gap-4">
                @if (repair.estimatedCost) {
                  <div class="text-right hidden md:block">
                    <p class="text-xs text-slate-500">Estimado</p>
                    <p class="text-lg font-mono text-white">\${{ repair.estimatedCost }}</p>
                  </div>
                }
                <svg class="w-5 h-5 text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `
})
export class RepairsComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  repairs = signal<RepairOrder[]>([]);
  loading = signal(true);
  search = '';
  statusFilter = '';
  statuses = REPAIR_STATUSES;

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(debounceTime(300), takeUntilDestroyed())
      .subscribe(term => this.fetchRepairs(term));
  }

  ngOnInit() { this.fetchRepairs(); }

  fetchRepairs(searchTerm?: string) {
    const params: Record<string, string> = {};
    if (searchTerm ?? this.search) params['search'] = searchTerm ?? this.search;
    if (this.statusFilter) params['status'] = this.statusFilter;

    this.api.getRepairs(params).subscribe({
      next: list => { this.repairs.set(list); this.loading.set(false); },
      error: () => { this.toast.error('Error al cargar reparaciones'); this.loading.set(false); }
    });
  }

  onSearch(value: string) { this.searchSubject.next(value); }
}
