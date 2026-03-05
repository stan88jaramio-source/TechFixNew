# TechFix Pro — Migrated Stack

> **Angular 19 + .NET Core 8 + SQL Server**

Migración completa desde React + FastAPI + MongoDB.

---

## Estructura del proyecto

```
TechFix-migrated/
├── backend/
│   └── TechFix.API/          ← .NET Core 8 Web API
├── frontend/
│   └── techfix-angular/      ← Angular 19 SPA
└── database/
    └── schema.sql            ← Script SQL Server (opcional)
```

---

## Backend — .NET Core 8

### Requisitos
- .NET 8 SDK
- SQL Server 2019+ (o Azure SQL / SQL Server Express)

### Configuración

Edita `backend/TechFix.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=TechFixDB;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "tu-clave-secreta-minimo-32-caracteres",
    "Issuer": "TechFix.API",
    "Audience": "TechFix.Client",
    "ExpireHours": 24
  },
  "AllowedOrigins": "http://localhost:4200"
}
```

### Ejecutar migraciones y levantar API

```bash
cd backend/TechFix.API

# Instalar herramientas EF (primera vez)
dotnet tool install --global dotnet-ef

# Crear la primera migración
dotnet ef migrations add InitialCreate

# Aplicar migración (crea la BD y tablas automáticamente)
dotnet ef database update

# Levantar API en http://localhost:5000
dotnet run
```

> La API crea automáticamente el usuario admin al iniciar:
> - **Email:** `admin@techfix.com`
> - **Password:** `admin123`

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Usuario actual |
| GET/POST | `/api/clients` | Listar / Crear clientes |
| GET/PUT/DELETE | `/api/clients/{id}` | Detalle / Editar / Eliminar |
| GET/POST | `/api/repairs` | Listar / Crear reparaciones |
| GET/PUT/DELETE | `/api/repairs/{id}` | Detalle / Editar / Eliminar |
| PATCH | `/api/repairs/{id}/status` | Cambiar estado |
| GET | `/api/dashboard/stats` | Estadísticas dashboard |

Swagger UI disponible en: `http://localhost:5000/swagger`

---

## Frontend — Angular 19

### Requisitos
- Node.js 20+
- Angular CLI 19: `npm install -g @angular/cli`

### Configuración

Edita `frontend/techfix-angular/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

### Instalar y levantar

```bash
cd frontend/techfix-angular
npm install
ng serve
```

Abre `http://localhost:4200`

### Build producción

```bash
ng build --configuration production
```

Los archivos estáticos quedan en `dist/techfix-angular/browser/`.

---

## Base de Datos — SQL Server

Las migraciones EF Core crean la BD automáticamente con `dotnet run`.

Si prefieres ejecutar el script SQL manualmente:

```sql
-- En SQL Server Management Studio o sqlcmd:
sqlcmd -S localhost -E -i database/schema.sql
```

### Tablas

| Tabla | Descripción |
|-------|-------------|
| `Users` | Usuarios del sistema con contraseña BCrypt |
| `Clients` | Clientes del taller |
| `Repairs` | Órdenes de reparación con flujo de estados |

---

## Funcionalidades migradas ✅

- [x] Autenticación JWT (login/registro/me)
- [x] Dashboard con estadísticas en tiempo real
- [x] CRUD completo de Clientes
- [x] CRUD completo de Reparaciones
- [x] Flujo de estados: Recibido → Diagnóstico → Reparando → Listo → Entregado
- [x] Historial de reparaciones por cliente
- [x] Botón WhatsApp flotante + mensajes por reparación
- [x] Generación de tickets PDF estilo térmico
- [x] Búsqueda y filtrado en tiempo real
- [x] Tema dark cyberpunk con glassmorphism (Tailwind CSS)
- [x] Diseño responsive (mobile/tablet/desktop)
- [x] Auth guard en rutas protegidas
- [x] HTTP interceptor para JWT automático

---

## Credenciales por defecto

| Campo | Valor |
|-------|-------|
| Email | `admin@techfix.com` |
| Contraseña | `admin123` |
