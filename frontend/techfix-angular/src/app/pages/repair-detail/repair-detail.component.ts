import { Component, inject, signal, OnInit, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { PdfService } from '../../services/pdf.service';
import { RepairOrder, REPAIR_STATUSES, RepairStatus } from '../../models/repair.model';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-repair-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, StatusBadgeComponent, DatePipe],
  template: `
    <div class="space-y-6 fade-in">

      @if (loading()) {
        <div class="flex items-center justify-center h-64">
          <div class="text-cyan-400 animate-pulse-slow font-heading">Cargando orden...</div>
        </div>
      } @else if (repair()) {

        <!-- Back + Header -->
        <div>
          <a routerLink="/reparaciones" class="inline-flex items-center gap-1 text-slate-400 hover:text-cyan-400 text-sm mb-4 transition-colors">
            ‹ Reparaciones
          </a>
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div class="flex items-center gap-3 flex-wrap mb-2">
                <span class="font-mono text-sm text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-lg">{{ repair()!.orderNumber }}</span>
                <app-status-badge [status]="repair()!.status" />
              </div>
              <h1 class="text-2xl font-heading font-bold text-white">{{ repair()!.deviceBrand }} {{ repair()!.deviceModel }}</h1>
              <p class="text-slate-400 mt-1">{{ repair()!.clientName }} · {{ repair()!.clientPhone }}</p>
            </div>
            <div class="flex gap-3 flex-wrap">
              @if (repair()!.status === 'entregado') {
                <button (click)="generateInvoice()"
                  class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500 text-amber-300 hover:bg-amber-500/30 hover:border-amber-400 font-semibold shadow-[0_0_12px_rgba(245,158,11,0.25)] transition-all">
                  🧾 Ver Factura
                </button>
              } @else {
                <button (click)="generatePdf()"
                  class="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors">
                  📄 Comprobante
                </button>
              }
              <button (click)="sendWhatsApp()"
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold transition-all">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Notificar
              </button>
              <button (click)="showEditModal.set(true)"
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-all">
                ✏️ Editar
              </button>
            </div>
          </div>
        </div>

        <!-- Status Timeline -->
        <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 class="text-lg font-heading text-white mb-4">Flujo de Estado</h3>
          <div class="flex items-center gap-2 overflow-x-auto pb-2">
            @for (s of statuses; track s.value; let last = $last) {
              <button
                (click)="onStatusClick(s.value)"
                [disabled]="statusIndexOf(s.value) < currentStatusIndex"
                [title]="statusIndexOf(s.value) < currentStatusIndex ? 'Estado completado — no se puede retroceder' : ''"
                class="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                [class.ring-2]="repair()!.status === s.value"
                [class.ring-cyan-400]="repair()!.status === s.value"
                [class.bg-green-800]="statusIndexOf(s.value) < currentStatusIndex"
                [class.text-green-300]="statusIndexOf(s.value) < currentStatusIndex"
                [class.cursor-not-allowed]="statusIndexOf(s.value) < currentStatusIndex"
                [class.opacity-75]="statusIndexOf(s.value) < currentStatusIndex"
                [class.bg-cyan-600]="repair()!.status === s.value"
                [class.text-white]="repair()!.status === s.value"
                [class.bg-slate-800]="statusIndexOf(s.value) > currentStatusIndex"
                [class.text-slate-400]="statusIndexOf(s.value) > currentStatusIndex"
                [class.hover:bg-slate-700]="statusIndexOf(s.value) > currentStatusIndex">
                @if (statusIndexOf(s.value) < currentStatusIndex) { ✓ }
                {{ s.label }}
              </button>
              @if (!last) {
                <svg class="w-4 h-4 text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              }
            }
          </div>
        </div>

        <!-- Info Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 class="font-heading text-white">Detalles del Dispositivo</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between"><span class="text-slate-400">Marca</span><span class="text-white">{{ repair()!.deviceBrand }}</span></div>
              <div class="flex justify-between"><span class="text-slate-400">Modelo</span><span class="text-white">{{ repair()!.deviceModel }}</span></div>
              @if (repair()!.imei) {
                <div class="flex justify-between"><span class="text-slate-400">IMEI</span><span class="font-mono text-white">{{ repair()!.imei }}</span></div>
              }
              @if (repair()!.accessories){
                <div class="flex justify-between"><span class="text-slate-400">Accesorios</span><span class="text-white">{{ repair()!.accessories }}</span></div>
              }
            </div>
          </div>

          <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 class="font-heading text-white">Costos y Fechas</h3>
            <div class="space-y-2 text-sm">
              @if (repair()!.estimatedCost) {
                <div class="flex justify-between"><span class="text-slate-400">Costo Estimado</span><span class="font-mono text-white">\${{ repair()!.estimatedCost }}</span></div>
              }
              @if (repair()!.finalCost) {
                <div class="flex justify-between"><span class="text-slate-400">Costo Final</span><span class="font-mono text-green-400">\${{ repair()!.finalCost }}</span></div>
              }
              @if (repair()!.estimatedCompletion) {
                <div class="flex justify-between items-start gap-2">
                  <span class="text-slate-400 shrink-0">Entrega Est.</span>
                  <span class="text-cyan-300 font-medium text-right">{{ formatDate(repair()!.estimatedCompletion!) }}</span>
                </div>
              }
              <div class="flex justify-between"><span class="text-slate-400">Creado</span><span class="text-white">{{ repair()!.createdAt | date:'dd/MM/yyyy HH:mm' }}</span></div>
              <div class="flex justify-between"><span class="text-slate-400">Actualizado</span><span class="text-white">{{ repair()!.updatedAt | date:'dd/MM/yyyy HH:mm' }}</span></div>
            </div>
          </div>
        </div>

        <!-- Issue & Notes -->
        <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 class="font-heading text-white mb-3">Descripción del Problema</h3>
          <p class="text-slate-300 text-sm">{{ repair()!.issueDescription }}</p>
        </div>

        @if (repair()!.technicianNotes) {
          <div class="bg-slate-900/50 border border-yellow-500/20 rounded-xl p-6">
            <h3 class="font-heading text-white mb-3">Notas del Técnico</h3>
            <p class="text-slate-300 text-sm">{{ repair()!.technicianNotes }}</p>
          </div>
        }

        <!-- Evidence Photos -->
        @if (repair()!.photos && repair()!.photos!.length > 0) {
          <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"/>
                </svg>
                <h3 class="font-heading text-white">Evidencia de Ingreso</h3>
              </div>
              <span class="text-xs text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">
                {{ repair()!.photos!.length }} foto{{ repair()!.photos!.length === 1 ? '' : 's' }}
              </span>
            </div>
            <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              @for (photo of repair()!.photos!; track $index) {
                <button type="button" (click)="openLightbox($index)"
                  class="relative group rounded-lg overflow-hidden aspect-square border border-slate-800 hover:border-cyan-500/50 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500">
                  <img [src]="photo" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" [alt]="'Evidencia ' + ($index + 1)" />
                  <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <svg class="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.003 15.803zM10.5 7.5v6m3-3h-6"/>
                    </svg>
                  </div>
                  <div class="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black/70 flex items-center justify-center">
                    <span class="text-[10px] text-slate-300">{{ $index + 1 }}</span>
                  </div>
                </button>
              }
            </div>
          </div>
        }

        <!-- Lightbox -->
        @if (lightboxIndex() !== null) {
          <div class="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            (click)="closeLightbox()">
            <!-- Dismiss on background click -->
            <div class="relative max-w-3xl w-full flex flex-col items-center gap-3" (click)="$event.stopPropagation()">
              <!-- Counter -->
              <span class="text-slate-400 text-sm font-mono">
                {{ lightboxIndex()! + 1 }} / {{ repair()!.photos!.length }}
              </span>
              <!-- Image -->
              <img [src]="repair()!.photos![lightboxIndex()!]"
                class="max-h-[75vh] w-auto rounded-xl shadow-2xl border border-slate-700"
                [alt]="'Foto ' + (lightboxIndex()! + 1)" />
              <!-- Nav row -->
              <div class="flex items-center gap-4">
                <button type="button" (click)="prevPhoto()"
                  [disabled]="lightboxIndex() === 0"
                  class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-colors">
                  ‹ Anterior
                </button>
                <button type="button" (click)="closeLightbox()"
                  class="px-4 py-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white transition-colors">
                  Cerrar
                </button>
                <button type="button" (click)="nextPhoto()"
                  [disabled]="lightboxIndex() === repair()!.photos!.length - 1"
                  class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-colors">
                  Siguiente ›
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Delivery Modal -->
        @if (showDeliveryModal()) {
          <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div class="glass rounded-2xl w-full max-w-md p-6 fade-in space-y-5">

              <!-- Header -->
              <div class="flex items-center gap-3">
                <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/20">
                  <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <h2 class="text-lg font-heading font-bold text-white">Cerrar Orden</h2>
                  <p class="text-xs text-slate-400">Completa los datos antes de marcar como entregado</p>
                </div>
              </div>

              <!-- Total a pagar -->
              <div>
                <label class="text-sm font-semibold text-slate-300 block mb-1.5">
                  <span class="inline-flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 11.219 12.768 11 12 11c-.768 0-1.536-.22-2.121-.659-.586-.439-.586-1.152 0-1.591.586-.44 1.536-.44 2.121 0l.879.659"/>
                    </svg>
                    Total a pagar
                  </span>
                </label>
                <div class="relative">
                  <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
                  <input type="number" [(ngModel)]="deliveryForm.finalCost" name="dlvCost" min="0" step="0.01"
                    placeholder="0.00"
                    [readonly]="repair()?.repairResult === 'no'"
                    [class]="'w-full pl-8 pr-4 py-2.5 rounded-xl border text-lg font-semibold transition-colors ' + (repair()?.repairResult === 'no' ? 'bg-slate-900/80 border-slate-700 text-slate-400 cursor-not-allowed select-none' : 'bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-600 focus:border-emerald-500')" />
                </div>
                @if (deliveryForm.repaired === 'no') {
                  <p class="text-xs text-amber-400 mt-1.5 flex items-center gap-1">
                    <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
                    </svg>
                    Cobro de $5.00 por diagnóstico — equipo no reparado
                  </p>
                }
              </div>

              <!-- ¿Se reparó? -->
              <div>
                <label class="text-sm font-semibold text-slate-300 block mb-1.5">
                  <span class="inline-flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Resultado de la reparación
                  </span>
                </label>
                @if (repair()?.repairResult) {
                  <!-- Read-only: result already captured in 'listo' step -->
                  <div [class]="repair()!.repairResult === 'si'
                    ? 'flex items-center gap-2.5 py-3 px-4 rounded-xl border-2 border-emerald-600 bg-emerald-500/10 text-emerald-400 font-semibold text-sm'
                    : 'flex items-center gap-2.5 py-3 px-4 rounded-xl border-2 border-red-600 bg-red-500/10 text-red-400 font-semibold text-sm'">
                    <span class="text-base">{{ repair()!.repairResult === 'si' ? '✅' : '❌' }}</span>
                    <span>{{ repair()!.repairResult === 'si' ? 'Sí se reparó' : 'No se reparó' }}</span>
                    <span class="ml-auto text-xs font-normal opacity-60">Ya registrado</span>
                  </div>
                } @else {
                  <!-- Toggle buttons when result not yet known -->
                  <div class="grid grid-cols-2 gap-2">
                    <button type="button"
                      (click)="deliveryForm.repaired = 'si'; deliveryForm.finalCost = repair()!.estimatedCost ?? deliveryForm.finalCost"
                      [class]="deliveryForm.repaired === 'si'
                        ? 'flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-emerald-500 bg-emerald-500/15 text-emerald-400 font-semibold text-sm transition-all'
                        : 'flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600 text-sm transition-all'">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                      </svg>
                      Sí se reparó
                    </button>
                    <button type="button"
                      (click)="deliveryForm.repaired = 'no'; deliveryForm.finalCost = 5"
                      [class]="deliveryForm.repaired === 'no'
                        ? 'flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-500 bg-red-500/15 text-red-400 font-semibold text-sm transition-all'
                        : 'flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600 text-sm transition-all'">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                      No se reparó
                    </button>
                  </div>
                }
              </div>

              <!-- Nota del técnico -->
              <div>
                <label class="text-sm font-semibold text-slate-300 block mb-1.5">
                  <span class="inline-flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-yellow-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/>
                    </svg>
                    Nota del técnico
                    <span class="text-slate-500 font-normal">(diagnóstico / lo que se encontró)</span>
                  </span>
                </label>
                <textarea [(ngModel)]="deliveryForm.technicianNotes" name="dlvNotes" rows="4"
                  placeholder="Ej: Se reemplazó la placa lógica, batería en buen estado, pantalla sin daños..."
                  class="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700 text-white placeholder:text-slate-600 focus:border-yellow-500/60 transition-colors resize-none text-sm"></textarea>
              </div>

              <!-- Actions -->
              <div class="flex gap-3 pt-1">
                <button type="button" (click)="showDeliveryModal.set(false)"
                  class="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold transition-colors">
                  Cancelar
                </button>
                <button type="button" (click)="confirmDelivery()" [disabled]="saving()"
                  class="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold transition-all">
                  {{ saving() ? 'Guardando...' : 'Confirmar entrega' }}
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Ready Modal -->
        @if (showReadyModal()) {
          <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div class="glass rounded-2xl w-full max-w-sm p-6 fade-in">
              <div class="flex items-center justify-between mb-5">
                <h2 class="text-xl font-heading font-semibold text-white">Marcar como Listo</h2>
                <button (click)="showReadyModal.set(false)" class="text-slate-500 hover:text-white">✕</button>
              </div>

              <p class="text-slate-400 text-sm mb-4">¿Se logró reparar el equipo?</p>

              <!-- Result toggle -->
              <div class="grid grid-cols-2 gap-3 mb-6">
                <button type="button" (click)="readyRepaired.set('si')"
                  [class]="'py-3 rounded-xl font-bold text-sm transition-all ' + (readyRepaired() === 'si' ? 'bg-emerald-600 text-white ring-2 ring-emerald-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700')">
                  ✅ Sí, reparado
                </button>
                <button type="button" (click)="readyRepaired.set('no')"
                  [class]="'py-3 rounded-xl font-bold text-sm transition-all ' + (readyRepaired() === 'no' ? 'bg-red-600 text-white ring-2 ring-red-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700')">
                  ❌ No reparado
                </button>
              </div>

              <!-- Actions -->
              <div class="flex gap-3">
                <button type="button" (click)="showReadyModal.set(false)"
                  class="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold transition-colors">
                  Cancelar
                </button>
                <button type="button" (click)="confirmReady()" [disabled]="saving() || !readyRepaired()"
                  class="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold transition-all">
                  {{ saving() ? 'Guardando...' : 'Confirmar' }}
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Ready Modal -->
        @if (showReadyModal()) {
          <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div class="glass rounded-2xl w-full max-w-sm p-6 fade-in">
              <div class="flex items-center justify-between mb-5">
                <h2 class="text-xl font-heading font-semibold text-white">Marcar como Listo</h2>
                <button (click)="showReadyModal.set(false)" class="text-slate-500 hover:text-white">✕</button>
              </div>

              <p class="text-slate-400 text-sm mb-4">¿Se logró reparar el equipo?</p>

              <!-- Result toggle -->
              <div class="grid grid-cols-2 gap-3 mb-6">
                <button type="button" (click)="readyRepaired.set('si')"
                  [class]="'py-3 rounded-xl font-bold text-sm transition-all ' + (readyRepaired() === 'si' ? 'bg-emerald-600 text-white ring-2 ring-emerald-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700')">
                  ✅ Sí, reparado
                </button>
                <button type="button" (click)="readyRepaired.set('no')"
                  [class]="'py-3 rounded-xl font-bold text-sm transition-all ' + (readyRepaired() === 'no' ? 'bg-red-600 text-white ring-2 ring-red-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700')">
                  ❌ No reparado
                </button>
              </div>

              <!-- Actions -->
              <div class="flex gap-3">
                <button type="button" (click)="showReadyModal.set(false)"
                  class="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold transition-colors">
                  Cancelar
                </button>
                <button type="button" (click)="confirmReady()" [disabled]="saving() || !readyRepaired()"
                  class="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold transition-all">
                  {{ saving() ? 'Guardando...' : 'Confirmar' }}
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Edit Modal -->
        @if (showEditModal()) {          <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div class="glass rounded-2xl w-full max-w-lg p-6 fade-in my-4">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-heading font-semibold text-white">Editar Reparación</h2>
                <button (click)="showEditModal.set(false)" class="text-slate-500 hover:text-white">✕</button>
              </div>

              <form (ngSubmit)="saveEdit()" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm text-slate-300 block mb-1">Marca</label>
                    <input type="text" [(ngModel)]="editForm.deviceBrand" name="brand"
                      class="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white focus:border-cyan-500 transition-colors" />
                  </div>
                  <div>
                    <label class="text-sm text-slate-300 block mb-1">Modelo</label>
                    <input type="text" [(ngModel)]="editForm.deviceModel" name="model"
                      class="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white focus:border-cyan-500 transition-colors" />
                  </div>
                </div>
                <div>
                  <label class="text-sm text-slate-300 block mb-1">Descripción del Problema</label>
                  <textarea [(ngModel)]="editForm.issueDescription" name="issue" rows="3"
                    class="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white focus:border-cyan-500 transition-colors resize-none"></textarea>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm text-slate-300 block mb-1">Costo Estimado</label>
                    <input type="number" [(ngModel)]="editForm.estimatedCost" name="est"
                      class="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white focus:border-cyan-500 transition-colors" />
                  </div>
                  <div>
                    <label class="text-sm text-slate-300 block mb-1">Costo Final</label>
                    <input type="number" [(ngModel)]="editForm.finalCost" name="final"
                      class="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white focus:border-cyan-500 transition-colors" />
                  </div>
                </div>
                <div>
                  <label class="text-sm text-slate-300 block mb-1">Notas del Técnico</label>
                  <textarea [(ngModel)]="editForm.technicianNotes" name="notes" rows="3"
                    class="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white focus:border-cyan-500 transition-colors resize-none"></textarea>
                </div>
                <div>
                  <label class="text-sm text-slate-300 block mb-1">
                    <span class="inline-flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      Fecha de entrega estimada
                    </span>
                  </label>
                  <input type="date" [(ngModel)]="editForm.estimatedCompletion" name="completion"
                    [min]="createdAtDate"
                    style="color-scheme: dark;"
                    class="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white focus:border-cyan-500 transition-colors cursor-pointer" />
                  @if (editForm.estimatedCompletion) {
                    <p class="text-xs text-cyan-400 mt-1">{{ formatDate(editForm.estimatedCompletion) }}</p>
                  }
                </div>
                <div class="flex gap-3 pt-2">
                  <button type="button" (click)="showEditModal.set(false)"
                    class="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" [disabled]="saving()"
                    class="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold transition-all">
                    {{ saving() ? 'Guardando...' : 'Guardar' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        }
      }
    </div>
  `
})
export class RepairDetailComponent implements OnInit {
  id = input.required<string>();

