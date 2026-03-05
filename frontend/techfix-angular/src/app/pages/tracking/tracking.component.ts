import { Component, OnInit, inject, signal, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { TrackingRepair } from '../../models/repair.model';

type RepairStatus = 'recibido' | 'diagnostico' | 'reparando' | 'listo' | 'entregado';

const STEPS: { value: RepairStatus; label: string; icon: string; desc: string }[] = [
  {
    value: 'recibido',
    label: 'Recibido',
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11"/></svg>`,
    desc: 'Tu dispositivo fue recibido en el taller.',
  },
  {
    value: 'diagnostico',
    label: 'En Diagnóstico',
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>`,
    desc: 'Nuestro técnico está analizando el problema.',
  },
  {
    value: 'reparando',
    label: 'En Reparación',
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>`,
    desc: 'Estamos trabajando en la reparación de tu equipo.',
  },
  {
    value: 'listo',
    label: 'Listo para Retirar',
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    desc: '¡Tu dispositivo está listo! Pasa a recogerlo.',
  },
  {
    value: 'entregado',
    label: 'Entregado',
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3l14 9-14 9V3z"/></svg>`,
    desc: 'Reparación completada y dispositivo entregado.',
  },
];

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="min-h-screen bg-[#020617] flex flex-col items-center justify-start px-4 py-10">

      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/20 mb-4 shadow-lg shadow-cyan-500/20">
          <svg class="w-7 h-7 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-5 17a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4-4H7V5h9v10z"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-white tracking-tight">Aguirre Fix Pro</h1>
        <p class="text-slate-400 text-sm mt-1">Seguimiento de reparación</p>
      </div>

      <!-- Main card -->
      <div class="w-full max-w-md">

        <!-- Loading -->
        @if (loading()) {
          <div class="flex flex-col items-center justify-center gap-3 py-20">
            <div class="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-slate-400 text-sm">Buscando tu orden...</p>
          </div>
        }

        <!-- Error -->
        @if (!loading() && error()) {
          <div class="glass rounded-2xl p-8 text-center space-y-3">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 mb-2">
              <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p class="text-white font-semibold">Orden no encontrada</p>
            <p class="text-slate-400 text-sm">No encontramos la orden <span class="font-mono text-cyan-400">{{ orderNumber() }}</span>.<br>Verifica el número o contacta al taller.</p>
          </div>
        }

        <!-- Tracking info -->
        @if (!loading() && !error() && repair()) {
          <div class="space-y-4 fade-in">

            <!-- Order card -->
            <div class="glass rounded-2xl p-5 space-y-3">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wide font-mono">Orden</p>
                  <p class="text-lg font-mono font-bold text-cyan-400">{{ repair()!.orderNumber }}</p>
                </div>
                <span [class]="statusBadgeClass(repair()!.status)">
                  {{ statusLabel(repair()!.status) }}
                </span>
              </div>

              <div class="border-t border-slate-800 pt-3 space-y-1.5">
                <div class="flex justify-between text-sm">
                  <span class="text-slate-400">Dispositivo</span>
                  <span class="text-white font-medium">{{ repair()!.deviceBrand }} {{ repair()!.deviceModel }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-slate-400">Ingresado</span>
                  <span class="text-white">{{ repair()!.createdAt | date:'dd/MM/yyyy' }}</span>
                </div>
                @if (repair()!.estimatedCompletion) {
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-400">Entrega estimada</span>
                    <span class="text-cyan-300 font-medium">{{ formatDate(repair()!.estimatedCompletion!) }}</span>
                  </div>
                }
                <div class="flex justify-between text-sm">
                  <span class="text-slate-400">Última actualización</span>
                  <span class="text-white">{{ repair()!.updatedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
              </div>
            </div>

            <!-- Repair result banner -->
            @if (repair()!.repairResult) {
              <div [class]="repair()!.repairResult === 'si'
                ? 'rounded-2xl p-4 flex items-center gap-3 bg-emerald-900/40 border border-emerald-700/50'
                : 'rounded-2xl p-4 flex items-center gap-3 bg-red-900/40 border border-red-700/50'">
                <span class="text-2xl">{{ repair()!.repairResult === 'si' ? '✅' : '❌' }}</span>
                <div>
                  <p [class]="repair()!.repairResult === 'si' ? 'text-emerald-300 font-bold text-sm' : 'text-red-300 font-bold text-sm'">
                    {{ repair()!.repairResult === 'si' ? 'Equipo reparado exitosamente' : 'No fue posible la reparación' }}
                  </p>
                  <p class="text-slate-400 text-xs mt-0.5">
                    {{ repair()!.repairResult === 'si' ? 'Tu dispositivo fue reparado y está listo para retirar.' : 'Lamentablemente no se pudo reparar. El equipo está disponible para retirar.' }}
                  </p>
                </div>
              </div>
            }

            <!-- Timeline -->
            <div class="glass rounded-2xl p-5">
              <h2 class="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">Progreso de reparación</h2>
              <ol class="relative">
                @for (step of steps; track step.value; let last = $last) {
                  <li class="flex gap-4" [class.pb-6]="!last">
                    <!-- Connector line -->
                    <div class="flex flex-col items-center">
                      <!-- Circle -->
                      <div [class]="stepCircleClass(step.value, repair()!.status)">
                        @if (isCompleted(step.value, repair()!.status)) {
                          <!-- checkmark -->
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                          </svg>
                        } @else if (isCurrent(step.value, repair()!.status)) {
                          <div class="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></div>
                        } @else {
                          <div class="w-2 h-2 rounded-full bg-slate-600"></div>
                        }
                      </div>
                      <!-- Line -->
                      @if (!last) {
                        <div [class]="stepLineClass(step.value, repair()!.status)"></div>
                      }
                    </div>

                    <!-- Content -->
                    <div class="pb-1">
                      <p [class]="stepLabelClass(step.value, repair()!.status)">{{ step.label }}</p>
                      @if (isCurrent(step.value, repair()!.status)) {
                        <p class="text-xs text-slate-400 mt-0.5">{{ step.desc }}</p>
                      }
                    </div>
                  </li>
                }
              </ol>
            </div>

            <!-- Footer message -->
            <p class="text-center text-xs text-slate-500 pb-4">
              Esta página se actualiza automáticamente cuando el técnico cambie el estado de tu reparación.
            </p>
          </div>
        }

      </div>
    </div>
  `,
})
export class TrackingComponent implements OnInit {
  orderNumber = input.required<string>();

  private api = inject(ApiService);

  repair   = signal<TrackingRepair | null>(null);
  loading  = signal(true);
  error    = signal(false);

  readonly steps = STEPS;

  ngOnInit() {
    this.api.getRepairTracking(this.orderNumber()).subscribe({
      next:  r  => { this.repair.set(r); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }

  // ── Status helpers ─────────────────────────────────────────

  private readonly statusOrder: RepairStatus[] =
    ['recibido', 'diagnostico', 'reparando', 'listo', 'entregado'];

  private idx(s: string) { return this.statusOrder.indexOf(s as RepairStatus); }

  isCompleted(step: RepairStatus, current: string) {
    return this.idx(step) < this.idx(current);
  }

  isCurrent(step: RepairStatus, current: string) {
    return step === current;
  }

  statusLabel(s: string) {
    return STEPS.find(x => x.value === s)?.label ?? s;
  }

  statusBadgeClass(s: string): string {
    const map: Record<string, string> = {
      recibido:    'px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30',
      diagnostico: 'px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
      reparando:   'px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30',
      listo:       'px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
      entregado:   'px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30',
    };
    return map[s] ?? 'px-3 py-1 rounded-full text-xs font-semibold bg-slate-700 text-slate-300';
  }

  stepCircleClass(step: RepairStatus, current: string): string {
    const base = 'flex-none flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ';
    if (this.isCompleted(step, current))
      return base + 'bg-cyan-600 border-cyan-500 text-white';
    if (this.isCurrent(step, current))
      return base + 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/30';
    return base + 'bg-slate-800 border-slate-700 text-slate-600';
  }

  stepLineClass(step: RepairStatus, current: string): string {
    const done = this.isCompleted(step, current) || this.isCurrent(step, current);
    return `w-0.5 flex-1 mt-1 ${done ? 'bg-cyan-600' : 'bg-slate-800'}`;
  }

  stepLabelClass(step: RepairStatus, current: string): string {
    if (this.isCurrent(step, current)) return 'text-sm font-bold text-white';
    if (this.isCompleted(step, current)) return 'text-sm font-medium text-cyan-400';
    return 'text-sm text-slate-600';
  }

  formatDate(iso: string): string {
    if (!iso) return '';
    const dateOnly = iso.split('T')[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return iso;
    const [y, m, d] = dateOnly.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return isNaN(date.getTime())
      ? iso
      : date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
