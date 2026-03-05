export type RepairStatus = 'recibido' | 'diagnostico' | 'reparando' | 'listo' | 'entregado';

export const REPAIR_STATUSES: { value: RepairStatus; label: string }[] = [
  { value: 'recibido',    label: 'Recibido' },
  { value: 'diagnostico', label: 'En Diagnóstico' },
  { value: 'reparando',   label: 'Reparando' },
  { value: 'listo',       label: 'Listo' },
  { value: 'entregado',   label: 'Entregado' },
];

export interface RepairOrder {
  id: string;
  orderNumber: string;
  clientId: string;
  clientName?: string;
  clientPhone?: string;
  deviceBrand: string;
  deviceModel: string;
  imei?: string;
  issueDescription: string;
  status: RepairStatus;
  estimatedCost?: number;
  finalCost?: number;
  technicianNotes?: string;
  accessories?: string;
  estimatedCompletion?: string;
  createdAt: string;
  updatedAt: string;
  photos?: string[];
  repairResult?: 'si' | 'no';
}

export interface RepairCreateRequest {
  clientId: string;
  deviceBrand: string;
  deviceModel: string;
  imei?: string;
  issueDescription: string;
  estimatedCost?: number;
  estimatedCompletion?: string;
  accessories?: string;
  photos?: string[];
}

export interface RepairUpdateRequest {
  deviceBrand?: string;
  deviceModel?: string;
  imei?: string;
  issueDescription?: string;
  estimatedCost?: number;
  finalCost?: number;
  technicianNotes?: string;
  estimatedCompletion?: string;
  accessories?: string;
  repairResult?: 'si' | 'no';
}

export interface DashboardStats {
  totalRepairs: number;
  totalClients: number;
  pendingRepairs: number;
  completedToday: number;
  statusCounts: Record<RepairStatus, number>;
  recentRepairs: RepairOrder[];
  totalRevenue?: number;
}

/** Respuesta pública del endpoint /track/:orderNumber (sin datos sensibles) */
export interface TrackingRepair {
  orderNumber: string;
  deviceBrand: string;
  deviceModel: string;
  status: RepairStatus;
  estimatedCompletion?: string;
  createdAt: string;
  updatedAt: string;
  shopName: string;
  repairResult?: 'si' | 'no';
}
