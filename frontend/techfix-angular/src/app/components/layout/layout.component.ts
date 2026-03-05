import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { ToastComponent } from '../toast/toast.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastComponent, NgClass],
  template: `
    <div class="flex h-screen bg-[#020617] overflow-hidden">

      <!-- ── Sidebar ───────────────────────────────────────── -->
      <aside
        class="flex flex-col w-64 bg-slate-950/80 border-r border-slate-800/60 backdrop-blur-xl transition-all duration-300"
        [ngClass]="{ '-translate-x-full': !sidebarOpen(), 'translate-x-0': sidebarOpen() }"
        [class.fixed]="isMobile()"
        [class.z-50]="isMobile()" [class.h-full]="isMobile()">

        <!-- Logo -->
        <div class="flex items-center gap-3 px-6 py-5 border-b border-slate-800/60">
          <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/20 neon-cyan overflow-hidden">
            @if (logoUrl()) {
              <img [src]="logoUrl()!" alt="Logo" class="w-full h-full object-contain" />
            } @else {
              <svg class="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
              </svg>
            }
          </div>
          <div>
            <h1 class="text-base font-heading font-bold text-white">{{ shopName() }}</h1>
            <p class="text-xs text-slate-500">Taller de Reparaciones</p>
          </div>
        </div>

        <!-- Nav Links -->
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <a routerLink="/" routerLinkActive="bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent transition-all duration-200 text-sm font-medium">
            <!-- Dashboard icon -->
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            Dashboard
          </a>

          <a routerLink="/reparaciones" routerLinkActive="bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent transition-all duration-200 text-sm font-medium">
            <!-- Wrench icon -->
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
            Reparaciones
          </a>

          <a routerLink="/clientes" routerLinkActive="bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent transition-all duration-200 text-sm font-medium">
            <!-- Users icon -->
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Clientes
          </a>

          @if (isAdmin()) {
            <a routerLink="/configuracion" routerLinkActive="bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent transition-all duration-200 text-sm font-medium">
              <!-- Settings gear icon -->
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
              </svg>
              Configuración
            </a>
          }
        </nav>

        <!-- Copyright -->
        <div class="px-4 pb-1 text-center">
          <p class="text-[10px] text-slate-700 select-none">&copy; {{ currentYear }} Aguirre &mdash; Developer</p>
        </div>

        <!-- User footer -->
        <div class="p-4 border-t border-slate-800/60">
          <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50">
            <div class="w-9 h-9 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm font-bold">
              {{ userInitial }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white truncate">{{ auth.currentUser()?.name }}</p>
              <p class="text-xs text-slate-500 truncate">{{ roleLabel }}</p>
            </div>
            <button (click)="auth.logout()" title="Cerrar sesión"
              class="text-slate-500 hover:text-red-400 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- ── Main ──────────────────────────────────────────── -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Top bar (mobile hamburger) -->
        <header class="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 backdrop-blur-xl bg-slate-950/40 lg:hidden">
          <button (click)="sidebarOpen.set(!sidebarOpen())" class="text-slate-400 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <span class="font-heading font-bold text-white text-sm">Aguirre Fix Pro</span>
          <div class="w-6"></div>
        </header>

        <!-- Page content -->
        <main class="flex-1 overflow-y-auto p-6 lg:p-8">
          <router-outlet />
        </main>
      </div>

      <!-- Overlay on mobile when menu is open -->
      @if (isMobile() && sidebarOpen()) {
        <div class="fixed inset-0 bg-black/50 z-40" (click)="sidebarOpen.set(false)"></div>
      }

      <!-- ToastContainer -->
      <app-toast />

    </div>
  `
})
export class LayoutComponent implements OnInit {
  auth = inject(AuthService);
  private api = inject(ApiService);
  sidebarOpen = signal(true);
  isMobile = signal(window.innerWidth < 1024);
  isAdmin = computed(() => this.auth.currentUser()?.role === 'admin');

  logoUrl = signal<string | null>(null);
  shopName = signal('Aguirre Fix');
  readonly currentYear = new Date().getFullYear();

  ngOnInit() {
    this.api.getSettings().subscribe({
      next: s => {
        if (s.shopName) this.shopName.set(s.shopName);
        if (s.logoBase64 && s.logoMimeType) {
          this.logoUrl.set(`data:${s.logoMimeType};base64,${s.logoBase64}`);
        }
      }
    });
  }

  get userInitial(): string {
    return (this.auth.currentUser()?.name?.[0] ?? 'A').toUpperCase();
  }

  get roleLabel(): string {
    const role = this.auth.currentUser()?.role;
    if (role === 'admin') return 'Administrador';
    if (role === 'technician') return 'Técnico';
    return role ?? '';
  }
}
