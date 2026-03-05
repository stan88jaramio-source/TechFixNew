import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="max-w-2xl mx-auto space-y-6 fade-in">

      <!-- Header -->
      <div>
        <h1 class="text-3xl font-heading font-bold text-white">Configuración</h1>
        <p class="text-slate-400 mt-1">Perfil de tu taller</p>
      </div>

      <!-- Solo lectura para no-admins -->
      @if (!isAdmin()) {
        <div class="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-300">
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
          </svg>
          Solo los administradores pueden modificar la configuración del taller.
        </div>
      }

      <!-- Logo section -->
      <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-5">
        <h2 class="font-heading text-white">Logo del taller</h2>

        <!-- Current/preview logo -->
        <div class="flex items-center gap-6">
          <div class="w-24 h-24 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors"
            [class.border-slate-700]="!previewUrl()"
            [class.border-cyan-500]="!!previewUrl()">
            @if (previewUrl()) {
              <img [src]="previewUrl()!" alt="Logo taller"
                class="w-full h-full object-contain" />
            } @else {
              <svg class="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M8.25 7.5h.008v.008H8.25V7.5ZM3 17.25V6.75A2.25 2.25 0 0 1 5.25 4.5h13.5A2.25 2.25 0 0 1 21 6.75v10.5A2.25 2.25 0 0 1 18.75 21H5.25A2.25 2.25 0 0 1 3 18.75v-1.5Z" />
              </svg>
            }
          </div>

          <div class="flex-1 space-y-2">
            <p class="text-sm text-slate-300">
              Formatos admitidos: <span class="text-slate-500">PNG, JPG, WEBP, SVG</span><br>
              Tamaño máximo: <span class="text-slate-500">2 MB</span>
            </p>

            <!-- File input — solo admin -->
            @if (isAdmin()) {
              <label class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700
                hover:bg-slate-700 text-slate-300 text-sm cursor-pointer transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/>
                </svg>
                Subir logo
                <input type="file" class="hidden" accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  (change)="onFileSelected($event)" />
              </label>

              @if (previewUrl()) {
                <button type="button" (click)="removeLogo()"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                  Eliminar logo
                </button>
              }
            }
          </div>
        </div>

        @if (fileError()) {
          <p class="text-xs text-red-400 flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            {{ fileError() }}
          </p>
        }
      </div>

      <!-- Shop name -->
      <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 class="font-heading text-white">Información de la tienda</h2>

        <div>
          <label class="text-sm text-slate-300 block mb-1">Nombre del taller @if (isAdmin()) { <span class="text-red-400">*</span> }</label>
          <input type="text" [(ngModel)]="shopName" name="shopName"
            placeholder="Aguirre Fix Pro"
            [disabled]="!isAdmin()"
            class="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed" />
        </div>

        @if (savedAt()) {
          <p class="text-xs text-slate-500">
            Última actualización: {{ savedAt() }}
          </p>
        }
      </div>

      <!-- Actions — solo admin -->
      @if (isAdmin()) {
        <div class="flex justify-end gap-3">
        <button type="button" (click)="loadSettings()"
          class="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-semibold transition-colors">
          Cancelar
        </button>
        <button type="button" (click)="save()" [disabled]="saving()"
          class="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-sm transition-all active:scale-95 flex items-center gap-2">
          @if (saving()) {
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Guardando...
          } @else {
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
            </svg>
            Guardar cambios
          }
        </button>
      </div>
      }

      <!-- Gestión de Usuarios — solo admin -->
      @if (isAdmin()) {
        <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-5">
          <div>
            <h2 class="font-heading text-white">Gestión de Usuarios</h2>
            <p class="text-slate-400 text-sm mt-1">Crea cuentas para los técnicos de tu taller. Solo los administradores pueden acceder a esta sección.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="space-y-1">
              <label class="text-xs text-slate-400">Nombre</label>
              <input type="text" [(ngModel)]="newUser.name" name="nu_name" placeholder="Nombre del técnico"
                class="w-full px-3 py-2 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500 text-sm transition-colors" />
            </div>
            <div class="space-y-1">
              <label class="text-xs text-slate-400">Email</label>
              <input type="email" [(ngModel)]="newUser.email" name="nu_email" placeholder="tecnico@taller.com"
                class="w-full px-3 py-2 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500 text-sm transition-colors" />
            </div>
            <div class="space-y-1">
              <label class="text-xs text-slate-400">Contraseña inicial</label>
              <input type="password" [(ngModel)]="newUser.password" name="nu_pass" placeholder="Mín. 6 caracteres"
                class="w-full px-3 py-2 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500 text-sm transition-colors" />
            </div>
          </div>

          <div class="flex justify-end">
            <button type="button" (click)="createUser()" [disabled]="creatingUser()"
              class="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold text-sm transition-all active:scale-95 flex items-center gap-2">
              @if (creatingUser()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Creando...
              } @else {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                </svg>
                Crear Técnico
              }
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class SettingsComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  auth = inject(AuthService);

  isAdmin = computed(() => this.auth.currentUser()?.role === 'admin');

  shopName = '';
  saving = signal(false);
  fileError = signal('');

  newUser = { name: '', email: '', password: '' };
  creatingUser = signal(false);

  /** Data URI mostrado en el preview */
  previewUrl = signal<string | null>(null);

  /** Archivo seleccionado por el usuario (null = sin cambio) */
  private pendingFile: File | null = null;
  private logoRemoved = false;

  savedAt = signal('');

  ngOnInit() { this.loadSettings(); }

  loadSettings() {
    this.pendingFile = null;
    this.logoRemoved = false;
    this.fileError.set('');

    this.api.getSettings().subscribe({
      next: s => {
        this.shopName = s.shopName;
        // Reconstruir data URL desde base64 puro + mime
        if (s.logoBase64 && s.logoMimeType) {
          this.previewUrl.set(`data:${s.logoMimeType};base64,${s.logoBase64}`);
        } else {
          this.previewUrl.set(null);
        }
        if (s.updatedAt) {
          this.savedAt.set(new Date(s.updatedAt).toLocaleString('es-MX'));
        }
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.fileError.set('');
    if (!file) return;

    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      this.fileError.set('Formato no admitido. Usa PNG, JPG, WEBP o SVG.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.fileError.set('El archivo supera el límite de 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl.set(reader.result as string);
      this.pendingFile = file;
      this.logoRemoved = false;
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  removeLogo() {
    this.previewUrl.set(null);
    this.pendingFile = null;
    this.logoRemoved = true;
  }

  save() {
    if (!this.shopName.trim()) {
      this.toast.error('El nombre del taller es obligatorio');
      return;
    }

    this.saving.set(true);

    this.api.updateSettings(this.shopName.trim(), this.pendingFile, this.logoRemoved).subscribe({
      next: s => {
        this.saving.set(false);
        this.pendingFile = null;
        this.logoRemoved = false;
        if (s.logoBase64 && s.logoMimeType) {
          this.previewUrl.set(`data:${s.logoMimeType};base64,${s.logoBase64}`);
        } else {
          this.previewUrl.set(null);
        }
        this.savedAt.set(new Date(s.updatedAt).toLocaleString('es-MX'));
        this.toast.success('Configuracion guardada correctamente');
      },
      error: err => {
        this.saving.set(false);
        this.toast.error(err?.error?.detail ?? 'Error al guardar la configuracion');
      }
    });
  }

  createUser() {
    const { name, email, password } = this.newUser;
    if (!name.trim() || !email.trim() || !password) {
      this.toast.error('Completa todos los campos del nuevo usuario');
      return;
    }
    if (password.length < 6) {
      this.toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    this.creatingUser.set(true);
    this.api.createUser(name.trim(), email.trim(), password).subscribe({
      next: () => {
        this.toast.success(`Usuario "${name}" creado correctamente`);
        this.newUser = { name: '', email: '', password: '' };
        this.creatingUser.set(false);
      },
      error: err => {
        this.toast.error(err?.error?.detail ?? 'Error al crear el usuario');
        this.creatingUser.set(false);
      }
    });
  }
}