  private api = inject(ApiService);
  private toast = inject(ToastService);
  private pdf = inject(PdfService);

  repair = signal<RepairOrder | null>(null);
  loading = signal(true);
  saving = signal(false);
  showEditModal = signal(false);
  lightboxIndex = signal<number | null>(null);
  showDeliveryModal = signal(false);
  deliveryForm: { finalCost: number | null; repaired: 'si' | 'no' | null; technicianNotes: string } =
    { finalCost: null, repaired: null, technicianNotes: '' };
  showReadyModal = signal(false);
  readyRepaired = signal<'si' | 'no' | null>(null);
  statuses = REPAIR_STATUSES;

  /** Índice del estado actual en el arreglo REPAIR_STATUSES */
  get currentStatusIndex(): number {
    return REPAIR_STATUSES.findIndex(s => s.value === this.repair()?.status);
  }

  /** Índice de un estado dado en el arreglo REPAIR_STATUSES */
  statusIndexOf(status: RepairStatus): number {
    return REPAIR_STATUSES.findIndex(s => s.value === status);
  }

  editForm: any = {};

  /** Fecha mínima para el date picker = fecha en que se creó la orden */
  get createdAtDate(): string {
    const r = this.repair();
    if (!r?.createdAt) return new Date().toISOString().split('T')[0];
    return new Date(r.createdAt).toISOString().split('T')[0];
  }

