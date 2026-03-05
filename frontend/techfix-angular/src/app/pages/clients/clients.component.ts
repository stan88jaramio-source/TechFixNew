import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { Client, ClientCreateRequest } from '../../models/client.model';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { debounceTime, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, UpperCasePipe],
  template: `
    <div class="space-y-6 fade-in">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-heading font-bold text-white">Clientes</h1>
          <p class="text-slate-400 mt-1">{{ clients().length }} clientes registrados</p>
        </div>
        <button (click)="showModal.set(true)"
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-all active:scale-95">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo Cliente
        </button>
      </div>

      <!-- Search -->
      <div class="relative">
        <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" [(ngModel)]="search" (ngModelChange)="onSearch($event)"
          placeholder="Buscar por nombre, teléfono o email..."
          class="w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-white placeholder:text-slate-500 focus:border-cyan-500 transition-colors" />
      </div>

      <!-- List -->
      @if (loading()) {
        <div class="flex items-center justify-center h-64">
          <div class="text-cyan-400 animate-pulse-slow">Cargando clientes...</div>
        </div>
      } @else if (clients().length === 0) {
        <div class="flex flex-col items-center justify-center py-16 border border-slate-800 rounded-xl bg-slate-900/50">
          <svg class="w-16 h-16 text-slate-700 mb-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
          </svg>
          <h3 class="text-xl font-heading text-white mb-2">No hay clientes</h3>
          <p class="text-slate-400 mb-4">Agrega tu primer cliente</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          @for (client of clients(); track client.id) {
            <a [routerLink]="['/clientes', client.id]"
              class="block bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 rounded-xl p-5 transition-colors group">
              <div class="flex items-start justify-between mb-3">
                <div class="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-lg">
                  {{ client.name[0] | uppercase }}
                </div>
                <span class="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                  {{ client.totalRepairs }} rep.
                </span>
              </div>
              <h3 class="font-semibold text-white group-hover:text-cyan-400 transition-colors">{{ client.name }}</h3>
              <p class="text-sm text-slate-400 mt-1">{{ client.phone }}</p>
              @if (client.email) {
                <p class="text-sm text-slate-500">{{ client.email }}</p>
              }
              <p class="text-xs text-slate-600 mt-2">{{ client.createdAt | date:'dd/MM/yyyy' }}</p>
            </a>
          }
        </div>
      }

      <!-- Create Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="glass rounded-2xl w-full max-w-md p-6 fade-in">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-heading font-semibold text-white">Nuevo Cliente</h2>
              <button (click)="showModal.set(false)" class="text-slate-500 hover:text-white">✕</button>
            </div>

            <form (ngSubmit)="createClient()" class="space-y-4">
              <div>
                <label class="text-sm text-slate-300 block mb-1">Nombre *</label>
                <input type="text" [(ngModel)]="newClient.name" name="name" required
                  class="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500 transition-colors" />
              </div>
              <div>
                <label class="text-sm text-slate-300 block mb-1">Teléfono *</label>
                <input type="text" [(ngModel)]="newClient.phone" name="phone" required
                  class="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500 transition-colors" />
              </div>
              <div>
                <label class="text-sm text-slate-300 block mb-1">Email</label>
                <input type="email" [(ngModel)]="newClient.email" name="email"
                  class="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500 transition-colors" />
              </div>
              <div>
                <label class="text-sm text-slate-300 block mb-1">Dirección</label>
                <input type="text" [(ngModel)]="newClient.address" name="address"
                  class="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500 transition-colors" />
              </div>
              <div class="flex gap-3 pt-2">
                <button type="button" (click)="showModal.set(false)"
                  class="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors">
                  Cancelar
                </button>
                <button type="submit" [disabled]="saving()"
                  class="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold transition-all active:scale-95">
                  {{ saving() ? 'Guardando...' : 'Crear Cliente' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class ClientsComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  clients = signal<Client[]>([]);
  loading = signal(true);
  saving = signal(false);
  showModal = signal(false);
  search = '';

  newClient: ClientCreateRequest = { name: '', phone: '', email: '', address: '' };

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      takeUntilDestroyed()
    ).subscribe(term => this.fetchClients(term));
  }

  ngOnInit() { this.fetchClients(); }

  fetchClients(search?: string) {
    this.api.getClients(search || undefined).subscribe({
      next: list => { this.clients.set(list); this.loading.set(false); },
      error: () => { this.toast.error('Error al cargar clientes'); this.loading.set(false); }
    });
  }

  onSearch(value: string) { this.searchSubject.next(value); }

  createClient() {
    if (!this.newClient.name || !this.newClient.phone) return;
    this.saving.set(true);
    this.api.createClient(this.newClient).subscribe({
      next: () => {
        this.toast.success('Cliente creado exitosamente');
        this.showModal.set(false);
        this.newClient = { name: '', phone: '' };
        this.fetchClients(this.search);
      },
      error: () => this.toast.error('Error al crear cliente'),
      complete: () => this.saving.set(false)
    });
  }
}
