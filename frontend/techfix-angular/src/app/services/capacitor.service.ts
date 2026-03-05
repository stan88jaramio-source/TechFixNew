import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * CapacitorService
 * ─────────────────────────────────────────────────────────
 * Inicializa y gestiona los plugins nativos de Capacitor
 * (StatusBar, SplashScreen, Keyboard, App back-button).
 *
 * Se inicializa una sola vez desde APP_INITIALIZER en app.config.ts.
 * En navegadores de escritorio todos los métodos son no-ops seguros.
 */
@Injectable({ providedIn: 'root' })
export class CapacitorService {
  private readonly router = inject(Router);

  /** Detecta si estamos corriendo dentro de un contexto nativo Capacitor */
  get isNative(): boolean {
    return typeof (window as any)?.Capacitor?.isNativePlatform === 'function' &&
           (window as any).Capacitor.isNativePlatform();
  }

  get platform(): 'android' | 'ios' | 'web' {
    return (window as any)?.Capacitor?.getPlatform?.() ?? 'web';
  }

  /** Llamar una sola vez al arrancar la app */
  async initialize(): Promise<void> {
    if (!this.isNative) return;

    await Promise.all([
      this.setupStatusBar(),
      this.setupSplashScreen(),
      this.setupKeyboard(),
      this.setupBackButton(),
    ]);
  }

  // ── StatusBar ───────────────────────────────────────────
  private async setupStatusBar(): Promise<void> {
    try {
      const { StatusBar, Style } = await import('@capacitor/status-bar');
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#020617' });
      await StatusBar.show();
    } catch { /* plugin no disponible en web */ }
  }

  // ── SplashScreen ────────────────────────────────────────
  private async setupSplashScreen(): Promise<void> {
    try {
      const { SplashScreen } = await import('@capacitor/splash-screen');
      // Oculta el splash cuando Angular termina de cargar
      await SplashScreen.hide({ fadeOutDuration: 300 });
    } catch { /* plugin no disponible en web */ }
  }

  // ── Keyboard ────────────────────────────────────────────
  private async setupKeyboard(): Promise<void> {
    try {
      const { Keyboard } = await import('@capacitor/keyboard');
      Keyboard.addListener('keyboardWillShow', () => {
        document.body.classList.add('keyboard-open');
      });
      Keyboard.addListener('keyboardWillHide', () => {
        document.body.classList.remove('keyboard-open');
      });
    } catch { /* plugin no disponible en web */ }
  }

  // ── App (back button Android) ────────────────────────────
  private async setupBackButton(): Promise<void> {
    try {
      const { App } = await import('@capacitor/app');

      // Historial de rutas visitadas para simular back
      const history: string[] = [];
      this.router.events
        .pipe(filter(e => e instanceof NavigationEnd))
        .subscribe(e => {
          history.push((e as NavigationEnd).urlAfterRedirects);
        });

      App.addListener('backButton', ({ canGoBack }) => {
        if (history.length > 1) {
          history.pop();
          this.router.navigateByUrl(history[history.length - 1]);
        } else if (!canGoBack) {
          App.exitApp();
        } else {
          window.history.back();
        }
      });
    } catch { /* plugin no disponible en web */ }
  }

  /** Oculta el teclado si está visible (útil al cambiar de página) */
  async hideKeyboard(): Promise<void> {
    if (!this.isNative) return;
    try {
      const { Keyboard } = await import('@capacitor/keyboard');
      await Keyboard.hide();
    } catch {}
  }

  /** Feedback háptico ligero (Android e iOS) */
  async hapticLight(): Promise<void> {
    if (!this.isNative) return;
    try {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {}
  }
}
