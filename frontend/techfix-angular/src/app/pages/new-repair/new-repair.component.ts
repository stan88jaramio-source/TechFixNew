import { Component, inject, signal, OnInit, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { Client, ClientCreateRequest } from '../../models/client.model';
import { RepairCreateRequest } from '../../models/repair.model';

@Component({
  selector: 'app-new-repair',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="max-w-2xl mx-auto space-y-6 fade-in">

      <!-- Header -->
      <div>
        <h1 class="text-3xl font-heading font-bold text-white">Nueva Reparación</h1>
        <p class="text-slate-400 mt-1">Registra una nueva orden de trabajo</p>
      </div>

      <form (ngSubmit)="onSubmit()" class="space-y-6">

        <!-- Client section -->
        <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="font-heading text-white">Cliente</h2>
            <!-- Toggle existing / new -->
            <div class="flex items-center gap-1 bg-slate-950/60 rounded-lg p-1 border border-slate-800">
              <button type="button"
                (click)="clientMode.set('existing')"
                [class]="clientMode() === 'existing'
                  ? 'px-3 py-1.5 rounded-md text-xs font-semibold bg-cyan-600 text-white transition-all'
                  : 'px-3 py-1.5 rounded-md text-xs font-semibold text-slate-400 hover:text-white transition-all'">
                Existente
              </button>
              <button type="button"
                (click)="clientMode.set('new')"
                [class]="clientMode() === 'new'
                  ? 'px-3 py-1.5 rounded-md text-xs font-semibold bg-cyan-600 text-white transition-all'
                  : 'px-3 py-1.5 rounded-md text-xs font-semibold text-slate-400 hover:text-white transition-all'">
                + Nuevo cliente
              </button>
            </div>
          </div>

          <!-- Select existing client -->
          @if (clientMode() === 'existing') {
            <div>
              <label class="text-sm text-slate-300 block mb-1">Seleccionar cliente *</label>
              <div class="relative">
                <!-- Search box -->
                <input type="text" [(ngModel)]="clientSearch" name="clientSearch"
                  (input)="filterClients()"
                  placeholder="Buscar por nombre o telefono..."
                  class="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500 transition-colors mb-2" />
              </div>
              <select [(ngModel)]="form.clientId" name="clientId"
                class="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white focus:border-cyan-500 transition-colors">
                <option value="">-- Selecciona un cliente --</option>
                @for (client of filteredClients(); track client.id) {
                  <option [value]="client.id">{{ client.name }} · {{ client.phone }}</option>
                }
              </select>
              @if (form.clientId) {
                @for (c of clients(); track c.id) {
                  @if (c.id === form.clientId) {
                    <div class="mt-2 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-2 text-sm">
                      <svg class="w-4 h-4 text-cyan-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      <span class="text-cyan-300 font-medium">{{ c.name }}</span>
                      <span class="text-slate-500">Â·</span>
                      <span class="text-slate-400">{{ c.phone }}</span>
                      @if (c.email) {
                        <span class="text-slate-500">Â·</span>
                        <span class="text-slate-400">{{ c.email }}</span>
                      }
                    </div>
                  }
                }
              }
            </div>
          }

          <!-- Create new client inline -->
          @if (clientMode() === 'new') {
            <div class="space-y-3">
              <div class="flex items-center gap-2 text-xs text-cyan-400 mb-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                </svg>
                El cliente se creará automáticamente al guardar la orden
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="sm:col-span-2">
                  <label class="text-sm text-slate-300 block mb-1">Nombre completo *</label>
                  <input type="text" [(ngModel)]="newClient.name" name="ncName" required
                    placeholder="Juan García"
                    class="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500 transition-colors" />
                </div>
                <div>
                  <label class="text-sm text-slate-300 block mb-1">Teléfono *</label>
                  <input type="tel" [(ngModel)]="newClient.phone" name="ncPhone" required
                    placeholder="555 123 4567"
                    class="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500 transition-colors" />
                </div>
                <div>
                  <label class="text-sm text-slate-300 block mb-1">Email <span class="text-slate-500">(opcional)</span></label>
                  <input type="email" [(ngModel)]="newClient.email" name="ncEmail"
                    placeholder="correo@ejemplo.com"
                    class="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500 transition-colors" />
                </div>
                <div class="sm:col-span-2">
                  <label class="text-sm text-slate-300 block mb-1">Dirección <span class="text-slate-500">(opcional)</span></label>
                  <input type="text" [(ngModel)]="newClient.address" name="ncAddress"
                    placeholder="Calle, colonia, ciudad..."
                    class="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500 transition-colors" />
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Device -->
        <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 class="font-heading text-white">Dispositivo</h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-slate-300 block mb-1">Marca *</label>
              <input type="text" [(ngModel)]="form.deviceBrand" name="brand" required
                placeholder="Samsung, Apple, Xiaomi..."
                class="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500 transition-colors" />
            </div>
            <div>
              <label class="text-sm text-slate-300 block mb-1">Modelo *</label>
              <input type="text" [(ngModel)]="form.deviceModel" name="model" required
                placeholder="Galaxy S24, iPhone 15..."
                class="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500 transition-colors" />
            </div>
          </div>

          <div>
            <label class="text-sm text-slate-300 block mb-1">IMEI (opcional)</label>
            <input type="text" [(ngModel)]="form.imei" name="imei"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500 transition-colors" />
          </div>

          <div>
            <label class="text-sm text-slate-300 block mb-1">Accesorios recibidos</label>
            <input type="text" [(ngModel)]="form.accessories" name="accessories"
              placeholder="Cargador, funda, auriculares..."
              class="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500 transition-colors" />
          </div>
        </div>

        <!-- Problem -->
        <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 class="font-heading text-white">Problema</h2>

          <div>
            <label class="text-sm text-slate-300 block mb-1">Descripción del problema *</label>
            <textarea [(ngModel)]="form.issueDescription" name="issue" required rows="4"
              placeholder="Describe el problema del dispositivo..."
              class="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500 transition-colors resize-none"></textarea>
          </div>
        </div>

        <!-- Evidence Photos -->
        <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-heading text-white">Fotos de evidencia</h2>
              <p class="text-xs text-slate-500 mt-0.5">Mínimo 2 fotos del estado del equipo al ingresar</p>
            </div>
            <span [class]="photos().length >= 2
              ? 'text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400'
              : 'text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400'">
              {{ photos().length }} / 10
            </span>
          </div>

          <!-- Upload zone -->
          <input #photoInput type="file" multiple accept="image/*" class="hidden"
            (change)="onPhotosSelected($event)" />

          @if (photos().length < 10) {
            <button type="button" (click)="photoInput.click()"
              class="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-500/60 hover:bg-cyan-500/5 transition-colors group cursor-pointer">
              <svg class="w-8 h-8 text-slate-600 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"/>
              </svg>
              <span class="text-sm text-slate-500 group-hover:text-slate-300 transition-colors">
                Toca para agregar fotos
              </span>
              <span class="text-xs text-slate-600">JPG, PNG · Se comprimen automáticamente</span>
            </button>
          }

          <!-- Thumbnails grid -->
          @if (photos().length > 0) {
            <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
              @for (photo of photos(); track $index) {
                <div class="relative group rounded-lg overflow-hidden aspect-square border border-slate-800">
                  <img [src]="photo" class="w-full h-full object-cover" />
                  <button type="button" (click)="removePhoto($index)"
                    class="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                  <div class="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t from-black/60 flex items-center justify-center">
                    <span class="text-[10px] text-slate-300">{{ $index + 1 }}</span>
                  </div>
                </div>
              }
            </div>
          }

          @if (photosError()) {
            <p class="text-xs text-red-400 flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
              </svg>
              {{ photosError() }}
            </p>
          }
        </div>

        <!-- Cost & Time -->
        <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 class="font-heading text-white">Presupuesto y Tiempo</h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-slate-300 block mb-1">Costo estimado</label>
              <input type="number" [(ngModel)]="form.estimatedCost" name="cost" min="0" step="0.01"
                placeholder="0.00"
                class="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500 transition-colors" />
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
              <input type="date" [(ngModel)]="form.estimatedCompletion" name="completion"
                [min]="today"
                style="color-scheme: dark;"
                class="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white focus:border-cyan-500 transition-colors cursor-pointer" />
              @if (form.estimatedCompletion) {
                <p class="text-xs text-cyan-400 mt-1">
                  {{ formatDate(form.estimatedCompletion) }}
                </p>
              }
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <button type="button" (click)="router.navigate(['/reparaciones'])"
            class="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold transition-colors">
            Cancelar
          </button>
          <button type="submit" [disabled]="saving()"
            class="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold transition-all active:scale-95">
            {{ saving() ? 'Creando...' : 'Crear Orden' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class NewRepairComponent implements OnInit {
  clientId = input<string>();

  router = inject(Router);
  private api = inject(ApiService);
  private toast = inject(ToastService);

  clients = signal<Client[]>([]);
  filteredClients = signal<Client[]>([]);
  saving = signal(false);
  photos = signal<string[]>([]);
  photosError = signal('');

  /** 'existing' = seleccionar de la lista | 'new' = crear inline */
  clientMode = signal<'existing' | 'new'>('existing');

  clientSearch = '';

  newClient: ClientCreateRequest = { name: '', phone: '', email: '', address: '' };

  readonly today: string = new Date().toISOString().split('T')[0];

  form: RepairCreateRequest = {
    clientId: '',
    deviceBrand: '',
    deviceModel: '',
    issueDescription: '',
  };

  ngOnInit() {
    this.api.getClients().subscribe({
      next: list => {
        this.clients.set(list);
        this.filteredClients.set(list);
        if (this.clientId()) this.form.clientId = this.clientId()!;
      }
    });
  }

  filterClients() {
    const q = this.clientSearch.toLowerCase().trim();
    if (!q) { this.filteredClients.set(this.clients()); return; }
    this.filteredClients.set(
      this.clients().filter(c =>
        c.name.toLowerCase().includes(q) || c.phone.includes(q)
      )
    );
  }

  async onPhotosSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const files = Array.from(input.files);
    const available = 10 - this.photos().length;
    const toProcess = files.slice(0, available);
    const compressed = await Promise.all(toProcess.map(f => this.compressImage(f)));
    this.photos.update(p => [...p, ...compressed]);
    input.value = '';
    this.photosError.set('');
  }

  removePhoto(index: number) {
    this.photos.update(p => p.filter((_, i) => i !== index));
  }

  private compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const MAX = 900;
          let w = img.width, h = img.height;
          if (w > MAX || h > MAX) {
            if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
            else { w = Math.round(w * MAX / h); h = MAX; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.72));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  formatDate(iso: string): string {
    if (!iso) return '';
    const dateOnly = iso.split('T')[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return iso;
    const [y, m, d] = dateOnly.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (isNaN(date.getTime())) return iso;
    return date.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  onSubmit() {
    // Validaciones básicas
    if (this.clientMode() === 'existing' && !this.form.clientId) {
      this.toast.error('Selecciona un cliente'); return;
    }
    if (this.clientMode() === 'new' && (!this.newClient.name.trim() || !this.newClient.phone.trim())) {
      this.toast.error('El nombre y teléfono del cliente son obligatorios'); return;
    }
    if (this.photos().length < 2) {
      this.photosError.set('Agrega al menos 2 fotos de evidencia del equipo');
      return;
    }

    this.saving.set(true);

    if (this.clientMode() === 'new') {
      // 1. Crear el cliente primero, luego la orden
      this.api.createClient(this.newClient).subscribe({
        next: client => {
          this.form.clientId = client.id;
          this.createRepair();
        },
        error: err => {
          this.toast.error(err?.error?.detail ?? 'Error al crear el cliente');
          this.saving.set(false);
        }
      });
    } else {
      this.createRepair();
    }
  }

  private createRepair() {
    const req: RepairCreateRequest = { ...this.form, photos: this.photos().length ? this.photos() : undefined };
    this.api.createRepair(req).subscribe({
      next: repair => {
        this.toast.success('Orden creada exitosamente');
        this.router.navigate(['/reparaciones', repair.id]);
      },
      error: err => {
        this.toast.error(err?.error?.detail ?? 'Error al crear la orden');
        this.saving.set(false);
      }
    });
  }
}
