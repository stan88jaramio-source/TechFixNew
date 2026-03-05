import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../../components/toast/toast.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ToastComponent],
  template: `
    <div class="min-h-screen bg-[#020617] flex">
      <!-- Left – Form -->
      <div class="flex-1 flex items-center justify-center p-8">
        <div class="w-full max-w-md fade-in">

          <!-- Logo -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/20 mb-4 neon-cyan">
              <svg class="w-8 h-8 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-5 17a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4-4H7V5h9v10z"/>
              </svg>
            </div>
            <h1 class="text-3xl font-heading font-bold text-white">Aguirre Fix Pro</h1>
            <p class="text-slate-400 mt-2">Sistema de Gestión de Reparaciones</p>
          </div>

          <!-- Card -->
          <div class="glass rounded-2xl p-8">
            <h2 class="text-xl font-heading font-semibold text-white mb-6">Iniciar Sesión</h2>

            <form (ngSubmit)="onSubmit()" #f="ngForm" class="space-y-5">

              <div class="space-y-2">
                <label class="text-sm text-slate-300">Email</label>
                <input type="email" name="email" [(ngModel)]="form.email" required
                  placeholder="tu&#64;email.com"
                  class="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500 transition-colors" />
              </div>

              <div class="space-y-2">
                <label class="text-sm text-slate-300">Contraseña</label>
                <div class="relative">
                  <input [type]="showPw() ? 'text' : 'password'" name="password" [(ngModel)]="form.password" required
                    placeholder="••••••••"
                    class="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500 transition-colors" />
                  <button type="button" (click)="showPw.set(!showPw())"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {{ showPw() ? '🙈' : '👁' }}
                  </button>
                </div>
              </div>

              <button type="submit" [disabled]="loading()"
                class="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all active:scale-95">
                {{ loading() ? 'Verificando...' : 'Ingresar' }}
              </button>
            </form>

            <p class="mt-5 text-center text-xs text-slate-600">
              Para crear una cuenta contacta al administrador.
            </p>

            <!-- Copyright -->
            <p class="mt-8 text-center text-xs text-slate-600 select-none">
              &copy; {{ currentYear }} <span class="text-slate-500 font-medium">Aguirre</span> &mdash; Developer
            </p>
          </div>
        </div>
      </div>

      <!-- Right – Decorative panel -->
      <div class="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-cyan-500/5 to-purple-500/5 border-l border-slate-800/40 relative overflow-hidden">
        <div class="absolute inset-0">
          <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div class="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        <div class="relative text-center space-y-4 px-12">
          <h2 class="text-4xl font-heading font-bold text-white">Gestión de<br><span class="text-cyan-400">Reparaciones</span></h2>
          <p class="text-slate-400 max-w-xs mx-auto">Control completo de tu taller de reparación de dispositivos móviles.</p>
          <div class="flex justify-center gap-6 pt-4">
            <div class="text-center">
              <div class="text-2xl font-heading font-bold text-cyan-400">5</div>
              <div class="text-xs text-slate-500">Estados</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-heading font-bold text-purple-400">∞</div>
              <div class="text-xs text-slate-500">Clientes</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-heading font-bold text-green-400">PDF</div>
              <div class="text-xs text-slate-500">Tickets</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-toast />
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  showPw = signal(false);
  loading = signal(false);
  readonly currentYear = new Date().getFullYear();

  form = { email: '', password: '' };

  onSubmit() {
    this.loading.set(true);
    this.auth.login(this.form.email, this.form.password).subscribe({
      next: () => {
        this.toast.success('¡Bienvenido Tecnico!');
        this.router.navigate(['/']);
      },
      error: (err) => {
        const msg = err?.error?.detail ?? 'Credenciales incorrectas';
        this.toast.error(msg);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }
}