  /** Formatea una fecha ISO YYYY-MM-DD a texto legible en español.
   *  Si el valor almacenado no es una fecha válida (ej: texto libre antiguo)
   *  devuelve el string original sin modificar. */
  formatDate(iso: string): string {
    if (!iso) return '';
    // Solo intentar parsear si tiene forma de fecha: YYYY-MM-DD
    const dateOnly = iso.split('T')[0];
    const isDateFormat = /^\d{4}-\d{2}-\d{2}$/.test(dateOnly);
    if (!isDateFormat) return iso; // texto libre → mostrarlo tal cual
    const [y, m, d] = dateOnly.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (isNaN(date.getTime())) return iso; // fecha inválida → mostrar original
    return date.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  openLightbox(index: number) { this.lightboxIndex.set(index); }
  closeLightbox() { this.lightboxIndex.set(null); }
  prevPhoto() {
    const i = this.lightboxIndex();
    if (i !== null && i > 0) this.lightboxIndex.set(i - 1);
  }
  nextPhoto() {
    const i = this.lightboxIndex();
    const max = (this.repair()!.photos?.length ?? 1) - 1;
    if (i !== null && i < max) this.lightboxIndex.set(i + 1);
  }

  get waMessage(): string {
    const r = this.repair();
    if (!r) return '';
    const trackingUrl = `${window.location.origin}/seguimiento/${r.orderNumber}`;
    const statusLabel: Record<string, string> = {
      recibido: 'Recibido ✅', diagnostico: 'En Diagnóstico 🔍',
      reparando: 'En Reparación 🔧', listo: 'Listo para retirar 🎉', entregado: 'Entregado ✔️',
    };
    const lines = [
      `Hola ${r.clientName} 👋`,
      ``,
      `Le informamos sobre su *${r.deviceBrand} ${r.deviceModel}* (Orden: *${r.orderNumber}*)`,
      ``,
      `📌 Estado actual: *${statusLabel[r.status] ?? r.status.toUpperCase()}*`,
      ``,
      `Puede hacer seguimiento en tiempo real aquí:`,
      `🔗 ${trackingUrl}`,
      ``,
      `_Equipo Aguirre Fix Pro_ 🛠️`,
    ];
    return lines.join('\n');
  }

  ngOnInit() { this.fetchRepair(); }

  fetchRepair() {
    this.api.getRepair(this.id()).subscribe({
      next: r => {
        this.repair.set(r);
        this.editForm = { ...r };
        this.loading.set(false);
      },
      error: () => { this.toast.error('Orden no encontrada'); this.loading.set(false); }
    });
  }

  onStatusClick(status: RepairStatus) {
    if (this.repair()?.status === status) return;

    // Bloquear retroceso de estado
    const currentIdx = REPAIR_STATUSES.findIndex(s => s.value === this.repair()?.status);
    const targetIdx = REPAIR_STATUSES.findIndex(s => s.value === status);
    if (targetIdx < currentIdx) {
      this.toast.error('No se puede retroceder el estado de una reparación');
      return;
    }

    if (status === 'listo') {
      this.readyRepaired.set(null);
      this.showReadyModal.set(true);
    } else if (status === 'entregado') {
      // Pre-fill form with existing data
      const r = this.repair()!;
      // If repairResult was already set in the 'listo' step, carry it over automatically
      const existingResult = (r.repairResult as 'si' | 'no' | null) ?? null;
      this.deliveryForm = {
        finalCost: r.finalCost ?? (existingResult === 'no' ? 5 : r.estimatedCost ?? null),
        repaired: existingResult,
        technicianNotes: r.technicianNotes ?? ''
      };
      this.showDeliveryModal.set(true);
    } else {
      this.updateStatus(status);
    }
  }

  confirmDelivery() {
    if (!this.deliveryForm.repaired) {
      this.toast.error('Indica si el equipo fue reparado o no'); return;
    }
    this.saving.set(true);
    const repairedLabel = this.deliveryForm.repaired === 'si'
      ? 'Equipo reparado'
      : 'No fue posible reparar el equipo - se cobra $5.00 por diagnostico';
    const notes = [repairedLabel, this.deliveryForm.technicianNotes?.trim()].filter(Boolean).join('\n\n');
    this.api.updateRepair(this.id(), {
      finalCost: this.deliveryForm.finalCost ?? undefined,
      technicianNotes: notes,
    }).subscribe({
      next: updated => {
        this.repair.set(updated);
        this.api.updateRepairStatus(this.id(), 'entregado').subscribe({
          next: r => {
            this.repair.set(r);
            this.showDeliveryModal.set(false);
            this.toast.success('Orden marcada como entregada');
          },
          error: () => this.toast.error('Error al actualizar estado'),
          complete: () => this.saving.set(false)
        });
      },
      error: () => { this.toast.error('Error al guardar'); this.saving.set(false); }
    });
  }

  confirmReady() {
    if (!this.readyRepaired()) {
      this.toast.error('Indica si el equipo fue reparado o no'); return;
    }
    this.saving.set(true);
    this.api.updateRepair(this.id(), { repairResult: this.readyRepaired()! }).subscribe({
      next: updated => {
        this.repair.set(updated);
        this.api.updateRepairStatus(this.id(), 'listo').subscribe({
          next: r => {
            this.repair.set(r);
            this.showReadyModal.set(false);
            this.toast.success('Estado actualizado: listo para retirar');
          },
          error: () => this.toast.error('Error al actualizar estado'),
          complete: () => this.saving.set(false)
        });
      },
      error: () => { this.toast.error('Error al guardar'); this.saving.set(false); }
    });
  }

  updateStatus(status: RepairStatus) {
    if (this.repair()?.status === status) return;
    this.api.updateRepairStatus(this.id(), status).subscribe({
      next: r => {
        this.repair.set(r);
        this.toast.success(`Estado actualizado: ${status}`);
      },
      error: () => this.toast.error('Error al actualizar estado')
    });
  }

  saveEdit() {
    this.saving.set(true);
    this.api.updateRepair(this.id(), {
      deviceBrand: this.editForm.deviceBrand,
      deviceModel: this.editForm.deviceModel,
      issueDescription: this.editForm.issueDescription,
      estimatedCost: this.editForm.estimatedCost,
      finalCost: this.editForm.finalCost,
      technicianNotes: this.editForm.technicianNotes,
      accessories: this.editForm.accessories,
      estimatedCompletion: this.editForm.estimatedCompletion,
    }).subscribe({
      next: r => {
        this.repair.set(r);
        this.showEditModal.set(false);
        this.toast.success('Reparación actualizada');
      },
      error: () => this.toast.error('Error al actualizar'),
      complete: () => this.saving.set(false)
    });
  }

  sendWhatsApp() {
    const phone = this.repair()?.clientPhone?.replace(/\D/g, '');
    if (!phone) return;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(this.waMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  async generatePdf() {
    if (this.repair()) await this.pdf.generateTicket(this.repair()!);
  }

  async generateInvoice() {
    if (this.repair()) await this.pdf.generateInvoice(this.repair()!);
  }
}
