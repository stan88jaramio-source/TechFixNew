import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'clientes',
        loadComponent: () => import('./pages/clients/clients.component').then(m => m.ClientsComponent),
      },
      {
        path: 'clientes/:id',
        loadComponent: () => import('./pages/client-detail/client-detail.component').then(m => m.ClientDetailComponent),
      },
      {
        path: 'reparaciones',
        loadComponent: () => import('./pages/repairs/repairs.component').then(m => m.RepairsComponent),
      },
      {
        path: 'reparaciones/nueva',
        loadComponent: () => import('./pages/new-repair/new-repair.component').then(m => m.NewRepairComponent),
      },
      {
        path: 'reparaciones/:id',
        loadComponent: () => import('./pages/repair-detail/repair-detail.component').then(m => m.RepairDetailComponent),
      },
      {
        path: 'configuracion',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
      },
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  // Página pública de seguimiento — sin autenticación, accesible desde el link de WhatsApp
  {
    path: 'seguimiento/:orderNumber',
    loadComponent: () => import('./pages/tracking/tracking.component').then(m => m.TrackingComponent),
  },
  { path: '**', redirectTo: '' }
];
