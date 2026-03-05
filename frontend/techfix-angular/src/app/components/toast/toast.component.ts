import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="flex items-start gap-3 px-4 py-3 rounded-lg border text-sm shadow-lg fade-in transition-all"
          [ngClass]="{
            'bg-green-900/90 border-green-500/40 text-green-300': toast.type === 'success',
            'bg-red-900/90 border-red-500/40 text-red-300':       toast.type === 'error',
            'bg-blue-900/90 border-blue-500/40 text-blue-300':    toast.type === 'info'
          }">
          <span class="flex-1">{{ toast.message }}</span>
          <button class="opacity-60 hover:opacity-100 text-current" (click)="toastService.remove(toast.id)">✕</button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  toastService = inject(ToastService);
}
