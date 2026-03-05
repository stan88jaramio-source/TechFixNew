import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { RepairStatus } from '../../models/repair.model';

const STATUS_CONFIG: Record<RepairStatus, { label: string; cls: string }> = {
  recibido:    { label: 'Recibido',       cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  diagnostico: { label: 'En Diagnóstico', cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  reparando:   { label: 'Reparando',      cls: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  listo:       { label: 'Listo',          cls: 'bg-green-500/20 text-green-400 border-green-500/30' },
  entregado:   { label: 'Entregado',      cls: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [NgClass],
  template: `
    <span
      class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
      [ngClass]="config.cls">
      <span class="w-1.5 h-1.5 rounded-full bg-current opacity-80"></span>
      {{ config.label }}
    </span>
  `
})
export class StatusBadgeComponent {
  status = input.required<RepairStatus>();

  get config() {
    return STATUS_CONFIG[this.status()] ?? { label: this.status(), cls: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
  }
}
