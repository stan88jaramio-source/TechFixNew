# Guía de Desarrollo Móvil — TechFix / Aguirre Fix Pro

Esta app usa **Capacitor 8** para envolver la app Angular y ejecutarla como app nativa en **Android** e **iOS**.

---

## Arquitectura

```
Angular (TypeScript)  →  ng build  →  dist/  →  Capacitor Sync  →  Android / iOS
```

| Capa | Tecnología |
|------|-----------|
| UI | Angular 19 + Tailwind CSS |
| Bridge nativo | Capacitor 8 |
| Android | Gradle / Android Studio |
| iOS | Xcode (requiere macOS) |

---

## Requisitos previos

### Android
- **Android Studio** Hedgehog o superior → https://developer.android.com/studio
- JDK 17+ (incluido con Android Studio)
- Android SDK API 22+ (Android 5.0 Lollipop mínimo)
- Variable de entorno `ANDROID_HOME` configurada

### iOS (solo macOS)
- **Xcode** 15+ desde la App Store
- CocoaPods: `sudo gem install cocoapods`
- Cuenta de desarrollo Apple (gratuita para pruebas en dispositivo)

---

## Scripts disponibles

```bash
# Compilar para móvil (genera dist/ con environment.mobile.ts)
npm run build:mobile

# Compilar + sincronizar ambas plataformas
npm run cap:sync

# Android: compilar, sincronizar y abrir Android Studio
npm run cap:android

# iOS: compilar, sincronizar y abrir Xcode
npm run cap:ios

# Android: correr directamente en emulador/dispositivo
npm run cap:run:android

# iOS: correr directamente en simulador/dispositivo
npm run cap:run:ios
```

---

## Flujo de trabajo diario

```bash
# 1. Hacer cambios en el código Angular
# 2. Compilar y sincronizar
npm run cap:sync

# 3a. Abrir Android Studio y correr desde ahí
npm run cap:android

# 3b. O correr directamente (si ya hay un emulador activo)
npm run cap:run:android
```

### Desarrollo en vivo con dispositivo físico (Hot Reload)
1. Descomentar en `capacitor.config.ts`:
   ```ts
   server: {
     url: 'http://TU_IP_LOCAL:4200',
     cleartext: true
   }
   ```
2. Iniciar el servidor Angular: `ng serve`
3. Sincronizar Capacitor: `npx cap sync`
4. Correr en dispositivo: `npm run cap:run:android`

---

## Agregar plataforma iOS

```bash
npm run build:mobile
npx cap add ios
npx cap sync ios
npx cap open ios   # abre Xcode
```
> ⚠️ Requiere macOS con Xcode instalado.

---

## Plugins nativos instalados

| Plugin | Función |
|--------|---------|
| `@capacitor/status-bar` | Color y estilo de la barra de estado |
| `@capacitor/splash-screen` | Pantalla de carga personalizada |
| `@capacitor/keyboard` | Manejo del teclado virtual (resize, eventos) |
| `@capacitor/haptics` | Vibración / feedback táctil |
| `@capacitor/app` | Botón Back Android, ciclo de vida de la app |

Todos se inicializan automáticamente vía `CapacitorService` en `APP_INITIALIZER`.  
En el navegador web son no-ops seguros (la app sigue funcionando normalmente).

---

## API URL para producción

Editar `src/environments/environment.mobile.ts`:

```ts
export const environment = {
  production: true,
  isMobile: true,
  apiUrl: 'https://TU_DOMINIO.com/api',  // ← tu backend desplegado
};
```

---

## Publicar en Google Play / App Store

### Google Play (Android)
1. `npm run build:mobile`
2. `npx cap sync android`
3. Abrir Android Studio → **Build → Generate Signed Bundle/APK**
4. Crear keystore si no existe
5. Subir el `.aab` a Google Play Console

### App Store (iOS — macOS requerido)
1. `npm run build:mobile`
2. `npx cap sync ios`
3. Abrir Xcode → seleccionar tu Team de Apple Developer
4. **Product → Archive** → distribuir mediante App Store Connect

---

## Estructura de archivos móviles

```
frontend/techfix-angular/
├── capacitor.config.ts          # Config central de Capacitor
├── android/                     # Proyecto Android nativo (Android Studio)
│   └── app/src/main/
│       ├── AndroidManifest.xml
│       └── res/values/styles.xml
├── ios/                         # Proyecto iOS (generado al hacer cap add ios)
└── src/
    ├── app/services/
    │   └── capacitor.service.ts # Inicialización de plugins nativos
    └── environments/
        ├── environment.ts            # Web local
        ├── environment.production.ts # Web producción
        └── environment.mobile.ts     # Android / iOS
```
